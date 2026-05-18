'use client';

import type { AnalysisResult, ActionItem } from '../lib/api';

const PRIORITY_CONFIG: Record<
  ActionItem['priority'],
  { label: string; color: string; bg: string; border: string }
> = {
  HIGH:   { label: 'HIGH',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)'   },
  MEDIUM: { label: 'MEDIUM', color: '#eab308', bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.3)'   },
  LOW:    { label: 'LOW',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.3)'   },
};

function scoreColor(score: number): string {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#eab308';
  return '#ef4444';
}

function scoreLabel(score: number): string {
  if (score >= 70) return '優秀';
  if (score >= 40) return '普通';
  return '要改善';
}

interface Props {
  result: AnalysisResult;
}

export default function AnalysisResultView({ result }: Props) {
  const color = scoreColor(result.score);
  const label = scoreLabel(result.score);
  const generatedAt = result.generatedAt
    ? new Date(result.generatedAt).toLocaleString('ja-JP')
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Score section */}
      <div
        style={{
          background: '#1e293b',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12,
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* Gauge */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: `6px solid ${color}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 24px ${color}40`,
              background: `${color}10`,
            }}
          >
            <div style={{ color, fontSize: 32, fontWeight: 800, lineHeight: 1 }}>
              {result.score}
            </div>
            <div style={{ color, fontSize: 10, fontWeight: 600, opacity: 0.8 }}>/ 100</div>
          </div>
          <div
            style={{
              marginTop: 8,
              color,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {label}
          </div>
        </div>

        {/* Summary */}
        <div style={{ flex: 1 }}>
          <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
            総評 — 生成日時: {generatedAt}
          </div>
          <p
            style={{
              color: '#e2e8f0',
              fontSize: 15,
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            {result.summary}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div>
        <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          改善アクション ({result.actions.length}件)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {result.actions.map((action, idx) => (
            <ActionCard key={idx} action={action} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ action, index }: { action: ActionItem; index: number }) {
  const p = PRIORITY_CONFIG[action.priority];

  return (
    <div
      style={{
        background: '#1e293b',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 12,
        alignItems: 'start',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span
            style={{
              color: '#64748b',
              fontSize: 12,
              fontWeight: 700,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 4,
              padding: '1px 6px',
            }}
          >
            #{index + 1}
          </span>
          <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15 }}>{action.title}</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: '0 0 10px' }}>
          {action.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#475569', fontSize: 12 }}>期待効果:</span>
          <span style={{ color: '#cbd5e1', fontSize: 13 }}>{action.expectedEffect}</span>
        </div>
      </div>

      <div
        style={{
          background: p.bg,
          border: `1px solid ${p.border}`,
          color: p.color,
          fontSize: 11,
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: 6,
          whiteSpace: 'nowrap',
          letterSpacing: '0.05em',
        }}
      >
        {p.label}
      </div>
    </div>
  );
}
