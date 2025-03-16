from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch

# Initialize FastAPI app
app = FastAPI()

app.mount("/frontend", StaticFiles(directory="frontend", html=True), name="frontend")

class ChatRequest(BaseModel):
    chat_log: list[str]
    user_info: dict 
    question: str

model_name = "medalpaca/medalpaca-7b"

tokenizer = AutoTokenizer.from_pretrained(model_name)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    load_in_8bit=True, 
    device_map="auto"
)

pl = pipeline("text-generation", model=model, tokenizer=tokenizer, pad_token_id=tokenizer.eos_token_id)

@app.post("/chat")

def chat(request: ChatRequest):
    user_info_text = "\n".join([f"{k}: {v}" for k, v in request.user_info.items()])
    chat_history = "\n".join(request.chat_log)

    context = (
        f"You are a medical expert chatbot. You have the following user information:\n{user_info_text}\n\n"
        f"The conversation so far:\n{chat_history}\n\n"
        f"Now answer the user's latest question based on this information."
    )

    response = pl(f"Context: {context}\n\nQuestion: {request.question}\n\nAnswer: ", max_new_tokens=100)

    return {"response": response[0]['generated_text']}
