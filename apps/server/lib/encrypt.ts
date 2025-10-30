const GCM_IV_LENGTH = 16;
const ENCRYPTION_ALGORITHM = "AES-GCM";

const hexToArrayBuffer = (hexString: string): ArrayBuffer => {
  const bytes = Uint8Array.from(Buffer.from(hexString, "hex"));
  return bytes.buffer;
};

const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  return Buffer.from(buffer).toString("hex");
};

export const encryptDataSubtle = async (
  data: string,
  encryptionKey: string
): Promise<string> => {
  const keyBuffer = hexToArrayBuffer(encryptionKey);
  const dataBuffer = new TextEncoder().encode(data);
  const iv = crypto.getRandomValues(new Uint8Array(GCM_IV_LENGTH));

  const importedKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    ENCRYPTION_ALGORITHM,
    false,
    ["encrypt"]
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv,
    },
    importedKey,
    dataBuffer
  );

  const fullCiphertext = new Uint8Array(encryptedBuffer);

  return (
    arrayBufferToHex(iv.buffer) + ":" + arrayBufferToHex(fullCiphertext.buffer)
  );
};

export const decryptDataSubtle = async (
  encryptedData: string,
  encryptionKey: string
): Promise<string> => {
  const [ivHex, fullCiphertextHex] = encryptedData.split(":");
  if (!ivHex || !fullCiphertextHex) {
    throw new Error(
      "Invalid GCM encrypted data format (expected IV:CIPHERTEXT+TAG)."
    );
  }

  const keyBuffer = hexToArrayBuffer(encryptionKey);
  const ivBuffer = hexToArrayBuffer(ivHex);
  const fullCiphertextBuffer = hexToArrayBuffer(fullCiphertextHex);

  const importedKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    ENCRYPTION_ALGORITHM,
    false,
    ["decrypt"]
  );

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: ivBuffer,
      },
      importedKey,
      fullCiphertextBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch {
    throw new Error(
      "Authentication failed: Ciphertext, Tag, or Key is invalid."
    );
  }
};
