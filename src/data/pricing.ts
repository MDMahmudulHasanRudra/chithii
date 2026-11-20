// Pricing for chithii.com/pricing and the homepage. The numbers and words live in pricing.json, which the
// admin portal (chithii.com/admin) edits: saving there commits pricing.json to GitHub and Cloudflare
// rebuilds the site. This file only adds types and the values worked out from it (yearly prices).
//
// Taka is for Bangladesh, dollars for everyone else; other currencies are converted from the dollar
// prices in the visitor's browser (public/js/pricing-currency.js). Yearly billing is
// `yearlyDiscountPercent` off the monthly price.
import data from './pricing.json';

export type Currency = 'bdt' | 'usd';

export interface Price {
  /** Price per month when billed monthly. 0 = the free plan. */
  monthly: number;
  /** Total for a year when billed yearly (worked out from monthly and the discount). */
  yearly: number;
  /** Each seat above the included ones, per month. null = seats cannot be added. */
  extraSeat: number | null;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  /** null = priced per contract. */
  price: Record<Currency, Price> | null;
  popular?: boolean;
  limits: { seats: string; projects: string; whatsapp: string; storage: string };
  includesFrom?: string;
  highlights: string[];
  cta: { label: string; subject: string };
}

export type Cell = boolean | string;
export interface Row {
  label: string;
  cells: [Cell, Cell, Cell, Cell];
}
export interface RowGroup {
  title: string;
  rows: Row[];
}

export interface Addon {
  name: string;
  icon: string;
  /** null = included or by arrangement; see `note`. */
  price: Record<Currency, number> | null;
  per: string;
  note?: string;
  body: string;
}

export interface CustomOption {
  id: string;
  label: string;
  price: Record<Currency, number>;
  perSeat?: boolean;
  in: string[];
}
export interface CustomGroup {
  title: string;
  options: CustomOption[];
}

export const symbol: Record<Currency, string> = { bdt: '৳', usd: '$' };

// Taka in the Bangladeshi grouping (৳1,01,880), whole taka. Dollars with cents when there are any ($9.99).
const fmt = {
  bdt: new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }),
  usdWhole: new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }),
  usdCents: new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
};
export const money = (c: Currency, n: number) => {
  if (c === 'bdt') return `${symbol.bdt}${fmt.bdt.format(Math.round(n))}`;
  const cents = Math.round(n * 100);
  return `${symbol.usd}${(cents % 100 === 0 ? fmt.usdWhole : fmt.usdCents).format(cents / 100)}`;
};

export const discount = data.yearlyDiscountPercent / 100;
export const yearlyDiscount = `${data.yearlyDiscountPercent}%`;
export const trialDays: number = data.trialDays;

/** A month's price when paying yearly: taka to the whole taka, dollars to the cent. */
const yearlyMonth = (c: Currency, monthly: number) =>
  c === 'bdt' ? Math.round(monthly * (1 - discount)) : Math.round(monthly * (1 - discount) * 100) / 100;

/** What a yearly plan costs per month. */
export const perMonthYearly = (p: Price) => p.yearly / 12;

/** Shared rates on every paid plan. */
export const rates = data.rates as {
  extraSeat: Record<Currency, number>;
  extraProject: Record<Currency, number>;
  extraStorage: Record<Currency, number>;
};

type RawPlan = (typeof data.plans)[number];
const toPlan = (p: RawPlan): Plan => ({
  id: p.id,
  name: p.name,
  tagline: p.tagline,
  popular: p.popular || undefined,
  includesFrom: p.includesFrom ?? undefined,
  limits: p.limits,
  highlights: p.highlights,
  cta: p.cta,
  price: p.price
    ? {
        bdt: { monthly: p.price.bdt.monthly, extraSeat: p.price.bdt.extraSeat, yearly: Math.round(yearlyMonth('bdt', p.price.bdt.monthly) * 12 * 100) / 100 },
        usd: { monthly: p.price.usd.monthly, extraSeat: p.price.usd.extraSeat, yearly: Math.round(yearlyMonth('usd', p.price.usd.monthly) * 12 * 100) / 100 },
      }
    : null,
});

export const isFree = (plan: Plan) => plan.price !== null && plan.price.usd.monthly === 0;

export const plans: Plan[] = data.plans.map(toPlan);
export const comparison = data.comparison as RowGroup[];
export const addons = data.addons as Addon[];
export const valueComparison = data.valueComparison as {
  checked: string;
  rate: number;
  rows: { name: string; usd: number; bdt?: number; note: string; ours?: boolean }[];
};
export const custom = {
  seats: data.custom.seats as number,
  base: data.custom.base as Record<Currency, number>,
  extraSeat: rates.extraSeat,
  extraProject: rates.extraProject,
  includes: data.custom.includes as string[],
  groups: data.custom.groups as CustomGroup[],
};
export const pricingFaqs = data.faqs as { q: string; a: string }[];
