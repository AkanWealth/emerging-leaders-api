import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotebookService } from './notebook.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotebookController {
  constructor(private readonly noteService: NotebookService) {}

  @Post()
  @ApiOperation({ summary: 'Create a personal note' })
  create(@Req() req, @Body() dto: CreateNoteDto) {
    return this.noteService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes for logged-in user' })
  findAll(@Req() req) {
    return this.noteService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single note by ID' })
  findOne(@Req() req, @Param('id') id: string) {
    return this.noteService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note by ID' })
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.noteService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note by ID' })
  remove(@Req() req, @Param('id') id: string) {
    return this.noteService.delete(req.user.id, id);
  }
}
