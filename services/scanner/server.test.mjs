import test from "node:test";
import assert from "node:assert/strict";
import { authorized, parseClamdResponse, validateFile } from "./server.mjs";

test("uses constant-time bearer comparison semantics", () => {
  assert.equal(authorized("Bearer correct", "correct"), true);
  assert.equal(authorized("Bearer incorrect", "correct"), false);
  assert.equal(authorized(undefined, "correct"), false);
  assert.equal(authorized("Bearer correct", ""), false);
});

test("accepts supported evidence metadata and enforces ten megabytes", () => {
  assert.deepEqual(
    validateFile({ name: "evidence.pdf", type: "application/pdf", size: 1024 }),
    { ok: true },
  );
  assert.equal(
    validateFile({ name: "evidence.exe", type: "application/octet-stream", size: 1024 }).ok,
    false,
  );
  assert.equal(
    validateFile({ name: "evidence.pdf", type: "application/pdf", size: 10 * 1024 * 1024 + 1 }).ok,
    false,
  );
});

test("maps deterministic ClamAV responses", () => {
  assert.deepEqual(parseClamdResponse("stream: OK\0"), { clean: true, provider: "clamav" });
  assert.deepEqual(parseClamdResponse("stream: Eicar-Signature FOUND\0"), {
    clean: false,
    provider: "clamav",
    reason: "Eicar-Signature",
  });
  assert.throws(() => parseClamdResponse("stream: ERROR"));
});
