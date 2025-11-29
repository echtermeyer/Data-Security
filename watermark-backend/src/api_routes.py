from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from .schemas import (
    EmbedRequest,
    EmbedResponse,
    ExtractRequest,
    ExtractResponse,
    BenchmarkRequest,
    BenchmarkResponse,
    WatermarkAlgorithm,
    AlgorithmMetrics,
)

MOCK_BENCHMARK_RESULTS: Dict[WatermarkAlgorithm, AlgorithmMetrics] = {
    "lsb": AlgorithmMetrics(
        embed_time=0.023, extract_time=0.018, psnr=42.3, ssim=0.991
    ),
    "dct": AlgorithmMetrics(
        embed_time=0.156, extract_time=0.142, psnr=38.7, ssim=0.967
    ),
    "dwt": AlgorithmMetrics(
        embed_time=0.189, extract_time=0.171, psnr=40.1, ssim=0.978
    ),
    "deep": AlgorithmMetrics(
        embed_time=0.842, extract_time=0.731, psnr=44.8, ssim=0.995
    ),
}

api_router = APIRouter(prefix="/api", tags=["Watermark"])


@api_router.post(
    "/embed", response_model=EmbedResponse, summary="Embed a watermark into an image."
)
async def embed_watermark_endpoint(request: EmbedRequest):
    try:
        print(f"Embedding '{request.message[:20]}...' using {request.algorithm}...")

        watermarked_image_b64 = request.image

        return EmbedResponse(watermarked_image=watermarked_image_b64)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Watermark embedding failed: {e}")


@api_router.post(
    "/extract",
    response_model=ExtractResponse,
    summary="Extract a watermark message from an image.",
)
async def extract_watermark_endpoint(request: ExtractRequest):
    try:
        print(f"Extracting watermark using {request.algorithm}...")

        message = f"Extracted successfully by {request.algorithm} algorithm."
        success = True

        return ExtractResponse(message=message, success=success)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Watermark extraction failed: {e}")


@api_router.post(
    "/benchmark",
    response_model=BenchmarkResponse,
    summary="Run a benchmark test with all algorithms.",
)
async def benchmark_endpoint(request: BenchmarkRequest):
    try:
        print("Running full benchmark simulation...")

        results: Dict[WatermarkAlgorithm, AlgorithmMetrics] = {}

        for algo in MOCK_BENCHMARK_RESULTS.keys():
            results[algo] = MOCK_BENCHMARK_RESULTS[algo]

        return BenchmarkResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark test failed: {e}")
