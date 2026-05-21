# AI 広告分析ダッシュボード

Google・Meta・Yahoo の広告パフォーマンスを一元管理し、Gemini AI による改善提案を自動生成するポートフォリオ用ダッシュボードアプリケーションです。

---

## 主な機能

| 機能 | 概要 |
|------|------|
| **媒体別パフォーマンス表示** | Google / Meta / Yahoo の広告費・クリック数・CTR・申し込み単価（CRA）・完了単価（CRP）をカード形式で一覧表示 |
| **日別広告費推移グラフ** | 過去 30 日間の媒体別広告費を折れ線グラフで可視化 |
| **KPI サマリー** | 全媒体合計の広告費・申し込み数・完了数をヘッダーに常時表示 |
| **AI 分析レポート** | ボタン 1 つで Gemini 2.5 Flash を呼び出し、パフォーマンススコア・総評・優先度付き改善アクションを自動生成 |

---

## 技術スタック

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Next.js 15 / App Router)                     │
│    Recharts  ·  Tailwind CSS 4  ·  TypeScript           │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼────────────────────────────────┐
│  Backend (NestJS 10)                                    │
│    @vendia/serverless-express  ·  Gemini API            │
│    AWS Lambda 対応 (lambda.ts エクスポート)              │
└─────────────────────────────────────────────────────────┘
```

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Next.js 15 (App Router)、React 19、Recharts、Tailwind CSS 4 |
| バックエンド | NestJS 10、TypeScript、`@vendia/serverless-express` |
| AI | Google Gemini 2.5 Flash（`@google/generative-ai`） |
| パッケージ管理 | npm workspaces（モノレポ構成） |
| デプロイ先 | AWS Lambda + API Gateway（バックエンド） |

---

## 動作要件

- **Node.js** 20 以上
- **npm** 10 以上
- **Google Gemini API キー**（[Google AI Studio](https://aistudio.google.com/) で取得可能）

---

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd ai-ads-dashboard
```

### 2. 依存パッケージのインストール

```bash
# ルートのワークスペースリンクを作成
npm install

# バックエンド
cd backend && npm install

# フロントエンド
cd ../frontend && npm install
```

### 3. 環境変数の設定

**バックエンド**

```bash
cp backend/.env.example backend/.env
```

`backend/.env` を開き、Gemini API キーを設定してください。

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

**フロントエンド**

```bash
cp frontend/.env.local.example frontend/.env.local
```

ローカル開発ではデフォルト値のままで問題ありません。

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## ローカル起動

2 つのターミナルを開いて以下を実行してください。

```bash
# ターミナル 1 — バックエンド（ポート 3001）
npm run dev:backend

# ターミナル 2 — フロントエンド（ポート 3000）
npm run dev:frontend
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くとダッシュボードが表示されます。

---

## API リファレンス

| メソッド | パス | 説明 |
|----------|------|------|
| `GET` | `/ads/summary` | 媒体別の集計指標（広告費・CTR・CRA・CRP など）を返す |
| `GET` | `/ads/daily` | 日別の媒体別広告費を返す（グラフ用） |
| `POST` | `/analysis/generate` | Gemini API を呼び出して AI 分析レポートを生成する |

### AI 分析レスポンス例

```json
{
  "score": 72,
  "summary": "全体的に Google の CRA が最も低く効率的です。Meta は申し込み数は多いものの完了率が低い傾向にあります。",
  "actions": [
    {
      "title": "Meta の完了率改善",
      "description": "ランディングページの離脱分析を行い、フォーム最適化を検討してください。",
      "priority": "HIGH",
      "expectedEffect": "完了率が 10〜15% 向上し CRP が改善する見込み"
    }
  ],
  "generatedAt": "2026-05-21T10:00:00.000Z"
}
```

スコアの目安は以下のとおりです。

| スコア | 評価 |
|--------|------|
| 70〜100 | 優秀（CRA が低く完了率が高い） |
| 40〜69 | 普通（改善の余地あり） |
| 0〜39 | 要改善（コスト効率が悪い） |

---

## ディレクトリ構成

```
ai-ads-dashboard/
├── backend/
│   └── src/
│       ├── ads/              # 広告データ集計（コントローラー・サービス）
│       ├── analysis/         # Gemini AI 分析（コントローラー・サービス）
│       ├── mock/             # モックデータ（広告費・CRM ユーザー）
│       ├── app.module.ts
│       ├── main.ts           # ローカル起動エントリーポイント
│       └── lambda.ts         # AWS Lambda ハンドラー
└── frontend/
    └── app/
        ├── components/       # MediumCard・SpendChart・AnalysisResult
        ├── lib/api.ts        # バックエンドへの API クライアント
        └── page.tsx          # ダッシュボードメインページ
```

---

## デプロイ（AWS Lambda）

バックエンドは `@vendia/serverless-express` を使用しており、AWS Lambda + API Gateway への展開に対応しています。

Lambda ハンドラーのエントリーポイントは `backend/src/lambda.ts` です。デプロイ時は以下の手順を参照してください。

```bash
# バックエンドのビルド
cd backend && npm run build
# dist/ 以下のファイルと node_modules を Lambda にパッケージングしてください
```

環境変数 `GEMINI_API_KEY` は Lambda の環境変数または AWS Secrets Manager で管理することを推奨します。

---

## ライセンス

本リポジトリはポートフォリオ目的のサンプルプロジェクトです。
