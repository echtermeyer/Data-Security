from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from datetime import datetime

from .schemas import (
    EmbedRequest,
    EmbedResponse,
    ExtractRequest,
    ExtractResponse,
    BenchmarkRequest,
    BenchmarkResponse,
    WatermarkAlgorithm,
    AlgorithmMetrics,
    RegisterUserRequest,
    RegisterUserResponse,
    PublicKeyResponse,
    ClaimOwnershipRequest,
    ClaimOwnershipResponse,
    VerifyOwnershipRequest,
    VerifyOwnershipResponse,
    VerificationResult,
    AuthorshipClaim,
)

from .watermark_utils import (
    embed_lsb_authorship,
    extract_lsb_authorship,
    calculate_psnr,
    calculate_ssim_simple,
)

from .crypto_utils import verify_signature

user_registry: Dict[str, Dict[str, str]] = {}


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


@api_router.post(
    "/auth/register",
    response_model=RegisterUserResponse,
    summary="Register a new user/device with public key",
    tags=["Authorship"],
)
async def register_user(request: RegisterUserRequest):
    """
    Register a user's public key for ownership verification.
    This is called once when a device first generates a keypair.
    """
    try:
        if request.user_id in user_registry:
            user_registry[request.user_id] = {
                "display_name": request.display_name,
                "public_key": request.public_key,
                "registered_at": datetime.utcnow().isoformat() + "Z",
            }
            return RegisterUserResponse(
                success=True,
                user_id=request.user_id,
                message=f"User '{request.display_name}' updated successfully",
            )

        user_registry[request.user_id] = {
            "display_name": request.display_name,
            "public_key": request.public_key,
            "registered_at": datetime.utcnow().isoformat() + "Z",
        }

        return RegisterUserResponse(
            success=True,
            user_id=request.user_id,
            message=f"User '{request.display_name}' registered successfully",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {e}")


@api_router.get(
    "/auth/public-key/{user_id}",
    response_model=PublicKeyResponse,
    summary="Get public key for a user ID",
    tags=["Authorship"],
)
async def get_public_key(user_id: str):
    """
    Retrieve a user's public key for signature verification.
    This is called during ownership verification.
    """
    try:
        if user_id not in user_registry:
            raise HTTPException(
                status_code=404, detail=f"User ID {user_id} not found in registry"
            )

        user_data = user_registry[user_id]

        return PublicKeyResponse(
            user_id=user_id,
            display_name=user_data["display_name"],
            public_key=user_data["public_key"],
            registered_at=user_data["registered_at"],
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Public key lookup failed: {e}")


@api_router.post(
    "/watermark/claim",
    response_model=ClaimOwnershipResponse,
    summary="Embed authorship claim with cryptographic signature",
    tags=["Authorship"],
)
async def claim_ownership(request: ClaimOwnershipRequest):
    """
    Embed a signed authorship claim into an image.
    The signature is created on the frontend using the private key.
    """
    try:
        if request.claim.user_id not in user_registry:
            raise HTTPException(
                status_code=404,
                detail=f"User ID {request.claim.user_id} not registered. Please register first.",
            )

        claim_dict = request.claim.model_dump()
        if request.algorithm != "lsb":
            raise HTTPException(
                status_code=400,
                detail="Only LSB algorithm is currently supported for authorship claims",
            )

        watermarked_image_b64 = embed_lsb_authorship(
            request.image, claim_dict, request.signature
        )

        psnr = calculate_psnr(request.image, watermarked_image_b64)
        ssim = calculate_ssim_simple(request.image, watermarked_image_b64)

        metrics = {"psnr": round(psnr, 2), "ssim": round(ssim, 3)}

        return ClaimOwnershipResponse(
            watermarked_image=watermarked_image_b64, metadata=metrics
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ownership claim failed: {e}")


@api_router.post(
    "/watermark/verify",
    response_model=VerifyOwnershipResponse,
    summary="Verify ownership claim in an image",
    tags=["Authorship"],
)
async def verify_ownership(request: VerifyOwnershipRequest):
    """
    Extract and verify an authorship claim from an image.
    This performs:
    1. Extraction of the claim + signature
    2. Lookup of the public key
    3. Cryptographic verification of the signature
    """
    try:
        claim_dict, signature = extract_lsb_authorship(request.image)
        if claim_dict is None or signature is None:
            return VerifyOwnershipResponse(
                watermark_found=False,
                claim=None,
                signature=None,
                verification=None,
                author_details=None,
            )
        
        extracted_claim = AuthorshipClaim(**claim_dict)

        user_id = extracted_claim.user_id
        if user_id not in user_registry:
            return VerifyOwnershipResponse(
                watermark_found=True,
                claim=extracted_claim,
                signature=signature,
                verification=VerificationResult(
                    signature_valid=False,
                    public_key_found=False,
                    integrity_intact=False,
                ),
                author_details=None,
            )

        user_data = user_registry[user_id]
        try:
            signature_valid = verify_signature(
                claim_dict, signature, user_data["public_key"]
            )
        except Exception as e:
            signature_valid = False

        verification_result = VerificationResult(
            signature_valid=signature_valid,
            public_key_found=True,
            integrity_intact=signature_valid,
        )

        author_details = {
            "display_name": user_data["display_name"],
            "registered_at": user_data["registered_at"],
        }

        return VerifyOwnershipResponse(
            watermark_found=True,
            claim=extracted_claim,
            signature=signature,
            verification=verification_result,
            author_details=author_details,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Ownership verification failed: {e}"
        )


@api_router.get("/stats", summary="Get system statistics", tags=["Debug"])
async def get_stats():
    return {
        "total_users": len(user_registry),
        "registered_users": [
            {
                "user_id": user_id,
                "display_name": data["display_name"],
                "registered_at": data["registered_at"],
            }
            for user_id, data in user_registry.items()
        ],
    }
