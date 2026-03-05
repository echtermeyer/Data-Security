from pydantic import BaseModel, Field
from typing import Literal, Dict, Any, Optional


class AlgorithmMetrics(BaseModel):
    embed_time: float = Field(...)
    extract_time: float = Field(...)
    psnr: float = Field(...)
    ssim: float = Field(...)


WatermarkAlgorithm = Literal["lsb", "dctdwt", "dctdwtsvd", "mbrs"]


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


class RegisterUserRequest(BaseModel):
    user_id: str = Field(..., description="UUID generated on frontend")
    display_name: str = Field(..., description="User's display name")
    public_key: str = Field(..., description="PEM-encoded RSA public key")


class RegisterUserResponse(BaseModel):
    success: bool = Field(...)
    user_id: str = Field(...)
    message: str = Field(...)


class PublicKeyResponse(BaseModel):
    user_id: str = Field(...)
    display_name: str = Field(...)
    public_key: str = Field(...)
    registered_at: str = Field(...)


class AuthorshipClaim(BaseModel):
    author_name: str = Field(...)
    user_id: str = Field(...)
    timestamp: str = Field(...)
    message: Optional[str] = Field(
        default=None, description="Optional message embedded with the claim"
    )


class ClaimOwnershipRequest(BaseModel):
    image: str = Field(..., description="Base64-encoded image")
    claim: AuthorshipClaim = Field(..., description="Authorship claim metadata")
    signature: str = Field(..., description="Cryptographic signature of claim hash")
    algorithm: WatermarkAlgorithm = Field(default="lsb")


class ClaimOwnershipResponse(BaseModel):
    watermarked_image: str = Field(..., description="Base64-encoded watermarked image")
    metadata: Optional[Dict[str, float]] = Field(
        default=None, description="PSNR/SSIM metrics"
    )


class VerifyOwnershipRequest(BaseModel):
    image: str = Field(..., description="Base64-encoded image to verify")


class VerificationResult(BaseModel):
    signature_valid: bool = Field(...)
    public_key_found: bool = Field(...)
    integrity_intact: bool = Field(...)


class VerifyOwnershipResponse(BaseModel):
    watermark_found: bool = Field(...)
    claim: Optional[AuthorshipClaim] = Field(default=None)
    signature: Optional[str] = Field(default=None)
    verification: Optional[VerificationResult] = Field(default=None)
    author_details: Optional[Dict[str, str]] = Field(default=None)
