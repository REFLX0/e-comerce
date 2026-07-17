import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly useCloudinary: boolean;

  constructor() {
    this.useCloudinary = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    if (this.useCloudinary) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (this.useCloudinary) {
      return this.uploadToCloudinary(file);
    }
    return this.uploadToLocalDisk(file);
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'specpart/products', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!.secure_url);
          },
        )
        .end(file.buffer);
    });
  }

  private async uploadToLocalDisk(file: Express.Multer.File): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'products');
    await fs.promises.mkdir(uploadDir, { recursive: true });
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, file.buffer);
    this.logger.log(`File saved locally: ${filePath}`);
    return `/uploads/products/${filename}`;
  }
}
