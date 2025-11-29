import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # 1. Import CORSMiddleware
from src.api_routes import api_router

app = FastAPI(
    title="Image Watermarking API",
    description="API for embedding, extracting, and benchmarking image watermarking algorithms (LSB, DCT, DWT, Deep).",
    version="1.0.0",
)

# 2. Define allowed origins (your frontend URLs)
origins = [
    "http://localhost:5174",  # <--- YOUR FRONTEND URL
    "http://127.0.0.1:5174",
    # Add your production frontend domain here when deployed
]

# 3. Add CORSMiddleware to your application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows requests from your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

app.include_router(api_router)


@app.get("/", include_in_schema=False)
async def root():
    return {"message": "Welcome to the Watermarking API. See /docs for endpoints."}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
