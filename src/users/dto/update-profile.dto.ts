import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Full name of the user', example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  @IsString()
  @IsOptional()
  firstname?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  @IsString()
  @IsOptional()
  lastname?: string;

  @ApiPropertyOptional({ description: 'Marital status', example: 'Single' })
  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @ApiPropertyOptional({ description: 'Gender', example: 'Male' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Age in years', example: 30 })
  @IsNumber()
  @IsOptional()
  age?: number;

   @ApiPropertyOptional({ description: 'Age Group', example: '40-50' })
  @IsString()
  @IsOptional()
  ageGroup?: string;

  @ApiPropertyOptional({ description: 'Date of birth in YYYY-MM-DD format', example: '1993-04-15' })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Does the user have a disability?', example: false })
  @IsBoolean()
  @IsOptional()
  hasDisability?: boolean;

  @ApiPropertyOptional({ description: 'Type of disability', example: 'Visual impairment' })
  @IsString()
  @IsOptional()
  disabilityType?: string;

  @ApiPropertyOptional({ description: 'City of residence', example: 'Lagos' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Preferred follow up method', example: 'email' })
  @IsString()
  @IsOptional()
  followUpPreference?: 'email' | 'calls' | 'calls & email';

  @ApiPropertyOptional({ description: 'Highest education level attained', example: 'Bachelor\'s Degree' })
  @IsString()
  @IsOptional()
  highestEducationLevel?: string;

  @ApiPropertyOptional({ description: 'Source of income', example: 'Employment' })
  @IsString()
  @IsOptional()
  sourceOfIncome?: string;

  @ApiPropertyOptional({ description: 'Current monthly income', example: 5000 })
  @IsNumber()
  @IsOptional()
  currentMonthlyIncome?: number;

  @ApiPropertyOptional({ description: 'Does the user save money regularly?', example: true })
  @IsBoolean()
  @IsOptional()
  doYouSaveRegularly?: boolean;

  @ApiPropertyOptional({ description: 'Saving frequency', example: 'monthly' })
  @IsString()
  @IsOptional()
  savingFrequency?: 'irregularly' | 'daily' | 'weekly' | 'monthly';

  @ApiPropertyOptional({ description: 'Average saving amount', example: 100 })
  @IsNumber()
  @IsOptional()
  savingAmount?: number;

  @ApiPropertyOptional({ description: 'Life control rating', example: 'Good' })
  @IsString()
  @IsOptional()
  lifeControlRating?: string;

  @ApiPropertyOptional({ description: 'Life satisfaction rating', example: 'High' })
  @IsString()
  @IsOptional()
  lifeSatisfactionRating?: string;

  @ApiPropertyOptional({ description: 'Happiness rating', example: 'Very happy' })
  @IsString()
  @IsOptional()
  happinessRating?: string;

  @ApiPropertyOptional({ description: 'Sense of purpose', example: 'To help others' })
  @IsString()
  @IsOptional()
  senseOfPurpose?: string;

  @ApiPropertyOptional({ description: 'Lack of income source?', example: false })
  @IsBoolean()
  @IsOptional()
  lackOfIncomeSource?: boolean;

  @ApiPropertyOptional({ description: 'Addiction status', example: false })
  @IsBoolean()
  @IsOptional()
  addiction?: boolean;

  @ApiPropertyOptional({ description: 'Is user an underage parent?', example: false })
  @IsBoolean()
  @IsOptional()
  underageParent?: boolean;

  @ApiPropertyOptional({ description: 'Loneliness or isolation status', example: false })
  @IsBoolean()
  @IsOptional()
  lonelinessOrIsolation?: boolean;

  @ApiPropertyOptional({ description: 'Other challenges faced by the user', example: 'None' })
  @IsString()
  @IsOptional()
  otherChallenges?: string;
}
