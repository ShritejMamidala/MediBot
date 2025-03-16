from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch

# Initialize FastAPI app
app = FastAPI()

# Define request model
class ChatRequest(BaseModel):
    question: str

# Load model and tokenizer
model_name = "medalpaca/medalpaca-7b"

tokenizer = AutoTokenizer.from_pretrained(model_name)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    load_in_8bit=True,
    device_map="auto"
)

# Create pipeline
pl = pipeline("text-generation", model=model, tokenizer=tokenizer, pad_token_id=tokenizer.eos_token_id)

@app.get("/")
def read_root():
    return {"message": "Welcome to the MediBot API!"}

@app.post("/chat")
def chat(request: ChatRequest):
    context = "You are a medical expert. You will be given a question. Answer the question that the patient asked."

    # Generate model response
    response = pl(f"Context: {context}\n\nQuestion: {request.question}\n\nAnswer: ", max_new_tokens=100)

    return {"response": response[0]['generated_text']}

