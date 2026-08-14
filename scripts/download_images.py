#!/usr/bin/env python3
"""
Download images listed in image_urls.csv (columns: product_id,image_url).

Usage:
    python download_images.py

Config via environment variables (optional):
    CSV_PATH      - path to the CSV file (default: image_urls.csv)
    OUTPUT_DIR    - where to save images (default: images/)
    THREADS       - number of concurrent download threads (default: 12)
    RETRIES       - retry attempts per image (default: 3)

Resumes automatically: if an image file already exists on disk it is skipped.
Progress is printed periodically and a log of failures is written to
failed_downloads.csv at the end.
"""

import csv
import os
import sys
import time
import threading
from pathlib import Path
from urllib.parse import urlparse, unquote
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

CSV_PATH = os.environ.get("CSV_PATH", "image_urls.csv")
OUTPUT_DIR = Path(os.environ.get("OUTPUT_DIR", "images"))
THREADS = int(os.environ.get("THREADS", "12"))
RETRIES = int(os.environ.get("RETRIES", "3"))
TIMEOUT = 20  # seconds per request
FAILED_LOG = "failed_downloads.csv"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    )
}

progress_lock = threading.Lock()
counters = {"done": 0, "skipped": 0, "failed": 0, "total": 0}


def safe_filename(product_id: str, url: str) -> str:
    """Build a filesystem-safe filename from product_id + original filename."""
    parsed = urlparse(url)
    name = unquote(os.path.basename(parsed.path)) or "image"
    # Prefix with product_id to avoid collisions between products
    return f"{product_id}_{name}"


def download_one(product_id: str, url: str) -> tuple:
    """Returns (status, product_id, url, error_message_or_None)."""
    filename = safe_filename(product_id, url)
    dest = OUTPUT_DIR / filename

    if dest.exists() and dest.stat().st_size > 0:
        return ("skipped", product_id, url, None)

    last_err = None
    for attempt in range(1, RETRIES + 1):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT, stream=True)
            resp.raise_for_status()
            tmp_path = dest.with_suffix(dest.suffix + ".part")
            with open(tmp_path, "wb") as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            tmp_path.rename(dest)
            return ("done", product_id, url, None)
        except Exception as e:
            last_err = str(e)
            time.sleep(min(2 ** attempt, 10))  # exponential backoff

    return ("failed", product_id, url, last_err)


def print_progress():
    with progress_lock:
        d, s, f, t = counters["done"], counters["skipped"], counters["failed"], counters["total"]
    processed = d + s + f
    pct = (processed / t * 100) if t else 0
    print(
        f"\r[{processed}/{t} {pct:5.1f}%] done={d} skipped={s} failed={f}",
        end="",
        flush=True,
    )


def main():
    csv_path = Path(CSV_PATH)
    if not csv_path.exists():
        print(f"ERROR: CSV file not found: {csv_path}", file=sys.stderr)
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    rows = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            pid = row.get("product_id", "").strip()
            url = row.get("image_url", "").strip()
            if pid and url:
                rows.append((pid, url))

    counters["total"] = len(rows)
    print(f"Loaded {len(rows)} rows from {csv_path}")
    print(f"Output dir: {OUTPUT_DIR.resolve()}")
    print(f"Threads: {THREADS} | Retries per image: {RETRIES}\n")

    failed_rows = []

    with ThreadPoolExecutor(max_workers=THREADS) as executor:
        futures = {
            executor.submit(download_one, pid, url): (pid, url) for pid, url in rows
        }
        for future in as_completed(futures):
            status, pid, url, err = future.result()
            with progress_lock:
                counters[status] += 1
            if status == "failed":
                failed_rows.append((pid, url, err))
            print_progress()

    print("\n\nDone.")
    print(f"  Downloaded: {counters['done']}")
    print(f"  Skipped (already existed): {counters['skipped']}")
    print(f"  Failed: {counters['failed']}")

    if failed_rows:
        with open(FAILED_LOG, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["product_id", "image_url", "error"])
            writer.writerows(failed_rows)
        print(f"  Failure details written to: {FAILED_LOG}")


if __name__ == "__main__":
    main()
