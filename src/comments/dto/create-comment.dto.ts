import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Текст комментария',
    example: 'Отличное аниме! Очень понравилось.',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Комментарий не может быть пустым' })
  @MinLength(1, { message: 'Комментарий должен содержать хотя бы 1 символ' })
  @MaxLength(5000, { message: 'Комментарий не может быть длиннее 5000 символов' })
  content: string;

  @ApiPropertyOptional({
    description: 'ID родительского комментария (для ответов)',
    example: 42,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'ID родительского комментария должен быть числом' })
  parent_id?: number;
}
