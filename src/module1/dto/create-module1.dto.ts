import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateModule1Dto {
  @ApiProperty() @IsString() userId: string;
  @ApiProperty() @IsString() mindset: string;
  @ApiProperty() @IsString() areasGivenAwayPen: string;
  @ApiProperty() @IsString() whatWentWell: string;
  @ApiProperty() @IsString() whatCouldBeBetter: string;
  @ApiProperty() @IsString() whatCouldYouDoForFree: string;
  @ApiProperty() @IsString() goodCharacteristicsToDevelop: string;
  @ApiProperty() @IsString() dreams: string;
  @ApiProperty() @IsString() characterGoals: string;
  @ApiProperty() @IsString() legacy: string;
  @ApiProperty() @IsString() relationshipStoryChange: string;
  @ApiProperty() @IsString() howToGetThere: string;
  @ApiProperty() @IsString() threeFocusPoints1: string;
  @ApiProperty() @IsString() whoDoYouKnow: string;
  @ApiProperty() @IsString() whoDoYouNeedToKnow: string;
  @ApiProperty() @IsString() threeFocusPoints2: string;
  @ApiProperty() @IsString() leadershipStepToTake: string;
}
