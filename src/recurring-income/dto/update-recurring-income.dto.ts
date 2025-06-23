import { PartialType } from '@nestjs/swagger';
import { CreateRecurringIncomeDto } from './create-recurring-income.dto';

export class UpdateRecurringIncomeDto extends PartialType(CreateRecurringIncomeDto) {}
