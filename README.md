# Westside Shipping & More — Self‑Hosted Starter

A complete starter you can commit to a repo. It includes:
- Directus (content admin) + Postgres
- Resumable uploads via tusd to a Windows‑visible folder, scanned with ClamAV by a tiny Python worker
- A minimal public site scaffold (Astro) that reads from Directus (Services, Pickup Times, FAQs, Deals)
- Documentation, acceptance criteria, and upgrade roadmap

## Prerequisites (Windows host)
- Windows 11 Pro
- Docker Desktop with WSL2 backend (enable drive sharing for C:)
- Node 18+ (for the Astro dev server)
- (Optional) Cloudflare account for a Named Tunnel

## Quick start
1) Create the folders on the host:
```
C:\print-uploads\incoming
C:\print-uploads\clean
C:\print-uploads\quarantine
```
2) Copy `.env.example` to `.env` and set strong secrets.
3) Start the stack:
```
docker compose up -d
```
- Directus admin: http://localhost:8055
- tusd (uploads): not exposed by default. For local testing see `docker-compose.yml` comments (enable port 1080).

4) Apply the Directus schema snapshot:
```
curl -X POST "http://localhost:8055/schema/apply"   -H "Authorization: Bearer <ADMIN_TOKEN>"   -H "Content-Type: application/json"   --data @directus/schema-snapshot.json
```
Create a Static Token in Directus for the frontend and put it into `astro-site/.env` if you want to read private fields.

5) Run the Astro site (reads from Directus):
```
cd astro-site
npm i
npm run dev
```
Open http://localhost:4321

## Upload testing (local)
For local testing, uncomment the `ports` and `-http-address=...:1080` lines in `docker-compose.yml` under the `tusd` service, then open `website/intake.html` in your browser. Uploaded files:
- are written to `C:\print-uploads\incoming`
- are scanned by ClamAV via the `printworker`
- are moved to `C:\print-uploads\clean\YYYYMMDD-<jobid>` or `...\quarantine\...` with a `meta.json` file

## Production notes
- Publish tusd behind Cloudflare Tunnel (upload.yourdomain.com → tusd) and restrict allowed origins via Cloudflare/WAF.
- Do **not** expose the `C:\print-uploads\*` folders over HTTP/SMB publicly.
- Add Windows Task Scheduler cleanup (see scripts/) to remove old files.

See docs/ for architecture, acceptance criteria, and roadmap.
