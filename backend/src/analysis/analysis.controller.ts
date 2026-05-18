import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AnalysisService, AnalysisResult } from './analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(): Promise<AnalysisResult> {
    return this.analysisService.generate();
  }
}
