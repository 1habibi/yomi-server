import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

export class LoginResponseDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token для аутентификации запросов'
  })
  accessToken: string;

  @ApiProperty({ 
    example: '6b195d91-ee5e-4bff-aca8-cdb2a35df7ff',
    description: 'Идентификатор сессии пользователя'
  })
  sessionId: string;

  @ApiProperty({ 
    type: UserResponseDto,
    description: 'Данные аутентифицированного пользователя'
  })
  user: UserResponseDto;
}
