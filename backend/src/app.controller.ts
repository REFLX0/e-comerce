import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('contact')
  submitContact(@Body() body: any) {
    console.log('Received contact message:', body);
    return { success: true, message: 'Message reçu' };
  }
}
