from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Any, Dict, Optional


app = FastAPI()
# Allow all origins for CORS (you can specify allowed origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to specific origins
    allow_credentials=True,
    allow_methods=["*"],  # This allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # This allows all headers
)


class Payload(BaseModel):
    prompt: str
    # Add other fields that might be part of model_kwargs
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None


@app.post("/generate")
async def generate(payload: Payload):
    try:
        print(payload)
        # Simulate processing the prompt (e.g., calling a language model)
        prompt = payload.prompt
        # request the model to generate text
        total_text = "Human and AI collaboration is revolutionizing various fields, blending human creativity and empathy with AI's precision and efficiency to achieve unprecedented advancements."
        completion_text = total_text[len(prompt):]
        # Construct the response as expected by the client
        response = {"choices": [{"text": completion_text}]}
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
