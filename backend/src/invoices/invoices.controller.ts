import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { Response } from 'express';

@Controller()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  // ── ADMIN ROUTES ──

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/invoices')
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/invoices')
  findAllAdmin() {
    return this.invoicesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/invoices/:id')
  findOneAdmin(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/invoices/:id')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/invoices/:id')
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/invoices/:id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.invoicesService.duplicate(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/invoices/:id/pdf')
  async downloadPdfAdmin(@Param('id') id: string, @Res() res: any) {
    const pdfBuffer = await this.invoicesService.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="facture-${id.slice(-6)}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  // ── USER ROUTES (CUSTOMER PORTAL) ──

  @UseGuards(JwtAuthGuard)
  @Get('invoices')
  findAllUser(@CurrentUser('id') userId: string) {
    return this.invoicesService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('invoices/:id')
  findOneUser(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.invoicesService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('invoices/:id/pdf')
  async downloadPdfUser(@Param('id') id: string, @CurrentUser('id') userId: string, @Res() res: any) {
    const pdfBuffer = await this.invoicesService.generatePdf(id, userId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="facture-${id.slice(-6)}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
