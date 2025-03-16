from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch

model_name = "medalpaca/medalpaca-7b"

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Load model with 8-bit precision
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    load_in_8bit=True,  # Reduces VRAM usage
    device_map="auto"   # Distributes across available GPU/CPU
)

# Create pipeline
pl = pipeline("text-generation", model=model, tokenizer=tokenizer, pad_token_id=tokenizer.eos_token_id)

# Test inference
question = "What could be my problem if I am having an intense throbbing pain in my lower back, i havent drank much water at all because it hurts to move, and i have a fever?"
context = "You are a medical expert. You will be given a question. Answer the question that the patient asked"
answer = pl(f"Context: {context}\n\nQuestion: {question}\n\nAnswer: ")

print(answer)
