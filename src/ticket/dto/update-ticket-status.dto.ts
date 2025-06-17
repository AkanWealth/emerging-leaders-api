// update-ticket-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../../enums/ticket-status.enum'; 

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: TicketStatus, description: 'Ticket status' })
  @IsNotEmpty()
  @IsEnum(TicketStatus, { message: 'Status must be one of: PENDING, IN_PROGRESS, RESOLVED' })
  status: TicketStatus;
}
