import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export const createS3Client = (configService: ConfigService): S3Client => {
  const accessKeyId = configService.get<string>('S3_ACCESS_KEY_ID');
  const secretAccessKey = configService.get<string>('S3_SECRET_ACCESS_KEY');

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('S3 credentials are not configured');
  }

  return new S3Client({
    endpoint: `https://${configService.get('S3_ENDPOINT')}`,
    region: configService.get('S3_REGION'),
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: false,
  });
};
