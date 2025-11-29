from pydantic import BaseModel, Field
from typing import Literal, Dict, Any


class AlgorithmMetrics(BaseModel):
    embed_time: float = Field(...)
    extract_time: float = Field(...)
    psnr: float = Field(...)
    ssim: float = Field(...)


WatermarkAlgorithm = Literal["lsb", "dct", "dwt", "deep"]


class EmbedRequest(BaseModel):
    image: str = Field(...)
    message: str = Field(...)
    algorithm: WatermarkAlgorithm = Field(...)


class ExtractRequest(BaseModel):
    image: str = Field(...)
    algorithm: WatermarkAlgorithm = Field(...)


class BenchmarkRequest(BaseModel):
    image: str = Field(...)
    message: str = Field(...)


class EmbedResponse(BaseModel):
    watermarked_image: str = Field(...)


class ExtractResponse(BaseModel):
    message: str = Field(...)
    success: bool = Field(...)


class BenchmarkResponse(BaseModel):
    results: Dict[WatermarkAlgorithm, AlgorithmMetrics] = Field(...)
