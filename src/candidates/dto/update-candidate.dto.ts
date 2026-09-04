import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCandidateDto } from './create-candidate.dto';

export class UpdateCandidateDto extends PartialType(OmitType(CreateCandidateDto, ['email'] as const)) {}
