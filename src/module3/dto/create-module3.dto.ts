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
}
