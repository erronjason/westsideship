# Self‑Hosted Architecture (Windows + Docker)

## Stack
- Directus + Postgres (content admin)
- tusd (resumable uploads) → Windows folder
- ClamAV + small Python worker (scan + move to clean/quarantine)
- Astro site (reads from Directus)
- Optional Cloudflare Tunnel for public exposure without opening ports

## Data Flow for Uploads
1) Browser (Uppy) uploads to tusd → `C:\print-uploads\incoming`
2) tusd calls worker webhook
3) Worker scans via ClamAV:
   - clean → `C:\print-uploads\clean\YYYYMMDD-<jobid>` (+ meta.json)
   - infected → `C:\print-uploads\quarantine\YYYYMMDD-<jobid>` (+ infected.txt)

## Security
- Restrict allowed file types and size in Uppy
- Keep tusd behind Cloudflare Tunnel; restrict origins (WAF)
- Do not expose the Windows upload folders over the network
- ClamAV signatures auto‑update inside container

## Backups & retention
- Directus DB volume (db_data) via Docker Desktop backup or restic
- Windows Task Scheduler scripts to clean aged files (see scripts/)