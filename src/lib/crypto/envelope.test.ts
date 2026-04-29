import { randomBytes } from "node:crypto";

import { describe, it, expect, beforeAll } from "vitest";

import { decrypt, encrypt, generateMasterKeyHex, rewrap } from "./envelope";

beforeAll(() => {
  process.env.ENCRYPTION_MASTER_KEY = generateMasterKeyHex();
});

describe("envelope encryption", () => {
  it("round-trips arbitrary UTF-8 text", () => {
    const plain = "user@example.com::P@ssw0rd_тест_漢字_😀";
    const enc = encrypt(plain);
    expect(enc).not.toContain(plain);
    expect(decrypt(enc)).toBe(plain);
  });

  it("produces different ciphertext for the same plaintext (random DEK + IV)", () => {
    const a = encrypt("same-secret");
    const b = encrypt("same-secret");
    expect(a).not.toBe(b);
    expect(decrypt(a)).toBe(decrypt(b));
  });

  it("rejects tampered ciphertext via GCM auth tag", () => {
    const enc = encrypt("sensitive");
    const parsed = JSON.parse(enc) as { data: string };
    const tampered = Buffer.from(parsed.data, "base64");
    tampered[0] = (tampered[0] ?? 0) ^ 0xff;
    parsed.data = tampered.toString("base64");
    expect(() => decrypt(JSON.stringify(parsed))).toThrow();
  });

  it("rejects tampered auth tag", () => {
    const enc = encrypt("sensitive");
    const parsed = JSON.parse(enc) as { dataTag: string };
    const tag = Buffer.from(parsed.dataTag, "base64");
    tag[0] = (tag[0] ?? 0) ^ 0xff;
    parsed.dataTag = tag.toString("base64");
    expect(() => decrypt(JSON.stringify(parsed))).toThrow();
  });

  it("rejects ciphertext signed by a different master key", () => {
    const enc = encrypt("topsecret");
    const otherKey = randomBytes(32);
    expect(() => decrypt(enc, otherKey)).toThrow();
  });

  it("rotates master key via rewrap without re-encrypting data", () => {
    const oldKey = Buffer.from(generateMasterKeyHex(), "hex");
    const newKey = Buffer.from(generateMasterKeyHex(), "hex");
    const plain = "credential-123";
    const enc = encrypt(plain, oldKey);
    const rewrapped = rewrap(enc, oldKey, newKey);

    const oldEnv = JSON.parse(enc) as { data: string };
    const newEnv = JSON.parse(rewrapped) as { data: string };
    expect(newEnv.data).toBe(oldEnv.data);

    expect(decrypt(rewrapped, newKey)).toBe(plain);
    expect(() => decrypt(rewrapped, oldKey)).toThrow();
  });

  it("rejects malformed envelope JSON", () => {
    expect(() => decrypt("{}")).toThrow();
    expect(() => decrypt("not-json")).toThrow();
  });

  it("handles empty string", () => {
    const enc = encrypt("");
    expect(decrypt(enc)).toBe("");
  });

  it("handles long inputs (10 KB)", () => {
    const big = "x".repeat(10_000);
    expect(decrypt(encrypt(big))).toBe(big);
  });
});
