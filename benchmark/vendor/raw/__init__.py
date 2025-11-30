from vendor import MethodBase
import torch
from torchvision.transforms.functional import to_tensor, to_pil_image
from vendor.raw.scripts import raw


class Method_RAW(MethodBase):
    def __init__(self):
        self.device = "mps" if torch.cuda.is_available() else "cpu"
        self.RAW = raw.RAWatermark(device=self.device, wm_index=0)

    def encode(self, img_pil, msg):
        img = to_tensor(img_pil).unsqueeze(0).to(self.device)
        wm_image = self.RAW.encode_img(img)
        return to_pil_image(wm_image.squeeze(0).clamp(0, 1).cpu())

    def decode(self, img_pil):
        msg = self.RAW.detect_img(img_pil, decision_thres=0.5, prob=True)
        return msg
