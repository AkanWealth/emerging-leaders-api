import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateModule3Dto {
  @ApiProperty() @IsString() projectPurpose: string;
  @ApiProperty() @IsString() skills: string;
  @ApiProperty() @IsString() experience: string;
  @ApiProperty() @IsString() resources: string;
  @ApiProperty() @IsString() people: string;
  @ApiProperty() @IsString() timeAvailability: string;

  @ApiProperty() @IsString() focusPoint1: string;
  @ApiProperty() @IsString() focusPoint2: string;
  @ApiProperty() @IsString() focusPoint3: string;

  @ApiProperty() @IsString() peopleIKnow: string;
  @ApiProperty() @IsString() peopleINeedToKnow: string;

  @ApiProperty() @IsString() what: string;
  @ApiProperty() @IsString() when: string;
  @ApiProperty() @IsString() who: string;

  @ApiProperty() @IsString() leadYourProjectNote: string;
  @ApiProperty() @IsString() additionalNotes: string;

  @ApiProperty() @IsString() oneYearFromNow: string;

  @ApiProperty() @IsString() week1Income: string;
  @ApiProperty() @IsString() week1Total: string;
  @ApiProperty() @IsString() week1Expenses: string;
  @ApiProperty() @IsString() week1ProfitLoss: string;
  @ApiProperty() @IsString() week1Cashflow: string;

  @ApiProperty() @IsString() week2Income: string;
  @ApiProperty() @IsString() week2Total: string;
  @ApiProperty() @IsString() week2Expenses: string;
  @ApiProperty() @IsString() week2ProfitLoss: string;
  @ApiProperty() @IsString() week2Cashflow: string;

  @ApiProperty() @IsString() week3Income: string;
  @ApiProperty() @IsString() week3Total: string;
  @ApiProperty() @IsString() week3Expenses: string;
  @ApiProperty() @IsString() week3ProfitLoss: string;
  @ApiProperty() @IsString() week3Cashflow: string;

  @ApiProperty() @IsString() week4Income: string;
  @ApiProperty() @IsString() week4Total: string;
  @ApiProperty() @IsString() week4Expenses: string;
  @ApiProperty() @IsString() week4ProfitLoss: string;
  @ApiProperty() @IsString() week4Cashflow: string;
}
