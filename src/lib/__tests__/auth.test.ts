/**
 * @jest-environment node
 */

jest.mock("@/lib/db", () => ({
  getDb: jest.fn(),
}));

import { hashPassword, hashToken, verifyPassword } from "@/lib/auth";

describe("Auth Utilities", () => {
  describe("hashPassword", () => {
    it("hashes a password using the PBKDF2 format", async () => {
      const hash = await hashPassword("TestPassword123!");

      expect(hash).toContain("pbkdf2$");
    });

    it("uses a different salt for the same password", async () => {
      const password = "TestPassword123!";
      const firstHash = await hashPassword(password);
      const secondHash = await hashPassword(password);

      expect(firstHash).not.toBe(secondHash);
    });
  });

  describe("verifyPassword", () => {
    it("accepts the correct password", async () => {
      const password = "TestPassword123!";
      const hash = await hashPassword(password);

      await expect(verifyPassword(password, hash)).resolves.toBe(true);
    });

    it("rejects an incorrect password", async () => {
      const hash = await hashPassword("TestPassword123!");

      await expect(verifyPassword("WrongPassword123!", hash)).resolves.toBe(false);
    });

    it("rejects an invalid hash format", async () => {
      await expect(verifyPassword("any-password", "invalid-hash-format")).resolves.toBe(false);
    });
  });

  describe("hashToken", () => {
    it("hashes a token as a SHA-256 hex digest", async () => {
      const hash = await hashToken("test-token-123");

      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it("produces a stable hash for the same token", async () => {
      const token = "test-token-123";

      await expect(hashToken(token)).resolves.toBe(await hashToken(token));
    });
  });
});
