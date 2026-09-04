import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
import { Recommendation } from '@prisma/client';

export class UpsertEvaluationDto {
  @IsOptional() @IsObject() areaScores?: Record<string, number>;
  @IsOptional() @IsInt() @Min(0) @Max(30) finalTechnical?: number;
  @IsOptional() @IsInt() @Min(0) @Max(25) finalTeaching?: number;
  @IsOptional() @IsInt() @Min(0) @Max(25) finalProduction?: number;
  @IsOptional() @IsInt() @Min(0) @Max(20) finalCommunication?: number;
  @IsOptional() @IsEnum(Recommendation) recommendation?: Recommendation;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsBoolean() isFinal?: boolean;
}
