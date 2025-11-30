from vendor import MethodBase
from vendor.vine.src.vine_turbo import VINE_Turbo
from torchvision import transforms
import torch
import time


class Method_RAW(MethodBase):
    def __init__(self, device):
        self.device = device
        self.watermark_encoder = VINE_Turbo.from_pretrained("Shilin-LU/VINE-R-Enc")
        self.watermark_encoder.to(device)

    def crop_to_square(self, image):
        width, height = image.size

        min_side = min(width, height)
        left = (width - min_side) // 2
        top = (height - min_side) // 2
        right = left + min_side
        bottom = top + min_side

        cropped_image = image.crop((left, top, right, bottom))
        return cropped_image

    def encode(self, img_pil, msg):
        if img_pil.size[0] != img_pil.size[1]:
            img_pil = self.crop_to_square(img_pil)

        size = img_pil.size
        t_val_256 = transforms.Compose(
            [
                transforms.Resize(
                    256, interpolation=transforms.InterpolationMode.BICUBIC
                ),
                transforms.ToTensor(),
            ]
        )
        t_val_512 = transforms.Compose(
            [
                transforms.Resize(
                    size, interpolation=transforms.InterpolationMode.BICUBIC
                ),
            ]
        )
        resized_img = t_val_256(img_pil)  # 256x256
        resized_img = 2.0 * resized_img - 1.0
        input_image = (
            transforms.ToTensor()(img_pil).unsqueeze(0).to(self.device)
        )  # 512x512
        input_image = 2.0 * input_image - 1.0
        resized_img = resized_img.unsqueeze(0).to(self.device)

        ### ============= load message =============

        if len(msg) > 12:
            print("Error: Can only encode 100 bits (12 characters)")
            raise SystemExit
        data = bytearray(msg + " " * (12 - len(msg)), "utf-8")
        packet_binary = "".join(format(x, "08b") for x in data)
        watermark = [int(x) for x in packet_binary]
        watermark.extend([0, 0, 0, 0])
        watermark = torch.tensor(watermark, dtype=torch.float).unsqueeze(0)
        watermark = watermark.to(self.device)

        ### ============= watermark encoding =============
        encoded_image_256 = self.watermark_encoder(resized_img, watermark)

        ### ============= resolution scaling to original size =============
        residual_256 = encoded_image_256 - resized_img  # 256x256
        residual_512 = t_val_512(residual_256)  # 512x512 or original size
        encoded_image = residual_512 + input_image  # 512x512 or original size
        encoded_image = encoded_image * 0.5 + 0.5
        encoded_image = torch.clamp(encoded_image, min=0.0, max=1.0)

        ### ============= save the output image =============
        output_pil = transforms.ToPILImage()(encoded_image[0])
        return output_pil

    def decode(self, img_pil):
        pass
