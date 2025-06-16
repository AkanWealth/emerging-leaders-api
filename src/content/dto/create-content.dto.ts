// dto/create-content.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ContentStatus } from '../../enums/content-status.enum';

export class CreateContentDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty({ type: [String], description: 'Array of file URLs (already uploaded)' })
  fileLinks: string[];

  @ApiProperty({ enum: ContentStatus, default: ContentStatus.DRAFT })
  status: ContentStatus;
}
