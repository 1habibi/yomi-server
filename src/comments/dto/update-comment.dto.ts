import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Обновленный текст комментария',
    example: 'Отличное аниме! Очень понравилось. UPD: Пересмотрел - еще лучше!',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Комментарий не может быть пустым' })
  @MinLength(1, { message: 'Комментарий должен содержать хотя бы 1 символ' })
  @MaxLength(5000, { message: 'Комментарий не может быть длиннее 5000 символов' })
  content: string;
}
