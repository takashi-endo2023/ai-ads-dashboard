'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  fetchSummary,
  fetchDaily,
  generateAnalysis,
  type MediumSummary,
  type DailySpendRow,
  type AnalysisResult,
} from './lib/api';
import MediumCard from './components/MediumCard';
import SpendChart from './components/SpendChart';
import AnalysisResultView from './components/AnalysisResult';

export default function DashboardPage() {
  const [summary, setSummary] = useState<MediumSummary[]>([]);
  const [daily, setDaily] = useState<DailySpendRow[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const [loadingData, setLoadingData] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchSummary(), fetchDaily()])
      .then(([s, d]) => {
        setSummary(s);
        setDaily(d);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => setLoadingData(false));
  }, []);

  const handleGenerateAnalysis = useCallback(async () => {
    setLoadingAnalysis(true);
    setAnalysisError(null);
    try {
      const result = await generateAnalysis();
      setAnalysis(result);
    } catch (e: unknown) {
      setAnalysisError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingAnalysis(false);
    }
  }, []);

  const totalSpend = summary.reduce((s, m) => s + m.totalSpend, 0);
  const totalApps  = summary.reduce((s, m) => s + m.applications, 0);
  const totalComps = summary.reduce((s, m) => s + m.completions, 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: '#e2e8f0',
        padding: '0 0 60px',
      }}
    >
      {/* Top bar */}
      <header
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: '#0f172a',
          padding: '18px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg,#3b82f6,#a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            📊
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>
              AI広告分析ダッシュボード
            </div>
            <div style={{ color: '#64748b', fontSize: 12 }}>
              AI-Driven Ads Measurement &amp; Analysis
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#64748b' }}>
          <span>過去30日間</span>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ color: '#94a3b8' }}>2026-04-18 〜 2026-05-17</span>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 0' }}>

        {/* KPI strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <KpiCard label="総広告費" value={`¥${totalSpend.toLocaleString()}`} />
          <KpiCard label="総申し込み数" value={`${totalApps}件`} />
          <KpiCard label="総完了数" value={`${totalComps}件`} />
        </div>

        {loadingData && (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
            データを読み込み中...
          </div>
        )}

        {error && (
          <ErrorBanner message={error} />
        )}

        {!loadingData && !error && (
          <>
            {/* Medium cards */}
            <SectionHeader title="媒体別パフォーマンス" sub="過去30日間の合計" />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
                marginBottom: 32,
              }}
            >
              {summary.map((s) => (
                <MediumCard key={s.medium} data={s} />
              ))}
            </div>

            {/* Chart */}
            <SectionHeader title="日別広告費推移" sub="媒体ごとの1日あたり広告費" />
            <div style={{ marginBottom: 40 }}>
              <SpendChart data={daily} />
            </div>
          </>
        )}

        {/* AI Analysis */}
        <SectionHeader
          title="AI分析"
          sub="Gemini 2.5 Flash による広告パフォーマンス分析・改善提案"
        />

        <div style={{ marginBottom: 24 }}>
          <button
            onClick={handleGenerateAnalysis}
            disabled={loadingAnalysis}
            style={{
              background: loadingAnalysis
                ? 'rgba(99,102,241,0.3)'
                : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loadingAnalysis ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'opacity 0.2s',
            }}
          >
            {loadingAnalysis ? (
              <>
                <SpinnerIcon />
                Gemini が分析中...
              </>
            ) : (
              <>✨ 分析を生成</>
            )}
          </button>
        </div>

        {analysisError && <ErrorBanner message={analysisError} />}

        {analysis && <AnalysisResultView result={analysis} />}

        {!analysis && !loadingAnalysis && !analysisError && (
          <div
            style={{
              background: '#1e293b',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '48px 32px',
              textAlign: 'center',
              color: '#475569',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
            <div style={{ fontSize: 15 }}>「分析を生成」ボタンを押すと、AIが広告データを分析して改善提案を提示します。</div>
          </div>
        )}
      </main>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: '#1e293b',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        padding: '16px 20px',
      }}
    >
      <div style={{ color: '#64748b', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ color: '#f1f5f9', fontSize: 17, fontWeight: 700, margin: 0 }}>{title}</h2>
      {sub && <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>{sub}</p>}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 8,
        padding: '12px 16px',
        color: '#fca5a5',
        fontSize: 14,
        marginBottom: 24,
      }}
    >
      エラー: {message}
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
