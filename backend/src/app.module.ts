import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdsModule } from './ads/ads.module';
import { AnalysisModule } from './analysis/analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AdsModule,
    AnalysisModule,
  ],
})
export class AppModule {}
