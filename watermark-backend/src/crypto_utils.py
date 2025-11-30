import base64
import json

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature


def verify_signature(claim_dict: dict, signature_b64: str, public_key_pem: str) -> bool:
    try:
        claim_json = json.dumps(claim_dict, separators=(",", ":"))
        claim_bytes = claim_json.encode("utf-8")

        signature_bytes = base64.b64decode(signature_b64)

        # Load public key from PEM
        public_key = serialization.load_pem_public_key(
            public_key_pem.encode("utf-8"), backend=default_backend()
        )

        # Verify the signature using RSA-PSS (same as frontend)
        public_key.verify(
            signature_bytes,
            claim_bytes,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=32,  # Must match frontend's saltLength
            ),
            hashes.SHA256(),
        )

        return True

    except InvalidSignature as e:
        return False
    except Exception as e:
        import traceback

        traceback.print_exc()
        return False
