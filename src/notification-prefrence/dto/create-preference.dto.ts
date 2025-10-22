import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateNotificationPreferenceDto {
  @ApiProperty({
    description: 'Notification type (e.g., ALL, REMINDER, PROMOTION)',
    example: 'ALL',
    default: 'ALL',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Notification channel (e.g., PUSH, EMAIL, IN_APP)',
    example: 'EMAIL',
  })
  @IsString()
  channel: string;

  @ApiProperty({
    description: 'Enable or disable notifications for this channel (default: true)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean = true;
}
