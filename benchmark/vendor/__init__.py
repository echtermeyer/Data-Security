class MethodBase:
    def encode(self, img_pil, msg):
        raise NotImplementedError

    def decode(self, img_pil):
        raise NotImplementedError
