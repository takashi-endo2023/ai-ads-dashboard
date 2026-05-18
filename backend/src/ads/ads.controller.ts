import { Controller, Get } from '@nestjs/common';
import { AdsService, DailySpendRow, MediumSummary } from './ads.service';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get('summary')
  getSummary(): MediumSummary[] {
    return this.adsService.getSummary();
  }

  @Get('daily')
  getDaily(): DailySpendRow[] {
    return this.adsService.getDaily();
  }
}
