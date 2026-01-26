import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { MindsetService } from './mindset.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Mindset')
@Controller('mindset')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MindsetController {
  constructor(private readonly mindsetService: MindsetService) {}

  /** Fetch all cards in a group (admin / preview use) */
  @Get('group/:name')
  async getGroupCards(@Param('name') name: string) {
    const cards = await this.mindsetService.getGroupCards(name);
    return cards.map(c => ({
      id: c.id,
      text: c.text,
      order: c.order,
    }));
  }

  /** Fetch today’s popup cards (what frontend shows as modal) */
  @Get('today')
  async getTodayMindsets(@Req() req) {
    const userId = req.user.id; // from auth guard
    const progress = await this.mindsetService.getTodayCards(userId);

    return progress.map(p => ({
      group: p.group.name,
      cardId: p.cardId,
      text: p.card.text,
      date: p.createdAt,
    }));
  }
}
