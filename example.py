from umbral import pre, keys

# Generate umbral keys for Alice.
alices_private_key = keys.UmbralPrivateKey.gen_key()
alices_public_key = alices_private_key.get_pubkey()

# Encrypt data with Alice's public key.
plaintext = b'Proxy Re-encryption is cool!'
ciphertext, capsule = pre.encrypt(alices_public_key, plaintext)

# Decrypt data with Alice's private key.
cleartext = pre.decrypt(ciphertext, capsule,
                        alices_private_key, alices_public_key)

print(alices_public_key)
