import { IsObject } from 'class-validator';

export class PatchAnswersDto {
  @IsObject()
  answers!: Record<string, unknown>;
}
