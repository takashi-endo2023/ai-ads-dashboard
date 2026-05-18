const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface MediumSummary {
  medium: string;
  totalSpend: number;
  clicks: number;
  impressions: number;
  applications: number;
  completions: number;
  cra: number;
  crp: number;
  ctr: number;
}

export interface DailySpendRow {
  date: string;
  google: number;
  meta: number;
  yahoo: number;
}

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

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchSummary(): Promise<MediumSummary[]> {
  return apiFetch<MediumSummary[]>('/ads/summary');
}

export async function fetchDaily(): Promise<DailySpendRow[]> {
  return apiFetch<DailySpendRow[]>('/ads/daily');
}

export async function generateAnalysis(): Promise<AnalysisResult> {
  return apiFetch<AnalysisResult>('/analysis/generate', { method: 'POST' });
}
