import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @ApiProperty({
    description: 'Type of notification (e.g., ALL, ASSESSMENT, BROADCAST)',
    example: 'ALL',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Channel of notification (e.g., PUSH, EMAIL, IN_APP)',
    example: 'EMAIL',
  })
  @IsString()
  channel: string;

  @ApiProperty({
    description: 'Enable or disable the preference',
    example: true,
  })
  @IsBoolean()
  enabled: boolean;
}
