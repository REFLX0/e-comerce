import { BadRequestException } from '@nestjs/common';
import * as path from 'path';

/**
 * Shared image-upload validation.
 *
 * Both the extension and the served Content-Type are derived from the
 * *validated* MIME type, never from the client-supplied filename: nginx serves
 * /uploads/ directly off disk using the real extension, so trusting
 * `originalname` turned an image upload into an arbitrary-file write (an
 * .html or .svg upload is script execution on our own origin).
 */
export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIMES)[number];

const MIME_TO_EXTENSION: Record<AllowedImageMime, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

export const IMAGE_UPLOAD_LIMITS = {
  productBytes: 10 * 1024 * 1024,
  avatarBytes: 5 * 1024 * 1024,
};

export function isAllowedImageMime(
  mimetype: string | undefined,
): mimetype is AllowedImageMime {
  return ALLOWED_IMAGE_MIMES.includes(mimetype as AllowedImageMime);
}

/** Multer fileFilter shared by every image-accepting endpoint. */
export function imageFileFilter(
  _req: unknown,
  file: { mimetype: string },
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!isAllowedImageMime(file.mimetype)) {
    return cb(
      new BadRequestException(
        `Unsupported file type "${file.mimetype}". Only JPEG, PNG, WebP, GIF, and AVIF images are allowed.`,
      ),
      false,
    );
  }
  cb(null, true);
}

/**
 * Safe on-disk extension for an upload. Falls back to .jpg rather than to
 * whatever `originalname` claimed.
 */
export function safeImageExtension(mimetype: string | undefined): string {
  return isAllowedImageMime(mimetype) ? MIME_TO_EXTENSION[mimetype] : '.jpg';
}

/** Random, collision-resistant basename with a MIME-derived extension. */
export function safeImageFilename(mimetype: string | undefined): string {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${unique}${safeImageExtension(mimetype)}`;
}

/** Only used for logging - never for building a stored path. */
export function displayName(originalname: string | undefined): string {
  return path.basename(originalname ?? 'upload');
}
