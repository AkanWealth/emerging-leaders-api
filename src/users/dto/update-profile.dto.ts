import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  lastname?: string;

  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsNumber()
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsBoolean()
  @IsOptional()
  hasDisability?: boolean;

  @IsString()
  @IsOptional()
  disabilityType?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  followUpPreference?: 'email' | 'calls' | 'calls & email';

  @IsString()
  @IsOptional()
  highestEducationLevel?: string;

  @IsString()
  @IsOptional()
  sourceOfIncome?: string;

  @IsNumber()
  @IsOptional()
  currentMonthlyIncome?: number;

  @IsBoolean()
  @IsOptional()
  doYouSaveRegularly?: boolean;

  @IsString()
  @IsOptional()
  savingFrequency?: 'irregularly' | 'daily' | 'weekly' | 'monthly';

  @IsNumber()
  @IsOptional()
  savingAmount?: number;

  @IsString()
  @IsOptional()
  lifeControlRating?: string;

  @IsString()
  @IsOptional()
  lifeSatisfactionRating?: string;

  @IsString()
  @IsOptional()
  happinessRating?: string;

  @IsString()
  @IsOptional()
  senseOfPurpose?: string;

  @IsBoolean()
  @IsOptional()
  lackOfIncomeSource?: boolean;

  @IsBoolean()
  @IsOptional()
  addiction?: boolean;

  @IsBoolean()
  @IsOptional()
  underageParent?: boolean;

  @IsBoolean()
  @IsOptional()
  lonelinessOrIsolation?: boolean;

  @IsString()
  @IsOptional()
  otherChallenges?: string;
}
