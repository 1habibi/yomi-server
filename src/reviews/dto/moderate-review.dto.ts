import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class ModerateReviewDto {
  @ApiProperty({
    description: 'Статус после модерации',
    enum: ['APPROVED', 'REJECTED'],
    example: 'APPROVED',
  })
  @IsEnum(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({
    description: 'Причина отклонения (обязательно если REJECTED)',
    minLength: 10,
    maxLength: 500,
    example: 'Рецензия содержит нецензурную лексику',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  rejection_reason?: string;
}
