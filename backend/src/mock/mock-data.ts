export interface AdSpendRow {
  date: string;
  medium: 'google' | 'meta' | 'yahoo';
  impressions: number;
  clicks: number;
  spend: number;
}

export interface CrmUser {
  id: number;
  medium: 'google' | 'meta' | 'yahoo';
  campaign: string;
  appliedAt: string;
  status: 'applied' | 'participated' | 'completed';
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** Seeded pseudo-random so data is deterministic across requests */
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Ad spend: 30 days × 3 mediums = 90 rows ──────────────────────────────────

const BASE_DATE = new Date('2026-04-18');

interface MediumProfile {
  impressionsBase: number;
  impressionsJitter: number;
  ctrBase: number; // clicks / impressions
  cpcBase: number; // spend / clicks  (yen)
}

const MEDIUM_PROFILES: Record<string, MediumProfile> = {
  google: { impressionsBase: 12400, impressionsJitter: 2000, ctrBase: 0.025, cpcBase: 155 },
  meta:   { impressionsBase: 28000, impressionsJitter: 5000, ctrBase: 0.020, cpcBase: 63  },
  yahoo:  { impressionsBase:  8200, impressionsJitter: 1500, ctrBase: 0.020, cpcBase: 134 },
};

function buildAdSpendData(): AdSpendRow[] {
  const rng = seededRng(42);
  const rows: AdSpendRow[] = [];

  for (let day = 0; day < 30; day++) {
    const date = addDays(BASE_DATE, day);
    // Weekend factor — lower on weekends
    const dow = new Date(date).getDay();
    const weekendFactor = dow === 0 || dow === 6 ? 0.7 : 1.0;

    for (const medium of ['google', 'meta', 'yahoo'] as const) {
      const p = MEDIUM_PROFILES[medium];
      const jitter = 1 + (rng() - 0.5) * 0.25; // ±12.5%
      const impressions = Math.round(p.impressionsBase * weekendFactor * jitter);
      const ctrJitter = 1 + (rng() - 0.5) * 0.2;
      const clicks = Math.round(impressions * p.ctrBase * ctrJitter);
      const cpcJitter = 1 + (rng() - 0.5) * 0.15;
      const spend = Math.round(clicks * p.cpcBase * cpcJitter);

      rows.push({ date, medium, impressions, clicks, spend });
    }
  }

  return rows;
}

// ── CRM users: 200 rows ───────────────────────────────────────────────────────

const GOOGLE_CAMPAIGNS = ['brand_keyword', 'competitor_keyword', 'generic_keyword'];
const META_CAMPAIGNS   = ['lookalike_30d', 'retargeting_7d', 'interest_fitness'];
const YAHOO_CAMPAIGNS  = ['display_prospecting', 'search_brand', 'retargeting_14d'];

const CAMPAIGN_MAP: Record<string, string[]> = {
  google: GOOGLE_CAMPAIGNS,
  meta:   META_CAMPAIGNS,
  yahoo:  YAHOO_CAMPAIGNS,
};

// Completion rates: Google 40%, Meta 25%, Yahoo 35%
// applied → participated → completed (applied includes all, participated ~60%, completed per spec)
const COMPLETION_RATES: Record<string, number> = { google: 0.40, meta: 0.25, yahoo: 0.35 };
const PARTICIPATION_RATES: Record<string, number> = { google: 0.65, meta: 0.55, yahoo: 0.60 };

// Medium distribution: allocate 200 users in ~equal thirds with slight variation
const MEDIUM_DISTRIBUTION: Record<string, number> = { google: 68, meta: 72, yahoo: 60 };

function buildCrmUsers(): CrmUser[] {
  const rng = seededRng(99);
  const users: CrmUser[] = [];
  let id = 1;

  for (const medium of ['google', 'meta', 'yahoo'] as const) {
    const count = MEDIUM_DISTRIBUTION[medium];
    const campaigns = CAMPAIGN_MAP[medium];

    for (let i = 0; i < count; i++) {
      const campaignIdx = Math.floor(rng() * campaigns.length);
      const campaign = campaigns[campaignIdx];

      // appliedAt: random day within the 30-day window
      const dayOffset = Math.floor(rng() * 30);
      const appliedAt = addDays(BASE_DATE, dayOffset);

      const roll = rng();
      let status: CrmUser['status'];
      if (roll < COMPLETION_RATES[medium]) {
        status = 'completed';
      } else if (roll < PARTICIPATION_RATES[medium]) {
        status = 'participated';
      } else {
        status = 'applied';
      }

      users.push({ id, medium, campaign, appliedAt, status });
      id++;
    }
  }

  return users;
}

// ── Exports (evaluated once at module load) ───────────────────────────────────

export const adSpendData: AdSpendRow[] = buildAdSpendData();
export const crmUsers: CrmUser[] = buildCrmUsers();
