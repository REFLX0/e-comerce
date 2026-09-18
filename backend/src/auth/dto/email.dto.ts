import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { normalizeEmail } from '../../common/utils/normalize-email';

/** Shared body shape for the endpoints that take nothing but an address. */
export class EmailDto {
  @ApiProperty()
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail()
  email: string;
}
