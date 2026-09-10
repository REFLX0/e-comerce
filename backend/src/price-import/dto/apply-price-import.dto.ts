import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class ApplyPriceImportDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  itemIds: string[];
}
