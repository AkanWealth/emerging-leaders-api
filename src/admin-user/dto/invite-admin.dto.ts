// admin/dto/invite-admin.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class InviteAdminDto {
  @ApiProperty({ example: 'admin.candidate@example.com', description: 'Email of the user to invite as admin' })
  email: string;
}
