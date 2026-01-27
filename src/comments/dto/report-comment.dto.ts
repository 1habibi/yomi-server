import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportReason } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReportCommentDto {
  @ApiProperty({
    description: 'Причина жалобы',
    enum: ReportReason,
    example: ReportReason.SPAM,
  })
  @IsEnum(ReportReason, { message: 'Неверная причина жалобы' })
  reason: ReportReason;

  @ApiPropertyOptional({
    description: 'Дополнительное описание жалобы',
    example: 'Этот комментарий содержит спам и рекламу',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Описание не может быть длиннее 500 символов' })
  description?: string;
}
