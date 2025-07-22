import {
  Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards,
} from '@nestjs/common';
import { FinanceSetupService } from './finance-setup.service';
import { CreateFinanceSetupDto } from './dto/create-finance-setup.dto';
import { UpdateFinanceSetupDto } from './dto/update-finance-setup.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from 'src/types/request-with-user'; 

@ApiTags('Finance Setup')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finance-setup')
export class FinanceSetupController {
  constructor(private readonly financeService: FinanceSetupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a finance setup' })
  @ApiResponse({ status: 201, description: 'Finance setup created' })
  create(@Req() req: RequestWithUser, @Body() dto: CreateFinanceSetupDto) {
    return this.financeService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all finance setups for current user' })
  findAll(@Req() req: RequestWithUser) {
    return this.financeService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one finance setup by ID' })
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.financeService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update finance setup by ID' })
  update(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateFinanceSetupDto) {
    return this.financeService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete finance setup by ID' })
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.financeService.remove(req.user.id, id);
  }
}
