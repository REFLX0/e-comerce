import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // OptionalJwtAuthGuard extracts the verified user from the cookie/header if
  // present, so `userEmail` below always reflects who's actually logged in —
  // it is never taken from the request body.
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  chat(@Body() dto: ChatRequestDto, @CurrentUser('email') userEmail?: string) {
    return this.chatService.chat(dto.messages, userEmail);
  }
}
