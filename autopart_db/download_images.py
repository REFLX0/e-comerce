#!/usr/bin/env python3"""Download all product images from image_urls.csv

Usage:
  python3 download_images.py                # Download to ./autopart_images/
  python3 download_images.py --output ./imgs/ # Custom output dir
  python3 download_images.py --threads 8      # Use 8 download threads
"""

import csv, os, urllib.request, ssl, sys, argparse, threading
from concurrent.futures import ThreadPoolExecutor, as_completed

DEFAULT_THREADS = 8
DEFAULT_OUT = 'autopart_images'

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
HDRS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

lock = threading.Lock()


def download_one(row):
    pid, url = row
    if not url or not url.startswith('http'):
        return None
    ext = '.webp'
    if '.jpg' in url.lower(): ext = '.jpg'
    elif '.png' in url.lower(): ext = '.png'
    filename = f"{pid}{ext}"
    outpath = os.path.join(out_dir, filename)
    if os.path.exists(outpath):
        return ('skip', pid)
    try:
        req = urllib.request.Request(url, headers=HDRS)
        resp = urllib.request.urlopen(req, timeout=15, context=ctx)
        data = resp.read()
        if len(data) < 100:
            return ('fail', pid)
        with open(outpath, 'wb') as f:
            f.write(data)
        return ('ok', pid, len(data))
    except Exception as e:
        return ('fail', pid)


def main():
    global out_dir
    parser = argparse.ArgumentParser(description='Download autopart.tn product images')
    parser.add_argument('--csv', default='image_urls.csv', help='Path to image_urls.csv')
    parser.add_argument('--output', '-o', default=DEFAULT_OUT, help='Output directory')
    parser.add_argument('--threads', '-t', type=int, default=DEFAULT_THREADS)
    args = parser.parse_args()

    out_dir = args.output
    os.makedirs(out_dir, exist_ok=True)

    if not os.path.exists(args.csv):
        print(f'Error: {args.csv} not found')
        sys.exit(1)

    rows = []
    with open(args.csv, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader)  # skip header
        for r in reader:
            if len(r) >= 2 and r[1].strip():
                rows.append((r[0].strip(), r[1].strip()))

    total = len(rows)
    print(f'Found {total} image URLs to download')
    print(f'Output: {out_dir}/')
    print(f'Threads: {args.threads}')

    ok = skip = fail = 0
    t0 = __import__('time').time()

    with ThreadPoolExecutor(max_workers=args.threads) as ex:
        futures = {ex.submit(download_one, r): r for r in rows}
        for future in as_completed(futures):
            result = future.result()
            if result is None:
                fail += 1
            elif result[0] == 'ok':
                ok += 1
            elif result[0] == 'skip':
                skip += 1
            else:
                fail += 1

            done = ok + skip + fail
            if done % 200 == 0:
                el = __import__('time').time() - t0
                rate = done / el if el > 0 else 0
                print(f'{done}/{total} | OK: {ok} | Skip: {skip} | Fail: {fail} | {rate:.1f}/s')

    el = __import__('time').time() - t0
    print(f'\nDone! Downloaded: {ok} | Skipped: {skip} | Failed: {fail}')
    print(f'Time: {el:.0f}s')


if __name__ == '__main__':
    main()
