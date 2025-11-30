"""
Watermark Attack Methods - Unified Attacker Class

This module provides a unified interface for various watermark attacks:
- Distortions: brightness, contrast, blur, noise, JPEG compression
- Geometric: rotate, scale, crop
- Regeneration: diffusion-based attacks
- Local editing: region-based editing with ControlNet and UltraEdit
- Global editing: InstructPix2Pix, MagicBrush, UltraEdit
- Image-to-Video: SVD-based video generation
"""

from PIL import Image, ImageFilter, ImageEnhance
import numpy as np
import torch
import io
import random
from typing import Optional, Union, List


class Attacker:
    """
    Unified class for watermark robustness testing.
    Provides methods for various attack types on watermarked images.
    """

    def __init__(self, device: str = "cuda"):
        """
        Initialize the Attacker.

        Args:
            device: Device to use for attacks requiring models ('cuda' or 'cpu')
        """
        self.device = device
        self._models_loaded = {}

    # ==================== Distortion Attacks ====================

    def attack_brightness(
        self, image: Image.Image, factor: Optional[float] = None, seed: int = 0
    ) -> Image.Image:
        """
        Apply brightness distortion.

        Args:
            image: Input PIL Image
            factor: Brightness factor (1.0-2.0). If None, random value is used.
            seed: Random seed for reproducibility

        Returns:
            Distorted PIL Image
        """
        random.seed(seed)
        factor = factor if factor is not None else random.uniform(1.0, 2.0)
        enhancer = ImageEnhance.Brightness(image)
        return enhancer.enhance(factor)

    def attack_contrast(
        self, image: Image.Image, factor: Optional[float] = None, seed: int = 0
    ) -> Image.Image:
        """
        Apply contrast distortion.

        Args:
            image: Input PIL Image
            factor: Contrast factor (1.0-2.0). If None, random value is used.
            seed: Random seed for reproducibility

        Returns:
            Distorted PIL Image
        """
        random.seed(seed)
        factor = factor if factor is not None else random.uniform(1.0, 2.0)
        enhancer = ImageEnhance.Contrast(image)
        return enhancer.enhance(factor)

    def attack_blur(
        self, image: Image.Image, kernel_size: Optional[int] = None, seed: int = 0
    ) -> Image.Image:
        """
        Apply Gaussian blur.

        Args:
            image: Input PIL Image
            kernel_size: Blur kernel size (0-20). If None, random value is used.
            seed: Random seed for reproducibility

        Returns:
            Blurred PIL Image
        """
        random.seed(seed)
        kernel_size = (
            kernel_size if kernel_size is not None else int(random.uniform(0, 20))
        )
        return image.filter(ImageFilter.GaussianBlur(kernel_size))

    def attack_noise(
        self, image: Image.Image, std: Optional[float] = None, seed: int = 0
    ) -> Image.Image:
        """
        Apply Gaussian noise.

        Args:
            image: Input PIL Image
            std: Standard deviation of noise (0.0-0.1). If None, random value is used.
            seed: Random seed for reproducibility

        Returns:
            Noisy PIL Image
        """
        random.seed(seed)
        torch.manual_seed(seed)
        std = std if std is not None else random.uniform(0.0, 0.1)

        # Convert to tensor
        img_array = np.array(image).astype(np.float32) / 255.0
        img_tensor = torch.from_numpy(img_array).permute(2, 0, 1).unsqueeze(0)

        # Add noise
        noise = torch.randn(img_tensor.size()) * std
        noisy_tensor = (img_tensor + noise).clamp(0, 1)

        # Convert back to PIL
        noisy_array = (noisy_tensor.squeeze(0).permute(1, 2, 0).numpy() * 255).astype(
            np.uint8
        )
        return Image.fromarray(noisy_array)

    def attack_jpeg(
        self, image: Image.Image, quality: Optional[int] = None, seed: int = 0
    ) -> Image.Image:
        """
        Apply JPEG compression.

        Args:
            image: Input PIL Image
            quality: JPEG quality (10-90). If None, random value is used.
            seed: Random seed for reproducibility

        Returns:
            Compressed PIL Image
        """
        random.seed(seed)
        quality = quality if quality is not None else int(random.uniform(10, 90))
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG", quality=quality)
        return Image.open(buffered)

    # ==================== Geometric Attacks ====================

    def attack_rotate(self, image: Image.Image, degree: float = 30) -> Image.Image:
        """
        Rotate image.

        Args:
            image: Input PIL Image
            degree: Rotation angle in degrees

        Returns:
            Rotated PIL Image
        """
        return image.rotate(degree)

    def attack_scale(self, image: Image.Image, scale: float = 0.5) -> Image.Image:
        """
        Scale image.

        Args:
            image: Input PIL Image
            scale: Scaling factor (e.g., 0.5 for half size)

        Returns:
            Scaled PIL Image
        """
        w, h = image.size
        new_size = (int(w * scale), int(h * scale))
        return image.resize(new_size, Image.Resampling.LANCZOS)

    def attack_crop(self, image: Image.Image, crop_size: float = 0.5) -> Image.Image:
        """
        Crop image to specified fraction.

        Args:
            image: Input PIL Image
            crop_size: Fraction of image to keep (0.0-1.0)

        Returns:
            Cropped PIL Image
        """
        w, h = image.size
        left = int(w * crop_size)
        top = int(h * crop_size)
        return image.crop((left, top, w, h))

    # ==================== Regeneration Attacks ====================

    def attack_diffusion(
        self,
        image: Image.Image,
        noise_step: int = 60,
        prompt: str = "",
        batch_size: int = 1,
    ) -> Image.Image:
        """
        Apply diffusion-based regeneration attack.
        Requires diffusers library and Stable Diffusion model.

        Args:
            image: Input PIL Image
            noise_step: Number of noise steps to add (higher = more aggressive)
            prompt: Optional text prompt for guided regeneration
            batch_size: Batch size for processing

        Returns:
            Regenerated PIL Image

        Note:
            This method requires loading a Stable Diffusion pipeline.
            It's recommended to use the ReSDPipeline from regeneration module.
        """
        if "diffusion_pipe" not in self._models_loaded:
            try:
                from vine.w_bench_utils.regeneration.utils_sto_regeneration import (
                    ReSDPipeline,
                )
                from diffusers import DDIMScheduler

                pipe = ReSDPipeline.from_pretrained(
                    "runwayml/stable-diffusion-v1-5",
                    torch_dtype=torch.float16,
                    safety_checker=None,
                    requires_safety_checker=False,
                )
                pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)
                pipe.to(self.device)
                self._models_loaded["diffusion_pipe"] = pipe
            except Exception as e:
                raise RuntimeError(f"Failed to load diffusion model: {e}")

        pipe = self._models_loaded["diffusion_pipe"]

        # Encode image to latent
        img_array = np.array(image.resize((512, 512))) / 255.0
        img_array = (img_array - 0.5) * 2
        img_tensor = (
            torch.from_numpy(img_array)
            .permute(2, 0, 1)
            .unsqueeze(0)
            .half()
            .to(self.device)
        )

        with torch.no_grad():
            generator = torch.Generator(self.device).manual_seed(1024)
            latents = pipe.vae.encode(img_tensor).latent_dist
            latents = latents.sample(generator) * pipe.vae.config.scaling_factor

            # Add noise
            timestep = torch.tensor([noise_step], dtype=torch.long, device=self.device)
            noise = torch.randn_like(latents)
            latents = pipe.scheduler.add_noise(latents, noise, timestep)

            # Regenerate
            result = pipe(
                [prompt],
                head_start_latents=latents,
                head_start_step=50 - max(noise_step // 20, 1),
                guidance_scale=7.5,
                generator=generator,
            )

        return result[0][0]

    # ==================== Local Editing Attacks ====================

    def attack_local_edit_controlnet(
        self,
        image: Image.Image,
        mask: Optional[Image.Image],
        prompt: str,
        num_inference_steps: int = 50,
    ) -> Image.Image:
        """
        Apply local editing using ControlNet inpainting.

        Args:
            image: Input PIL Image
            mask: Mask image (white = edit region, black = keep). If None, edits entire image.
            prompt: Editing instruction
            num_inference_steps: Number of diffusion steps

        Returns:
            Edited PIL Image
        """
        if "controlnet_pipe" not in self._models_loaded:
            try:
                from diffusers import (
                    StableDiffusionControlNetInpaintPipeline,
                    ControlNetModel,
                    DDIMScheduler,
                )

                controlnet = ControlNetModel.from_pretrained(
                    "lllyasviel/control_v11p_sd15_inpaint",
                    torch_dtype=torch.float16,
                    safety_checker=None,
                    requires_safety_checker=False,
                )
                pipe = StableDiffusionControlNetInpaintPipeline.from_pretrained(
                    "runwayml/stable-diffusion-v1-5",
                    controlnet=controlnet,
                    torch_dtype=torch.float16,
                    safety_checker=None,
                    requires_safety_checker=False,
                )
                pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)
                pipe.to(self.device)
                self._models_loaded["controlnet_pipe"] = pipe
            except Exception as e:
                raise RuntimeError(f"Failed to load ControlNet model: {e}")

        pipe = self._models_loaded["controlnet_pipe"]

        image = image.resize((512, 512))
        if mask is None:
            mask = Image.new("RGB", image.size, (255, 255, 255))
        else:
            mask = mask.resize(image.size)

        # Create control image
        control_image = self._make_inpaint_condition(image, mask)

        result = pipe(
            prompt,
            num_inference_steps=num_inference_steps,
            generator=torch.Generator(device=self.device).manual_seed(1),
            eta=1.0,
            image=image,
            mask_image=mask,
            control_image=control_image,
        ).images[0]

        return result

    def attack_local_edit_ultraedit(
        self,
        image: Image.Image,
        mask: Optional[Image.Image],
        prompt: str,
        guidance_scale: float = 7.5,
        num_inference_steps: int = 50,
    ) -> Image.Image:
        """
        Apply local editing using UltraEdit.

        Args:
            image: Input PIL Image
            mask: Mask image (white = edit region). If None, uses full white mask.
            prompt: Editing instruction
            guidance_scale: Guidance scale for diffusion
            num_inference_steps: Number of diffusion steps

        Returns:
            Edited PIL Image
        """
        if "ultraedit_local_pipe" not in self._models_loaded:
            try:
                from diffusers import StableDiffusion3InstructPix2PixPipeline

                pipe = StableDiffusion3InstructPix2PixPipeline.from_pretrained(
                    "BleachNick/SD3_UltraEdit_w_mask",
                    torch_dtype=torch.float16,
                    safety_checker=None,
                    requires_safety_checker=False,
                )
                pipe.to(self.device)
                self._models_loaded["ultraedit_local_pipe"] = pipe
            except Exception as e:
                raise RuntimeError(f"Failed to load UltraEdit model: {e}")

        pipe = self._models_loaded["ultraedit_local_pipe"]

        image = image.resize((512, 512))
        if mask is None:
            mask = Image.new("RGB", image.size, (255, 255, 255))
        else:
            mask = mask.resize(image.size)

        result = pipe(
            prompt=prompt,
            image=image,
            mask_img=mask,
            negative_prompt="",
            num_inference_steps=num_inference_steps,
            image_guidance_scale=1.5,
            guidance_scale=guidance_scale,
        ).images[0]

        return result

    # ==================== Global Editing Attacks ====================

    def attack_global_edit_instructpix2pix(
        self,
        image: Image.Image,
        prompt: str,
        guidance_scale: float = 7.5,
        num_inference_steps: int = 50,
    ) -> Image.Image:
        """
        Apply global editing using InstructPix2Pix.

        Args:
            image: Input PIL Image
            prompt: Editing instruction
            guidance_scale: Text guidance scale
            num_inference_steps: Number of diffusion steps

        Returns:
            Edited PIL Image
        """
        if "instructpix2pix_pipe" not in self._models_loaded:
            try:
                from diffusers import (
                    StableDiffusionInstructPix2PixPipeline,
                    DDIMScheduler,
                )

                pipe = StableDiffusionInstructPix2PixPipeline.from_pretrained(
                    "timbrooks/instruct-pix2pix",
                    torch_dtype=torch.float16,
                    safety_checker=None,
                    requires_safety_checker=False,
                )
                pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)
                pipe.to(self.device)
                self._models_loaded["instructpix2pix_pipe"] = pipe
            except Exception as e:
                raise RuntimeError(f"Failed to load InstructPix2Pix model: {e}")

        pipe = self._models_loaded["instructpix2pix_pipe"]
        image = image.resize((512, 512))

        result = pipe(
            prompt=prompt,
            image=image,
            num_inference_steps=num_inference_steps,
            image_guidance_scale=1.5,
            guidance_scale=guidance_scale,
        ).images[0]

        return result

    def attack_global_edit_ultraedit(
        self,
        image: Image.Image,
        prompt: str,
        guidance_scale: float = 7.5,
        num_inference_steps: int = 50,
    ) -> Image.Image:
        """
        Apply global editing using UltraEdit (without mask).

        Args:
            image: Input PIL Image
            prompt: Editing instruction
            guidance_scale: Text guidance scale
            num_inference_steps: Number of diffusion steps

        Returns:
            Edited PIL Image
        """
        if "ultraedit_global_pipe" not in self._models_loaded:
            try:
                from diffusers import StableDiffusion3InstructPix2PixPipeline

                pipe = StableDiffusion3InstructPix2PixPipeline.from_pretrained(
                    "BleachNick/SD3_UltraEdit_w_mask",
                    torch_dtype=torch.float16,
                    safety_checker=None,
                    requires_safety_checker=False,
                )
                pipe.to(self.device)
                self._models_loaded["ultraedit_global_pipe"] = pipe
            except Exception as e:
                raise RuntimeError(f"Failed to load UltraEdit model: {e}")

        pipe = self._models_loaded["ultraedit_global_pipe"]
        image = image.resize((512, 512))
        mask = Image.new("RGB", image.size, (255, 255, 255))

        result = pipe(
            prompt=prompt,
            image=image,
            mask_img=mask,
            negative_prompt="",
            num_inference_steps=num_inference_steps,
            image_guidance_scale=1.5,
            guidance_scale=guidance_scale,
        ).images[0]

        return result

    # ==================== Utility Methods ====================

    def _make_inpaint_condition(
        self, image: Image.Image, mask: Image.Image
    ) -> torch.Tensor:
        """
        Create inpaint condition for ControlNet.

        Args:
            image: Input image
            mask: Mask image

        Returns:
            Control image tensor
        """
        img_array = np.array(image.convert("RGB")).astype(np.float32) / 255.0
        mask_array = np.array(mask.convert("L")).astype(np.float32) / 255.0

        assert (
            img_array.shape[:2] == mask_array.shape[:2]
        ), "Image and mask must have same size"
        img_array[mask_array > 0.5] = -1.0  # Mark masked pixels

        img_tensor = torch.from_numpy(img_array).permute(2, 0, 1).unsqueeze(0)
        return img_tensor.to(self.device)

    @staticmethod
    def get_available_attacks() -> dict:
        """
        Get dictionary of available attack types and their categories.

        Returns:
            Dictionary mapping attack categories to method names
        """
        return {
            "distortion": [
                "attack_brightness",
                "attack_contrast",
                "attack_blur",
                "attack_noise",
                "attack_jpeg",
            ],
            "geometric": ["attack_rotate", "attack_scale", "attack_crop"],
            "regeneration": ["attack_diffusion"],
            "local_editing": [
                "attack_local_edit_controlnet",
                "attack_local_edit_ultraedit",
            ],
            "global_editing": [
                "attack_global_edit_instructpix2pix",
                "attack_global_edit_ultraedit",
            ],
        }

    def apply_distortion(
        self,
        images: List[Image.Image],
        distortion_type: str,
        strength: Optional[float] = None,
        distortion_seed: int = 0,
        same_operation: bool = False,
        relative_strength: bool = True,
    ) -> List[Image.Image]:
        """
        Apply distortion to multiple images (compatible with original w_bench_utils API).

        Args:
            images: List of PIL Images
            distortion_type: Type of distortion ('brightness', 'contrast', 'blurring', 'noise', 'compression')
            strength: Absolute strength value. If relative_strength=True, converts from 0-1 range.
            distortion_seed: Starting random seed
            same_operation: If True, use same seed for all images
            relative_strength: If True, convert strength from 0-1 to absolute range

        Returns:
            List of distorted PIL Images
        """
        # Map distortion types to methods
        distortion_map = {
            "brightness": self.attack_brightness,
            "contrast": self.attack_contrast,
            "blurring": self.attack_blur,
            "noise": self.attack_noise,
            "compression": self.attack_jpeg,
        }

        if distortion_type not in distortion_map:
            raise ValueError(f"Unknown distortion type: {distortion_type}")

        # Convert relative strength to absolute if needed
        if relative_strength and strength is not None:
            strength_ranges = {
                "brightness": (1.0, 2.0),
                "contrast": (1.0, 2.0),
                "blurring": (0, 20),
                "noise": (0.0, 0.1),
                "compression": (90, 10),  # Note: reversed for JPEG
            }
            min_val, max_val = strength_ranges[distortion_type]
            strength = strength * (max_val - min_val) + min_val

        # Apply distortion to each image
        attack_method = distortion_map[distortion_type]
        distorted_images = []
        seed = distortion_seed

        for image in images:
            if distortion_type == "blurring":
                distorted = attack_method(
                    image, kernel_size=int(strength) if strength else None, seed=seed
                )
            elif distortion_type == "compression":
                distorted = attack_method(
                    image, quality=int(strength) if strength else None, seed=seed
                )
            elif distortion_type == "noise":
                distorted = attack_method(image, std=strength, seed=seed)
            else:  # brightness, contrast
                distorted = attack_method(image, factor=strength, seed=seed)

            distorted_images.append(distorted)

            if not same_operation:
                seed += 1

        return distorted_images
