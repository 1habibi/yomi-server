import {
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as sharp from 'sharp';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @Inject('S3_CLIENT') private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.checkS3Connection();
  }

  private async checkS3Connection(): Promise<void> {
    try {
      const bucketName = this.configService.get<string>('S3_BUCKET_NAME');
      
      if (!bucketName) {
        throw new Error('S3_BUCKET_NAME is not configured');
      }

      this.logger.log('Проверка подключения к S3 Selectel...');
      
      await this.s3Client.send(
        new HeadBucketCommand({
          Bucket: bucketName,
        }),
      );

      this.logger.log('✅ Подключение к S3 Selectel успешно установлено');
    } catch (error) {
      this.logger.error(
        '❌ Ошибка подключения к S3 Selectel:',
        error instanceof Error ? error.message : error,
      );
      
      this.logger.warn(
        'Приложение запущено, но загрузка файлов может не работать. ' +
        'Проверьте конфигурацию S3 Selectel.',
      );
    }
  }

  async uploadToS3(fileBuffer: Buffer, userId: string): Promise<string> {
    try {
      const processedBuffer = await sharp(fileBuffer)
        .resize(200, 200, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 80 })
        .toBuffer();
      const fileName = `avatar-${userId}-${Date.now()}-${randomUUID()}.webp`;
      const key = `avatars/${fileName}`;

      const bucketName = this.configService.get('S3_BUCKET_NAME');

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: processedBuffer,
          ContentType: 'image/webp',
          ACL: 'public-read',
        }),
      );

      return this.getPublicUrl(key);
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new InternalServerErrorException(
        'Ошибка загрузки файла в хранилище',
      );
    }
  }

  async deleteFromS3(avatarUrl: string): Promise<void> {
    if (!avatarUrl) return;

    try {
      const key = this.extractKeyFromUrl(avatarUrl);
      const bucketName = this.configService.get('S3_BUCKET_NAME');

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      console.error('S3 delete error:', error);
    }
  }

  private getPublicUrl(key: string): string {
    const publicUrl = this.configService.get('S3_PUBLIC_URL');
    return `${publicUrl}/${key}`;
  }

  private extractKeyFromUrl(url: string): string {
    if (url.startsWith('avatars/')) {
      return url;
    }

    const bucketName = this.configService.get('S3_BUCKET_NAME');
    const publicUrl = this.configService.get('S3_PUBLIC_URL');

    if (url.startsWith(publicUrl)) {
      return url.replace(`${publicUrl}/`, '');
    }

    const match = url.match(new RegExp(`${bucketName}/(.+)$`));
    return match ? match[1] : url;
  }
}
