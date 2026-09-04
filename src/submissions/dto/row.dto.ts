import { IsObject, IsOptional } from 'class-validator';

export class AddRowDto {
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

export class UpdateRowDto {
  @IsObject()
  data!: Record<string, unknown>;
}
