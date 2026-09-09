import { ArrayMaxSize, IsArray, IsIn, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Client input is restricted to 'user' | 'assistant' — the service builds its own
// 'system'/'tool' turns internally. Without this, a caller hitting the API directly
// could inject fabricated assistant/system/tool messages into the conversation.
export class ChatMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  @MaxLength(4000)
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({ type: [ChatMessageDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  // Intentionally no `userEmail` field — identity comes from the verified JWT
  // (OptionalJwtAuthGuard + @CurrentUser), never from client-supplied input.
}
