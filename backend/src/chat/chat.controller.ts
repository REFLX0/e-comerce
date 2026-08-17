import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService, ChatMessage } from './chat.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  chat(@Body() body: { messages: ChatMessage[]; userEmail?: string }) {
    return this.chatService.chat(body.messages ?? [], body.userEmail);
  }
}
