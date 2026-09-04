import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertMediaReviewDto {
  @IsOptional() @IsInt() @Min(1) @Max(10) topicClarity?: number;
  @IsOptional() @IsInt() @Min(1) @Max(10) unityClarity?: number;
  @IsOptional() @IsInt() @Min(1) @Max(10) nonTechClarity?: number;
  @IsOptional() @IsInt() @Min(1) @Max(10) confidence?: number;
  @IsOptional() @IsInt() @Min(1) @Max(10) overall?: number;
  @IsOptional() @IsString() reviewerNotes?: string;
  @IsOptional() @IsString() questionsAsked?: string;
  @IsOptional() @IsString() explanationSummary?: string;
}
