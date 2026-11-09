# PitchPond attachment scanner

Private ClamAV-backed service for the Evidence Vault. The service accepts one authenticated multipart upload at `POST /scan`, streams it to the local ClamAV daemon, and returns `{ clean, provider, reason? }`. Files remain in memory and are never written to application storage.

## Required configuration

- `SCANNER_TOKEN`: long random bearer token shared only with the PitchPond server.
- `PORT`: HTTP port, default `8080`.
- `CLAMD_HOST` and `CLAMD_PORT`: local ClamAV daemon, default `127.0.0.1:3310`.

For Railway, set the service root to `services/scanner`, deploy in Singapore (`asia-southeast1-eqsg3a`), mount a volume at `/var/lib/clamav`, generate `SCANNER_TOKEN`, and expose the generated HTTPS domain. Set that URL plus `/scan` as `ATTACHMENT_SCANNER_ENDPOINT` in Vercel and use the same token as `ATTACHMENT_SCANNER_TOKEN`.

Do not enable PitchPond's `file_uploads` feature flag until `/health`, clean-file, EICAR, timeout, and 10MB-limit acceptance checks pass.
