from fastapi import FastAPI, Query, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import requests
import math
import json
import base64
from openai import OpenAI

app = FastAPI()

# Mount static files
app.mount("/frontend", StaticFiles(directory="frontend", html=True), name="frontend")

API_KEY = os.environ.get("GOOGLE_API_KEY")
if not API_KEY:
    raise Exception("Google API key not found. Please set the GOOGLE_API_KEY environment variable.")

def haversine(lat1, lon1, lat2, lon2):
    """Compute the great-circle distance between two points (in kilometers)."""
    R = 6371  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def query_places(place_type: str, latitude: float, longitude: float, radius: float, max_count: int):
    url = "https://places.googleapis.com/v1/places:searchNearby"
    payload = {
        "includedTypes": [place_type],
        "maxResultCount": max_count,
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "radius": radius
            }
        }
    }
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.location,places.rating,places.websiteUri,places.photos,places.internationalPhoneNumber"
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.json()

def filter_places(data, latitude, longitude):
    filtered = []
    if "places" in data:
        for place in data["places"]:
            name = None
            if "displayName" in place and "text" in place["displayName"]:
                name = place["displayName"]["text"]

            distance = None
            if "location" in place:
                loc = place["location"]
                place_lat = loc.get("latitude")
                place_lon = loc.get("longitude")
                if place_lat is not None and place_lon is not None:
                    distance = haversine(latitude, longitude, place_lat, place_lon)

            rating = round(place["rating"], 1) if "rating" in place and place["rating"] is not None else None
            website = place.get("websiteUri", None)
            phone = place.get("internationalPhoneNumber", "N/A")
            photo_url = "N/A"
            if "photos" in place and isinstance(place["photos"], list) and len(place["photos"]) > 0:
                photo = place["photos"][0]
                if "name" in photo:
                    photo_url = f"https://places.googleapis.com/v1/{photo['name']}/media?maxHeightPx=400&maxWidthPx=400&key={API_KEY}"

            filtered.append({
                "name": name if name is not None else "Unnamed Place",
                "distance_km": round(distance, 2) if distance is not None else None,
                "rating": rating,
                "website": website if website else "N/A",
                "phone": phone,
                "photo": photo_url
            })
    return filtered

@app.get("/find_places")
def find_places(
    latitude: float = Query(..., description="Latitude of the search center"),
    longitude: float = Query(..., description="Longitude of the search center"),
    radius: float = Query(5000.0, description="Search radius in meters")
):
    try:
        hospitals_data = query_places("hospital", latitude, longitude, radius, max_count=5)
        hospitals = filter_places(hospitals_data, latitude, longitude)
        doctors_data = query_places("doctor", latitude, longitude, radius, max_count=5)
        doctors = filter_places(doctors_data, latitude, longitude)
        return JSONResponse(content={"hospitals": hospitals, "doctors": doctors})
    except Exception as e:
        return JSONResponse(content={"error": str(e)})

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

@app.post("/chat")
async def chat(
    question: str = Form(...),
    user_info: str = Form(...),
    chat_log: str = Form(...),
    image: UploadFile = File(None)
):
    # Parse JSON strings into Python objects
    user_info = json.loads(user_info)
    chat_history = json.loads(chat_log)
    
    # Build user information and chat history text
    user_info_text = "\n".join([f"{k}: {v}" for k, v in user_info.items()])
    chat_history_text = "\n".join(chat_history)
    
    system_message = {
        "role": "system",
        "content": (
            f"You are a medical expert chatbot in a simulation. You have the following user information:\n{user_info_text}\n\n"
            f"The conversation so far:\n{chat_history_text}\n\n"
            f"Now answer the user's latest question based on this information. YOUR RESPONSE WILL NOT BE USED TO HELP REAL PATIENTS."
        )
    }
    
    # Determine which model to call
    # If an image is provided, we'll use the vision-capable model "gpt-4o"
    model = "gpt-3.5-turbo"
    if image is not None:
        model = "gpt-4o"  # Vision-capable model
    
    # Build the user message.
    # If an image is provided, include it as a Base64-encoded data URL.
    if image is not None:
        image_bytes = await image.read()
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        # Build the data URL – adjust the MIME type if needed (e.g., image/png)
        data_url = f"data:image/jpeg;base64,{image_b64}"
        user_message = {
            "role": "user",
            "content": [
                { "type": "text", "text": question },
                {
                    "type": "image_url",
                    "image_url": { "url": data_url }
                }
            ]
        }
    else:
        user_message = {
            "role": "user",
            "content": question
        }
    
    messages = [system_message, user_message]
    
    # Call the OpenAI chat endpoint with the prepared messages.
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.5,
        max_tokens=300
    )

    answer = response.choices[0].message.content.strip()
    return {"response": answer}
