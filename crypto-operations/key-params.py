import base64
import sys
from umbral import pre, keys

alice_private_key = keys.UmbralPrivateKey.from_bytes(base64.b64decode(sys.argv[1]))
print(alice_private_key.params.)
