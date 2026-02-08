import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ActivityType } from '@prisma/client';

export class CreateActivityDto {
  @IsOptional()
  @IsNumber()
  animeId?: number;

  @IsOptional()
  @IsNumber()
  reviewId?: number;

  @IsOptional()
  @IsNumber()
  commentId?: number;

  @IsOptional()
  metadata?: any;
}

export class CreateActivityInternalDto {
  @IsString()
  userId: string;

  @IsEnum(ActivityType)
  type: ActivityType;

  @IsOptional()
  @IsNumber()
  animeId?: number;

  @IsOptional()
  @IsNumber()
  reviewId?: number;

  @IsOptional()
  @IsNumber()
  commentId?: number;

  @IsOptional()
  metadata?: any;
}
