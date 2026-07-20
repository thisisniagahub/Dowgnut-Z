import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth-password";

describe("auth-password (scrypt)", () => {
  it("produces a stable-format hash", async () => {
    const hash = await hashPassword("hunter2");
    const parts = hash.split(":");
    expect(parts).toHaveLength(5); // salt:N:r:p:hash
    expect(parts[1]).toBe("16384");
    expect(parts[2]).toBe("8");
    expect(parts[3]).toBe("1");
    expect(parts[0].length).toBeGreaterThanOrEqual(22); // base64 salt ≥ 22 chars
    expect(parts[4].length).toBeGreaterThanOrEqual(80); // base64 64-byte hash
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    const ok = await verifyPassword("correct horse battery staple", hash);
    expect(ok).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("noodles-for-life");
    const ok = await verifyPassword("noodles-for-lie", hash);
    expect(ok).toBe(false);
  });

  it("rejects a malformed hash gracefully", async () => {
    const ok = await verifyPassword("anything", "not:a:valid:hash");
    expect(ok).toBe(false);
  });

  it("produces different hashes for same password (random salt)", async () => {
    const a = await hashPassword("samepass");
    const b = await hashPassword("samepass");
    expect(a).not.toBe(b);
    expect(await verifyPassword("samepass", a)).toBe(true);
    expect(await verifyPassword("samepass", b)).toBe(true);
  });
});
