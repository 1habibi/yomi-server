import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SessionResponseDto {
  @ApiProperty({ 
    example: '3935c4cb-e92f-4dd9-8665-169f2c8cab26',
    description: 'Уникальный идентификатор сессии'
  })
  id: string;

  @ApiProperty({ 
    example: 'PostmanRuntime/7.51.0',
    description: 'User-Agent браузера или клиента'
  })
  userAgent: string;

  @ApiPropertyOptional({
    example: '::1',
    description: 'IP-адрес клиента',
    nullable: true
  })
  ipAddress: string | null;

  @ApiProperty({ 
    example: '2025-12-26T12:46:43.797Z',
    description: 'Дата и время последней активности в сессии'
  })
  lastActivity: Date;

  @ApiProperty({ 
    example: '2025-12-26T12:46:28.258Z',
    description: 'Дата и время создания сессии'
  })
  createdAt: Date;

  @ApiProperty({ 
    example: '2026-01-02T12:46:43.797Z',
    description: 'Дата и время истечения сессии'
  })
  expiresAt: Date;

  @ApiProperty({ 
    example: true,
    description: 'Является ли эта сессия текущей (активной)'
  })
  isCurrent: boolean;
}
