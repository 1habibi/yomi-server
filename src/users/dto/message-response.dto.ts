import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    example: 'Операция выполнена успешно',
    description: 'Сообщение о результате операции',
  })
  message: string;
}
