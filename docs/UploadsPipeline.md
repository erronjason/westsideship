# Uploads Pipeline (Local Windows Folder)

**Goal**: Accept customer uploads safely, place clean files in a Windows‑visible folder for staff to print manually.

- Frontend: Uppy + Tus → endpoint (tusd) via Cloudflare Tunnel or local port
- tusd: stores temp file in `C:\print-uploads\incoming`, sends webhook to worker
- Worker: ClamAV scan → move to `clean/` or `quarantine/`, emit `meta.json`

**Notes**
- Adjust `-max-size` in `docker-compose.yml` for your use case
- Allowed types are enforced in Uppy; optionally add server‑side MIME checks (tusd hooks) later
- You can later replace the filesystem store with MinIO (S3) by switching tusd flags