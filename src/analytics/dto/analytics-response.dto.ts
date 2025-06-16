// src/analytics/dto/analytics-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

class SummaryDto {
  @ApiProperty({ example: 540000 })
  totalIncome: number;

  @ApiProperty({ example: 320000 })
  totalExpense: number;

  @ApiProperty({ example: 220000 })
  net: number;
}

class TrendItemDto {
  @ApiProperty({ example: 'Week 1' })
  label: string;

  @ApiProperty({ example: 100000 })
  income: number;

  @ApiProperty({ example: 50000 })
  expense: number;
}

class BudgetOverviewItemDto {
  @ApiProperty({ example: 'Food' })
  category: string;

  @ApiProperty({ example: '🍔' })
  icon: string;

  @ApiProperty({ example: 100000 })
  budget: number;

  @ApiProperty({ example: 85000 })
  spent: number;

  @ApiProperty({ example: 85 })
  percentage: number;
}

export class AnalyticsOverviewDto {
  @ApiProperty({ type: SummaryDto })
  summary: SummaryDto;

  @ApiProperty({ type: [TrendItemDto] })
  trend: TrendItemDto[];

  @ApiProperty({ type: [BudgetOverviewItemDto] })
  budgetOverview: BudgetOverviewItemDto[];
}
