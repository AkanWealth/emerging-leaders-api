import { PartialType } from '@nestjs/swagger';
import { CreateFinanceSetupDto } from './create-finance-setup.dto';

export class UpdateFinanceSetupDto extends PartialType(CreateFinanceSetupDto) {}
