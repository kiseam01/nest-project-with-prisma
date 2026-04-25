import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType } from '@prisma/client';
import { FileUploadService } from './file-upload.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('fileType') fileType?: FileType,
  ) {
    return this.fileUploadService.upload(file, fileType || FileType.ANY);
  }
}