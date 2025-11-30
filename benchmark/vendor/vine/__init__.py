from vendor import MethodBase


class Method_RAW(MethodBase):
    def __init__(self):
        watermark_encoder = VINE_Turbo.from_pretrained(args.pretrained_model_name)
        watermark_encoder.to(device)

    def encode(self, img_pil, msg):
        img = to_tensor(img_pil).unsqueeze(0).to(self.device)
        wm_image = self.RAW.encode_img(img)
        return to_pil_image(wm_image.squeeze(0).clamp(0, 1).cpu())

    def decode(self, img_pil):
        msg = self.RAW.detect_img(img_pil, decision_thres=0.5, prob=True)
        return msg
