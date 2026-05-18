import { Injectable } from '@nestjs/common';
import { adSpendData, crmUsers } from '../mock/mock-data';

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

@Injectable()
export class AdsService {
  getSummary(): MediumSummary[] {
    const mediums = ['google', 'meta', 'yahoo'] as const;

    return mediums.map((medium) => {
      const rows = adSpendData.filter((r) => r.medium === medium);
      const totalSpend = rows.reduce((s, r) => s + r.spend, 0);
      const clicks = rows.reduce((s, r) => s + r.clicks, 0);
      const impressions = rows.reduce((s, r) => s + r.impressions, 0);

      const users = crmUsers.filter((u) => u.medium === medium);
      const applications = users.length;
      const completions = users.filter((u) => u.status === 'completed').length;

      const cra = applications > 0 ? Math.round(totalSpend / applications) : 0;
      const crp = completions > 0 ? Math.round(totalSpend / completions) : 0;
      const ctr = impressions > 0 ? clicks / impressions : 0;

      return { medium, totalSpend, clicks, impressions, applications, completions, cra, crp, ctr };
    });
  }

  getDaily(): DailySpendRow[] {
    // Collect all unique dates, sorted ascending
    const dates = [...new Set(adSpendData.map((r) => r.date))].sort();

    return dates.map((date) => {
      const dayRows = adSpendData.filter((r) => r.date === date);
      const get = (m: string) => dayRows.find((r) => r.medium === m)?.spend ?? 0;
      return { date, google: get('google'), meta: get('meta'), yahoo: get('yahoo') };
    });
  }
}
