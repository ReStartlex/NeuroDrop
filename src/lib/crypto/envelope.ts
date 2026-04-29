import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import { z } from "zod";

const ALGO = "aes-256-gcm" as const;
const KEY_BYTES = 32;
const IV_BYTES = 12;
const TAG_BYTES = 16;
const VERSION = 1 as const;

const encryptedPayloadSchema = z.object({
  v: z.literal(VERSION),
  edk: z.string(),
  edkIv: z.string(),
  edkTag: z.string(),
  data: z.string(),
  dataIv: z.string(),
  dataTag: z.string(),
});

export type EncryptedPayload = z.infer<typeof encryptedPayloadSchema>;

function getMasterKey(): Buffer {
  const hex = process.env.ENCRYPTION_MASTER_KEY;
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("ENCRYPTION_MASTER_KEY must be set to a 32-byte hex string (64 chars).");
  }
  return Buffer.from(hex, "hex");
}

function encryptRaw(
  plaintext: Buffer,
  key: Buffer,
): { ciphertext: Buffer; iv: Buffer; tag: Buffer } {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext, iv, tag };
}

function decryptRaw(ciphertext: Buffer, key: Buffer, iv: Buffer, tag: Buffer): Buffer {
  if (tag.length !== TAG_BYTES) {
    throw new Error("Invalid auth tag length.");
  }
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/**
 * Encrypts arbitrary string with envelope encryption.
 *
 * Generates a fresh per-record data key (DEK), encrypts plaintext with the DEK,
 * then wraps the DEK with the master key. Allows master-key rotation by re-wrapping
 * DEKs only — without touching ciphertext.
 *
 * @returns serialized JSON envelope safe to store in a TEXT column.
 */
export function encrypt(plaintext: string, masterKey: Buffer = getMasterKey()): string {
  if (masterKey.length !== KEY_BYTES) {
    throw new Error(`Master key must be ${KEY_BYTES} bytes.`);
  }

  const dek = randomBytes(KEY_BYTES);
  const dataEnc = encryptRaw(Buffer.from(plaintext, "utf8"), dek);
  const dekEnc = encryptRaw(dek, masterKey);

  const payload: EncryptedPayload = {
    v: VERSION,
    edk: dekEnc.ciphertext.toString("base64"),
    edkIv: dekEnc.iv.toString("base64"),
    edkTag: dekEnc.tag.toString("base64"),
    data: dataEnc.ciphertext.toString("base64"),
    dataIv: dataEnc.iv.toString("base64"),
    dataTag: dataEnc.tag.toString("base64"),
  };

  dek.fill(0);
  return JSON.stringify(payload);
}

export function decrypt(envelope: string, masterKey: Buffer = getMasterKey()): string {
  const parsed = encryptedPayloadSchema.safeParse(JSON.parse(envelope));
  if (!parsed.success) {
    throw new Error("Invalid encrypted envelope format.");
  }
  const p = parsed.data;
  const dek = decryptRaw(
    Buffer.from(p.edk, "base64"),
    masterKey,
    Buffer.from(p.edkIv, "base64"),
    Buffer.from(p.edkTag, "base64"),
  );

  try {
    const plaintext = decryptRaw(
      Buffer.from(p.data, "base64"),
      dek,
      Buffer.from(p.dataIv, "base64"),
      Buffer.from(p.dataTag, "base64"),
    );
    return plaintext.toString("utf8");
  } finally {
    dek.fill(0);
  }
}

/**
 * Re-wraps the data key with a new master key without touching the data ciphertext.
 * Use during master-key rotation: read row, rewrap, write row.
 */
export function rewrap(envelope: string, oldMasterKey: Buffer, newMasterKey: Buffer): string {
  const parsed = encryptedPayloadSchema.safeParse(JSON.parse(envelope));
  if (!parsed.success) {
    throw new Error("Invalid encrypted envelope format.");
  }
  const p = parsed.data;

  const dek = decryptRaw(
    Buffer.from(p.edk, "base64"),
    oldMasterKey,
    Buffer.from(p.edkIv, "base64"),
    Buffer.from(p.edkTag, "base64"),
  );

  try {
    const dekEnc = encryptRaw(dek, newMasterKey);
    const next: EncryptedPayload = {
      ...p,
      edk: dekEnc.ciphertext.toString("base64"),
      edkIv: dekEnc.iv.toString("base64"),
      edkTag: dekEnc.tag.toString("base64"),
    };
    return JSON.stringify(next);
  } finally {
    dek.fill(0);
  }
}

export function generateMasterKeyHex(): string {
  return randomBytes(KEY_BYTES).toString("hex");
}
