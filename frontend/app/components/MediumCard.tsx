'use client';

import type { MediumSummary } from '../lib/api';

const MEDIUM_CONFIG: Record<
  string,
  { label: string; accent: string; bg: string; border: string }
> = {
  google: {
    label: 'Google',
    accent: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.3)',
  },
  meta: {
    label: 'Meta',
    accent: '#a855f7',
    bg: 'rgba(168,85,247,0.08)',
    border: 'rgba(168,85,247,0.3)',
  },
  yahoo: {
    label: 'Yahoo!',
    accent: '#f97316',
    bg: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.3)',
  },
};

function formatYen(n: number): string {
  return `¥${n.toLocaleString('ja-JP')}`;
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

interface Props {
  data: MediumSummary;
}

export default function MediumCard({ data }: Props) {
  const cfg = MEDIUM_CONFIG[data.medium] ?? {
    label: data.medium,
    accent: '#94a3b8',
    bg: 'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.3)',
  };

  const completionRate =
    data.applications > 0
      ? ((data.completions / data.applications) * 100).toFixed(1)
      : '0.0';

  return (
    <div
      style={{
        background: '#1e293b',
        border: `1px solid ${cfg.border}`,
        borderRadius: 12,
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: cfg.accent,
          borderRadius: '12px 12px 0 0',
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 13,
            color: cfg.accent,
          }}
        >
          {cfg.label.charAt(0)}
        </div>
        <div>
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>{cfg.label}</div>
          <div style={{ color: '#64748b', fontSize: 12 }}>過去30日間</div>
        </div>
      </div>

      {/* Primary metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Metric label="CRA（申込単価）" value={formatYen(data.cra)} accent={cfg.accent} large />
        <Metric label="CRP（完了単価）" value={formatYen(data.crp)} accent={cfg.accent} large />
      </div>

      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}
      >
        <Metric label="総広告費" value={formatYen(data.totalSpend)} accent="#94a3b8" />
        <Metric label="申し込み" value={`${data.applications}件`} accent="#94a3b8" />
        <Metric label="完了率" value={`${completionRate}%`} accent="#94a3b8" />
        <Metric label="クリック数" value={data.clicks.toLocaleString()} accent="#94a3b8" />
        <Metric label="インプレッション" value={(data.impressions / 1000).toFixed(1) + 'K'} accent="#94a3b8" />
        <Metric label="CTR" value={formatPct(data.ctr)} accent="#94a3b8" />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
  large,
}: {
  label: string;
  value: string;
  accent: string;
  large?: boolean;
}) {
  return (
    <div>
      <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div
        style={{
          color: large ? accent : '#e2e8f0',
          fontSize: large ? 22 : 15,
          fontWeight: large ? 700 : 500,
          letterSpacing: large ? '-0.02em' : 0,
        }}
      >
        {value}
      </div>
    </div>
  );
}
