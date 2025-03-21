from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import googlemaps
from fastapi.responses import JSONResponse

app = FastAPI()



# Mount static files
app.mount("/frontend", StaticFiles(directory="frontend", html=True), name="frontend")

# Set up Google Maps client early on
API_KEY = os.environ.get("GOOGLE_API_KEY")
print("Google API KEY is:", API_KEY)
if not API_KEY:
    raise Exception("Google API key not found. Please set the GOOGLE_API_KEY environment variable.")
gmaps = googlemaps.Client(key=API_KEY)


@app.get("/test")
def test_endpoint():
    return {"message": "Test endpoint works"}
"""
# Define /find_places endpoint before heavy initializations
@app.get("/find_places")
def find_places(latitude: float, longitude: float):
    print(f"find_places called with {latitude}, {longitude}")
    try:
        places_result = gmaps.places_nearby(
            location=(latitude, longitude),
            radius=5000,
            type="hospital"
        )
        return JSONResponse(content=places_result)
    except Exception as e:
        return JSONResponse(content={"error": str(e)})

# Now import and initialize heavy modules after registering basic routes
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch
import requests
# (Other imports as needed)

class ChatRequest(BaseModel):
    chat_log: list[str]
    user_info: dict 
    question: str

model_name = "medalpaca/medalpaca-7b"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name, 
    load_in_8bit=True, 
    device_map="auto",
    llm_int8_enable_fp32_cpu_offload=True
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
    generated_text = pl(f"Context: {context}\n\nQuestion: {request.question}\n\nAnswer: ", max_new_tokens=100)
    answer = generated_text[0]['generated_text']
    answer_start = answer.find("Answer: ") + len("Answer: ")
    clean_answer = answer[answer_start:].strip()
    return {"response": clean_answer}
"""
