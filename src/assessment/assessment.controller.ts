import {
  Body,
  Controller,
  Post,
  Put,
  Delete,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { SubmitAssessmentResponseDto } from './dto/submit-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminGuard } from 'src/common/decorators/guards/admin.guard';


@ApiTags('Assessment')
@ApiBearerAuth()
@Controller('assessment')
export class AssessmentController {
  constructor(private readonly service: AssessmentService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  @ApiOperation({ summary: 'Admin creates a new assessment' })
  create(@Body() dto: CreateAssessmentDto) {
    return this.service.createAssessment(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Admin updates an assessment' })
  update(@Param('id') id: string, @Body() dto: UpdateAssessmentDto) {
    return this.service.updateAssessment(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Admin deletes an assessment' })
  delete(@Param('id') id: string) {
    return this.service.deleteAssessment(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('question')
  @ApiOperation({ summary: 'Admin adds question to assessment' })
  addQuestion(@Body() dto: CreateQuestionDto) {
    return this.service.addQuestion(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  @ApiOperation({ summary: 'User submits assessment responses' })
  submitResponse(@Body() dto: SubmitAssessmentResponseDto) {
    const userId = 'mock-user-id'; // Replace with real token extraction
    return this.service.submitResponse(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Admin views all assessments with stats' })
  getAll() {
    return this.service.getAssessmentsWithStats();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id/lock')
  lock(@Param('id') id: string) {
    return this.service.lockAssessment(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id/unlock')
  unlock(@Param('id') id: string) {
    return this.service.unlockAssessment(id);
  }
}
