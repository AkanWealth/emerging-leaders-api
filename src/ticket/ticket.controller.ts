import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/decorators/guards/admin.guard';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @ApiOperation({ summary: 'User creates a new support ticket' })
  create(@Req() req, @Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto, req.user.id);
  }

  @Get('my')
  @ApiOperation({ summary: 'User views their own tickets' })
  findMyTickets(@Req() req) {
    return this.ticketService.findUserTickets(req.user.id);
  }

  // ADMIN ROUTES
 @Get()
@UseGuards(AdminGuard)
@ApiOperation({ summary: 'Admin views all tickets' })
async findAll(
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query('ticketNumber') ticketNumber?: string,
  @Query('status') status?: string,
  @Query('userId') userId?: string,
) {
  return this.ticketService.findAll({
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10,
    ticketNumber,
    status,
    userId,
  });
}


  @Get(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin views single ticket by ID' })
  findOne(@Param('id') id: string) {
    return this.ticketService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin updates ticket status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.ticketService.updateStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin deletes a ticket' })
  delete(@Param('id') id: string) {
    return this.ticketService.delete(id);
  }

  @Get('admin/summary')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin sees ticket summary (counts)' })
  count() {
    return this.ticketService.countStatus();
  }
}
