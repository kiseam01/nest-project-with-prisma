import { Injectable } from '@nestjs/common';
import { FileType } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly prisma: PrismaService,
  ) {}

  async upload(file: Express.Multer.File, fileType: FileType = FileType.ANY) {
    const uploaded = await this.cloudinary.uploadFile(file);

    return this.prisma.fileInstance.create({
      data: {
        filename: uploaded.public_id,
        originalFilename: file.originalname,
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        mimeType: file.mimetype,
        size: file.size,
        fileType,
      },
    });
  }
}
