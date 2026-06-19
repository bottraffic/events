import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const SOURCES = [
  'FACEBOOK', 'INSTAGRAM', 'GOOGLE_ADS', 'TIKTOK', 'WHATSAPP', 'WEBSITE', 'PHONE', 'REFERRAL', 'OTHER',
] as const;

export class CreateLeadDto {
  @IsString() name!: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsEnum(SOURCES as unknown as object) source?: string;
  @IsOptional() @IsString() stageId?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsNumber() estimatedValue?: number;
  @IsOptional() @IsString() assignedToId?: string;
  @IsOptional() @IsString() campaignId?: string;
}

export class UpdateLeadDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsEnum(SOURCES as unknown as object) source?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsNumber() estimatedValue?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) score?: number;
  @IsOptional() @IsString() assignedToId?: string;
}

export class MoveStageDto {
  @IsString() stageId!: string;
}

export class CreateActivityDto {
  @IsString() type!: string; // CALL | EMAIL | WHATSAPP | NOTE | MEETING
  @IsOptional() body?: string;
}

export class ReminderDto {
  @IsEnum(['1h', 'tomorrow', 'next_week'] as unknown as object)
  when!: '1h' | 'tomorrow' | 'next_week';
  @IsOptional() @IsString() message?: string;
}
