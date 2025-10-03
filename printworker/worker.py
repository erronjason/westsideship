import os, shutil, json, time, socket, struct
from http.server import BaseHTTPRequestHandler, HTTPServer

UPLOADS_ROOT = os.environ.get("UPLOADS_ROOT", "/uploads")
INCOMING_DIR = os.environ.get("INCOMING_DIR", "/uploads/incoming")
CLEAN_DIR    = os.environ.get("CLEAN_DIR", "/uploads/clean")
QUAR_DIR     = os.environ.get("QUAR_DIR", "/uploads/quarantine")
CLAM_HOST    = os.environ.get("CLAMAV_HOST", "clamav")
CLAM_PORT    = int(os.environ.get("CLAMAV_PORT", "3310"))

os.makedirs(INCOMING_DIR, exist_ok=True)
os.makedirs(CLEAN_DIR, exist_ok=True)
os.makedirs(QUAR_DIR, exist_ok=True)

def clam_instream_scan(path: str) -> str:
    s = socket.create_connection((CLAM_HOST, CLAM_PORT))
    s.sendall(b"zINSTREAM\0")
    with open(path, "rb") as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            s.sendall(struct.pack(">I", len(chunk)))
            s.sendall(chunk)
    s.sendall(struct.pack(">I", 0))
    resp = b""
    while True:
        buf = s.recv(4096)
        if not buf:
            break
        resp += buf
    s.close()
    return resp.decode("utf-8", errors="ignore")

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        return  # quiet

    def _ok(self):
        self.send_response(204)
        self.end_headers()

    def do_POST(self):
        if not self.path.startswith("/hooks"):
            self.send_response(404); self.end_headers(); return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length).decode("utf-8")
            evt = json.loads(body)
        except Exception:
            self.send_response(400); self.end_headers(); return

        upload = evt.get("Upload", {})
        storage = upload.get("Storage", {})
        rel_path = storage.get("Path")
        upload_id = upload.get("ID") or str(int(time.time()))
        meta = upload.get("MetaData", {}) or {}

        src = os.path.join(INCOMING_DIR, rel_path) if rel_path else os.path.join(INCOMING_DIR, upload_id)
        if not os.path.exists(src):
            self.send_response(404); self.end_headers(); return

        stamp = time.strftime("%Y%m%d")
        job_id = upload_id[:12]
        clean_dir = os.path.join(CLEAN_DIR, f"{stamp}-{job_id}")
        quar_dir  = os.path.join(QUAR_DIR,  f"{stamp}-{job_id}")
        os.makedirs(clean_dir, exist_ok=True)
        os.makedirs(quar_dir,  exist_ok=True)

        result = clam_instream_scan(src)
        infected = ("FOUND" in result) and (" OK" not in result)

        if infected:
            target = os.path.join(quar_dir, os.path.basename(rel_path or upload_id))
            shutil.move(src, target)
            with open(os.path.join(quar_dir, "infected.txt"), "w", encoding="utf-8") as f:
                f.write(result)
        else:
            filename = meta.get("filename") or os.path.basename(rel_path or upload_id)
            target = os.path.join(clean_dir, filename)
            shutil.move(src, target)
            with open(os.path.join(clean_dir, "meta.json"), "w", encoding="utf-8") as f:
                json.dump({
                    "uploadedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "clientIp": self.headers.get("X-Forwarded-For") or self.client_address[0],
                    "filename": filename,
                    "filetype": meta.get("filetype"),
                    "size": upload.get("Size"),
                    "meta": meta
                }, f, indent=2)

        self._ok()

if __name__ == "__main__":
    HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
