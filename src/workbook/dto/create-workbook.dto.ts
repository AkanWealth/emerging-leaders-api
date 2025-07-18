import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateWorkbookDto {
  @ApiProperty({ example: 'My Leadership Workbook' })
  @IsString()
  title: string;
}
