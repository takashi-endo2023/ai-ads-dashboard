'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DailySpendRow } from '../lib/api';

interface Props {
  data: DailySpendRow[];
}

const SERIES = [
  { key: 'google', color: '#3b82f6', label: 'Google' },
  { key: 'meta',   color: '#a855f7', label: 'Meta'   },
  { key: 'yahoo',  color: '#f97316', label: 'Yahoo!'  },
] as const;

function formatDate(d: string): string {
  const parts = d.split('-');
  return `${parts[1]}/${parts[2]}`;
}

function formatYen(v: number): string {
  if (v >= 1000) return `¥${(v / 1000).toFixed(0)}K`;
  return `¥${v}`;
}

export default function SpendChart({ data }: Props) {
  const chartData = data.map((r) => ({
    ...r,
    label: formatDate(r.date),
  }));

  return (
    <div
      style={{
        background: '#1e293b',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12,
        padding: '24px',
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>日別広告費推移</div>
        <div style={{ color: '#64748b', fontSize: 13 }}>媒体ごとの1日あたり広告費（円）</div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="label"
            stroke="#475569"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            interval={4}
          />
          <YAxis
            stroke="#475569"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYen}
            width={55}
          />
          <Tooltip
            contentStyle={{
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#e2e8f0',
              fontSize: 13,
            }}
            formatter={(value: number, name: string) => [
              `¥${value.toLocaleString()}`,
              name,
            ]}
            labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 13, color: '#94a3b8', paddingTop: 12 }}
          />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
