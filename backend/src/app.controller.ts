import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { SubmitContactDto } from './contact.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('contact')
  async submitContact(@Body() body: SubmitContactDto) {
    const msg = await this.prisma.contactMessage.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone ?? null,
        subject: body.subject,
        message: body.message,
        isProfessional: body.isProfessional ?? false,
      },
    });
    return { success: true, id: msg.id };
  }
}
