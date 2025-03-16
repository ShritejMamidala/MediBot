from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch
from fastapi import HTTPException
import requests
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

app.mount("/frontend", StaticFiles(directory="frontend", html=True), name="frontend")

class ChatRequest(BaseModel):
    chat_log: list[str]
    user_info: dict 
    question: str

model_name = "medalpaca/medalpaca-7b"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, load_in_8bit=True, device_map="auto")
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

    # Clean up the response to only include the answer
    answer_start = answer.find("Answer: ") + len("Answer: ")
    clean_answer = answer[answer_start:].strip()

    return {"response": clean_answer}

@app.get("/find_places")
async def find_places(latitude: float, longitude: float):
    api_key = 'AIzaSyD-LwPVu4Wns3xHzOBmUZLITGc1oesheic'
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{latitude},{longitude}",
        "radius": 5000,
        "type": "hospital|doctor",
        "key": api_key
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=400, detail="Error fetching data from Google Places API")