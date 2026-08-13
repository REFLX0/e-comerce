import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUserCarDto } from './create-user-car.dto';

export class UpdateUserCarDto extends PartialType(CreateUserCarDto) {
  @IsOptional()
  @IsBoolean()
  oilChangeDone?: boolean;
}
