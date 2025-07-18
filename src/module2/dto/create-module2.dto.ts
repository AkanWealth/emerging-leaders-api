import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateModule2Dto {
  @ApiProperty() @IsString() goodFinancialManagement: string;
  @ApiProperty() @IsString() badFinancialManagement: string;
  @ApiProperty() @IsString() biggerYesShortTerm: string;
  @ApiProperty() @IsString() biggerYesMediumTerm: string;
  @ApiProperty() @IsString() biggerYesLongTerm: string;
  @ApiProperty() @IsString() leadershipMindsetInMoney: string;
  @ApiProperty() @IsString() savingFor: string;
  @ApiProperty() @IsNumber() howMuchToSave: number;
  @ApiProperty() @IsNumber() incomeAmount: number;
  @ApiProperty() @IsString() expensesToCut: string;
  @ApiProperty() @IsString() savingsLocation: string;
  @ApiProperty() @IsString() trackSavings: string;
  @ApiProperty() @IsString() wantsVsNeeds: string;

  @ApiProperty() @IsNumber() income1: number;
  @ApiProperty() @IsNumber() income2: number;
  @ApiProperty() @IsNumber() income3: number;
  @ApiProperty() @IsNumber() otherIncome: number;

  @ApiProperty() @IsNumber() food: number;
  @ApiProperty() @IsNumber() house: number;
  @ApiProperty() @IsNumber() travel: number;
  @ApiProperty() @IsNumber() rent: number;
  @ApiProperty() @IsNumber() mobile: number;
  @ApiProperty() @IsNumber() medical: number;
  @ApiProperty() @IsNumber() education: number;
  @ApiProperty() @IsNumber() funFund: number;
  @ApiProperty() @IsNumber() other1: number;
  @ApiProperty() @IsNumber() other2: number;

  @ApiProperty() @IsString() financeLeadershipStep: string;
}
