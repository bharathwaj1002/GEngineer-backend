import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Track } from '@prisma/client';

export class CreateAssignmentDto {
  @IsString()
  candidateId!: string;

  @IsEnum(Track)
  track!: Track;

  @IsOptional()
  @IsString()
  taskVersion?: string;

  @IsDateString()
  startDate!: string;

  @IsString()
  startTime!: string;

  @IsDateString()
  deadline!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
