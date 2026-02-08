import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Текст сообщения',
    example: 'Привет! Как дела?',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @ApiProperty({
    description: 'URL изображения (опционально)',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_url?: string;
}

export class EditMessageDto {
  @ApiProperty({
    description: 'Новый текст сообщения',
    example: 'Обновленный текст',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;
}
