import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes.quiz import router as quiz_router

load_dotenv()

app = FastAPI(
    title="DeepKlarity Wiki Quiz Generator",
    description="AI-powered quiz generator from Wikipedia articles",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz_router, prefix="/api", tags=["quiz"])

@app.get("/")
async def root():
    return {"message": "DeepKlarity Wiki Quiz Generator API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
