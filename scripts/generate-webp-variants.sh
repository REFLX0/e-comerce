#!/usr/bin/env bash
# Pre-generates WebP variants of product images over 500KB, alongside the
# originals (never overwrites or deletes source files). nginx then serves the
# .webp sibling instead of the original when the client's Accept header
# supports it and the file exists - see the "Local Uploads" location in
# nginx.prod.conf. Quality 82 chosen as a safe, visually-lossless-at-normal-
# zoom default for product photography; re-run with a different -q if that's
# ever judged too aggressive for a specific catalogue.

set -euo pipefail
DIR="${1:-/home/ubuntu/e-comerce/uploads/products}"
QUALITY="${2:-82}"

total_before=0
total_after=0
converted=0
skipped=0

for f in "$DIR"/*.jpg "$DIR"/*.jpeg "$DIR"/*.png; do
  [ -e "$f" ] || continue
  size=$(stat -c%s "$f")
  if [ "$size" -lt 512000 ]; then
    continue
  fi
  out="$f.webp"
  if [ -e "$out" ] && [ "$out" -nt "$f" ]; then
    skipped=$((skipped + 1))
    continue
  fi
  cwebp -quiet -q "$QUALITY" "$f" -o "$out"
  outsize=$(stat -c%s "$out")
  total_before=$((total_before + size))
  total_after=$((total_after + outsize))
  converted=$((converted + 1))
done

echo "Converted: $converted  Skipped (already up to date): $skipped"
if [ "$converted" -gt 0 ]; then
  echo "Before: $((total_before / 1024 / 1024)) MB  After: $((total_after / 1024 / 1024)) MB"
  echo "Reduction: $(( (total_before - total_after) * 100 / total_before ))%"
fi
