import base64
import json

from io import BytesIO
from PIL import Image

import numpy as np


def string_to_binary(text: str) -> str:
    return "".join(format(ord(char), "08b") for char in text)


def binary_to_string(binary: str) -> str:
    chars = [binary[i : i + 8] for i in range(0, len(binary), 8)]
    return "".join(chr(int(char, 2)) for char in chars)


def embed_lsb_authorship(image_b64: str, claim_data: dict, signature: str) -> str:
    """
    Embed authorship claim + signature into image using LSB.

    Args:
        image_b64: Base64-encoded input image
        claim_data: Dictionary containing claim metadata
        signature: Cryptographic signature string

    Returns:
        Base64-encoded watermarked image
    """
    # Decode base64 image
    image_bytes = base64.b64decode(image_b64)
    image = Image.open(BytesIO(image_bytes))
    image = image.convert("RGB")

    # Create the package to embed
    package = {"claim": claim_data, "signature": signature}

    # Convert package to JSON string
    package_json = json.dumps(package)

    # Add delimiter and length prefix for extraction
    message = f"{len(package_json)}:{package_json}"

    # Convert message to binary
    binary_message = string_to_binary(message)

    # Add terminator
    binary_message += "1111111111111110"  # 16-bit terminator

    # Convert image to numpy array
    img_array = np.array(image)

    # Flatten image array
    flat_img = img_array.flatten()

    # Check if message fits
    if len(binary_message) > len(flat_img):
        raise ValueError(
            f"Message too large for image. Need {len(binary_message)} bits, have {len(flat_img)}"
        )

    # Embed binary message into LSB
    for i, bit in enumerate(binary_message):
        flat_img[i] = (flat_img[i] & 0xFE) | int(bit)

    # Reshape back to original image shape
    watermarked_array = flat_img.reshape(img_array.shape)

    # Convert back to PIL Image
    watermarked_image = Image.fromarray(watermarked_array.astype("uint8"), "RGB")

    # Convert to base64
    buffered = BytesIO()
    watermarked_image.save(buffered, format="PNG")
    watermarked_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return watermarked_b64


def extract_lsb_authorship(image_b64: str) -> tuple[dict, str]:
    """
    Extract authorship claim + signature from watermarked image.

    Args:
        image_b64: Base64-encoded watermarked image

    Returns:
        Tuple of (claim_dict, signature_string)
        Returns (None, None) if no valid watermark found
    """
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_b64)
        image = Image.open(BytesIO(image_bytes))
        image = image.convert("RGB")

        # Convert to numpy array and flatten
        img_array = np.array(image)
        flat_img = img_array.flatten()

        # Extract LSB bits
        binary_data = "".join(str(pixel & 1) for pixel in flat_img)

        # Look for terminator
        terminator = "1111111111111110"
        terminator_index = binary_data.find(terminator)

        if terminator_index == -1:
            return None, None

        # Extract message before terminator
        binary_message = binary_data[:terminator_index]

        # Convert binary to string
        extracted_text = binary_to_string(binary_message)

        # Parse length prefix
        if ":" not in extracted_text:
            return None, None

        length_str, package_json = extracted_text.split(":", 1)
        expected_length = int(length_str)

        # Verify length
        if len(package_json) != expected_length:
            return None, None

        # Parse JSON package
        package = json.loads(package_json)

        claim = package.get("claim")
        signature = package.get("signature")

        return claim, signature

    except Exception as e:
        print(f"Extraction error: {e}")
        return None, None


def calculate_psnr(original_b64: str, watermarked_b64: str) -> float:
    """Calculate PSNR between original and watermarked images."""
    try:
        # Decode images
        orig_bytes = base64.b64decode(original_b64)
        wm_bytes = base64.b64decode(watermarked_b64)

        orig_img = Image.open(BytesIO(orig_bytes)).convert("RGB")
        wm_img = Image.open(BytesIO(wm_bytes)).convert("RGB")

        # Convert to numpy arrays
        orig_array = np.array(orig_img).astype(float)
        wm_array = np.array(wm_img).astype(float)

        # Calculate MSE
        mse = np.mean((orig_array - wm_array) ** 2)

        if mse == 0:
            return 100.0

        # Calculate PSNR
        max_pixel = 255.0
        psnr = 20 * np.log10(max_pixel / np.sqrt(mse))

        return float(psnr)
    except:
        return 0.0


def calculate_ssim_simple(original_b64: str, watermarked_b64: str) -> float:
    """Calculate simplified SSIM between images."""
    try:
        # Decode images
        orig_bytes = base64.b64decode(original_b64)
        wm_bytes = base64.b64decode(watermarked_b64)

        orig_img = Image.open(BytesIO(orig_bytes)).convert("RGB")
        wm_img = Image.open(BytesIO(wm_bytes)).convert("RGB")

        # Convert to numpy arrays
        orig_array = np.array(orig_img).astype(float)
        wm_array = np.array(wm_img).astype(float)

        # Simple correlation-based SSIM approximation
        mean_orig = np.mean(orig_array)
        mean_wm = np.mean(wm_array)

        var_orig = np.var(orig_array)
        var_wm = np.var(wm_array)

        covar = np.mean((orig_array - mean_orig) * (wm_array - mean_wm))

        c1 = (0.01 * 255) ** 2
        c2 = (0.03 * 255) ** 2

        ssim = ((2 * mean_orig * mean_wm + c1) * (2 * covar + c2)) / (
            (mean_orig**2 + mean_wm**2 + c1) * (var_orig + var_wm + c2)
        )

        return float(max(0.0, min(1.0, ssim)))
    except:
        return 0.0
