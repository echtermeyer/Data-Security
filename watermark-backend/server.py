import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api_routes import api_router

app = FastAPI(
    title="Image Watermarking API",
    description="API for embedding, extracting, and benchmarking image watermarking algorithms (LSB, DCT, DWT, Deep).",
    version="1.0.0",
)

origins = [
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://d352gwnf8fwgii.cloudfront.net",
    "http://d352gwnf8fwgii.cloudfront.net",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/", include_in_schema=False)
async def root():
    return {"message": "Welcome to the Watermarking API. See /docs for endpoints."}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
