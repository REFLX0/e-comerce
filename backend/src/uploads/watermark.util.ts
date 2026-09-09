import sharp from 'sharp';

/**
 * "specpart" repeated diagonally across the entire photo (not just a corner
 * tag) so the mark can't be cropped or cloned out. Bold, low-opacity white
 * text with a faint dark shadow for legibility over both light and dark
 * backgrounds.
 */
export async function applyWatermark(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer, { failOn: 'none' });
  const metadata = await image.metadata();
  const width = metadata.width ?? 800;
  const height = metadata.height ?? 800;

  const fontSize = Math.max(10, Math.round(width * 0.045));
  const tileWidth = fontSize * 6.5;
  const tileHeight = fontSize * 4.5;
  const textY = tileHeight * 0.65;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="wm" width="${tileWidth}" height="${tileHeight}" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <text x="1" y="${textY + 1}" font-family="Arial, Helvetica, sans-serif" font-weight="700"
            font-size="${fontSize}" fill="black" fill-opacity="0.16">specpart</text>
          <text x="0" y="${textY}" font-family="Arial, Helvetica, sans-serif" font-weight="700"
            font-size="${fontSize}" fill="white" fill-opacity="0.3">specpart</text>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#wm)" />
    </svg>
  `;

  return image
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toBuffer();
}
