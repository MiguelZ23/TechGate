from typing import Annotated, Literal
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from .models import AnalysisResponse
from .scoring import analyze_image_placeholder, analyze_text

app = FastAPI(title="TechGate API", description="AI-powered protection against digital scams for the OUPI Cyber Clinic Contest.", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "http://localhost:5173"], allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["*"])

@app.get("/health")
def health() -> dict[str, str]: return {"status": "ok"}

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze(input_type: Annotated[Literal["text", "image"], Form()], message: Annotated[str | None, Form()] = None, image: Annotated[UploadFile | None, File()] = None) -> AnalysisResponse:
    if input_type == "text":
        if not message or not message.strip(): raise HTTPException(status_code=422, detail="A message is required for text analysis.")
        if len(message) > 5000: raise HTTPException(status_code=413, detail="Messages must be 5,000 characters or fewer.")
        return analyze_text(message)
    if image is None: raise HTTPException(status_code=422, detail="An image is required for screenshot analysis.")
    if image.content_type not in {"image/png", "image/jpeg", "image/webp"}: raise HTTPException(status_code=415, detail="Use a PNG, JPG, or WebP image.")
    contents = await image.read(10 * 1024 * 1024 + 1)
    if len(contents) > 10 * 1024 * 1024: raise HTTPException(status_code=413, detail="Images must be 10 MB or smaller.")
    return analyze_image_placeholder(image.filename)
