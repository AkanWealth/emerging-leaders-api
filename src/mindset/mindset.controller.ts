import { Controller, Get, Param } from '@nestjs/common';
import { MindsetService } from './mindset.service';

@Controller('mindset')
export class MindsetController {
  constructor(private readonly mindsetService: MindsetService) {}

  /** Fetch cards for a group */
  @Get('group/:name')
  async getGroupCards(@Param('name') name: string) {
    const cards = await this.mindsetService.getGroupCards(name);
    return cards.map(c => ({ id: c.id, text: c.text, order: c.order }));
  }
}
