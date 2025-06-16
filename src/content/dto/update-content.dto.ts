// dto/update-content.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '../../enums/content-status.enum';

export class UpdateContentDto {
  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  categoryId?: string;

  @ApiPropertyOptional({ type: [String] })
  fileLinks?: string[];

  @ApiPropertyOptional({ enum: ContentStatus })
  status?: ContentStatus;
}
