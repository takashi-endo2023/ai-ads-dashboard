import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  SchemaType,
  type Schema,
} from '@google/generative-ai';
import { AdsService, MediumSummary } from '../ads/ads.service';

export interface ActionItem {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  expectedEffect: string;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  actions: ActionItem[];
  generatedAt: string;
}

const RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    score: {
      type: SchemaType.NUMBER,
      description: '広告パフォーマンス総合スコア (0〜100)',
    },
    summary: {
      type: SchemaType.STRING,
      description: '広告全体のパフォーマンスに関する総評（200字程度）',
    },
    actions: {
      type: SchemaType.ARRAY,
      description: '改善アクションのリスト',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: 'アクションのタイトル' },
          description: {
            type: SchemaType.STRING,
            description: 'アクションの詳細説明（100字程度）',
          },
          priority: {
            type: SchemaType.STRING,
            enum: ['HIGH', 'MEDIUM', 'LOW'],
            description: '優先度',
          },
          expectedEffect: {
            type: SchemaType.STRING,
            description: '期待される効果（50字程度）',
          },
        },
        required: ['title', 'description', 'priority', 'expectedEffect'],
      },
    },
  },
  required: ['score', 'summary', 'actions'],
};

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
  private cachedResult: AnalysisResult | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly adsService: AdsService,
  ) {}

  getCachedResult(): AnalysisResult | null {
    return this.cachedResult;
  }

  async generate(): Promise<AnalysisResult> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('GEMINI_API_KEY is not configured');
    }

    const summary = this.adsService.getSummary();
    const prompt = this.buildPrompt(summary);

    this.logger.log('Calling Gemini API for analysis...');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text) as AnalysisResult;

    this.cachedResult = {
      ...parsed,
      generatedAt: new Date().toISOString(),
    };

    this.logger.log(`Analysis generated. Score: ${parsed.score}`);
    return this.cachedResult;
  }

  private buildPrompt(summary: MediumSummary[]): string {
    const lines = summary.map((s) => {
      const ctrPct = (s.ctr * 100).toFixed(2);
      return `
【${s.medium.toUpperCase()}】
  - 総広告費: ¥${s.totalSpend.toLocaleString()}
  - インプレッション: ${s.impressions.toLocaleString()}
  - クリック数: ${s.clicks.toLocaleString()}
  - CTR: ${ctrPct}%
  - 申し込み数: ${s.applications}件
  - 完了数: ${s.completions}件
  - CRA（申し込み単価）: ¥${s.cra.toLocaleString()}
  - CRP（完了単価）: ¥${s.crp.toLocaleString()}`;
    });

    return `
あなたはデジタル広告の専門アナリストです。
以下は過去30日間の広告媒体別パフォーマンスデータです。このデータを分析し、
総合スコア（0〜100）、全体の総評、および具体的な改善アクションを提案してください。

スコアの基準:
- 70〜100: 優秀（CRAが低く、完了率が高い）
- 40〜69: 普通（改善の余地あり）
- 0〜39: 要改善（コスト効率が悪い）

${lines.join('\n')}

改善アクションは3〜5件を目安に、HIGH/MEDIUM/LOW の優先度で分類してください。
各アクションは具体的かつ実行可能なものにしてください。
`;
  }
}
