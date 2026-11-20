// Plans and prices for chithii.com/pricing. Change a price here and the page, the yearly totals,
// the comparison tables, the Custom calculator and the homepage FAQ all follow.
//
// Pricing from 17 Nov 2026: plans start at ৳999 and every paid plan includes more seats than the
// competitors' (Starter 5, Growth 8, Enterprise 15), every channel including WhatsApp, and unlimited
// AI replies. Extra seat ৳200, extra project ৳500, 5 GB storage included with +5 GB for ৳150, Social
// Studio ৳850. Benchmarked against REVE Chat, Tidio, Crisp, Intercom, Zendesk, Freshchat, LiveAgent,
// Zoho SalesIQ and tawk.to (their published prices, 14–16 Nov 2026). Taka for Bangladesh, dollars
// for everyone else; yearly billing is 15% off.

export type Currency = 'bdt' | 'usd';

export interface Price {
  /** Price per month when billed monthly. 0 = the free plan. */
  monthly: number;
  /** Total for a year when billed yearly. */
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

export const symbol: Record<Currency, string> = { bdt: '৳', usd: '$' };

// Taka in the Bangladeshi grouping (৳1,01,990), whole taka. Dollars with cents when there are any ($9.99).
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
/** What a yearly plan costs per month. */
export const perMonthYearly = (p: Price) => p.yearly / 12;
export const yearlyDiscount = '15%';
export const trialDays = 14;

/** Shared rates on every paid plan. */
export const rates = {
  extraSeat: { bdt: 200, usd: 1.99 } as Record<Currency, number>,
  extraProject: { bdt: 500, usd: 4.99 } as Record<Currency, number>,
  extraStorage: { bdt: 150, usd: 1.49 } as Record<Currency, number>, // per 5 GB
};

export const isFree = (plan: Plan) => plan.price !== null && plan.price.usd.monthly === 0;

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'For one person trying Chithii on a website and a Facebook Page.',
    price: {
      bdt: { monthly: 0, yearly: 0, extraSeat: null },
      usd: { monthly: 0, yearly: 0, extraSeat: null },
    },
    limits: { seats: '1 seat', projects: '1 project', whatsapp: 'No WhatsApp number', storage: '1 GB storage' },
    highlights: [
      'Website chat and Facebook Messenger',
      'Shared inbox with notes, tags and snooze',
      'AI replies from your knowledge, with your own AI key',
      'Automation rules',
      'Desktop and mobile, with push notifications',
    ],
    cta: { label: 'Get started free', subject: 'Chithii Free plan' },
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For a small business answering customers on WhatsApp, Facebook and Instagram.',
    price: {
      bdt: { monthly: 999, yearly: 10190, extraSeat: 200 },
      usd: { monthly: 9.99, yearly: 101.88, extraSeat: 1.99 },
    },
    limits: { seats: '5 seats', projects: '1 project', whatsapp: '1 WhatsApp number', storage: '5 GB storage' },
    includesFrom: 'Free',
    highlights: [
      'WhatsApp Official API, Instagram and Telegram',
      'Unlimited AI replies in Bangla, English and Banglish',
      'Knowledge base and menu bots',
      'Tickets and follow-ups',
      'Product catalogue, orders and bKash or SSLCOMMERZ payment links',
      'Shopify and WooCommerce',
      'Core reports',
    ],
    cta: { label: `Start ${trialDays}-day free trial`, subject: 'Free trial: Chithii Starter' },
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For a growing support or sales team that runs on SLAs and sells in the chat.',
    popular: true,
    price: {
      bdt: { monthly: 2999, yearly: 30590, extraSeat: 200 },
      usd: { monthly: 24.99, yearly: 254.88, extraSeat: 1.99 },
    },
    limits: { seats: '8 seats', projects: '3 projects', whatsapp: '3 WhatsApp numbers', storage: '20 GB storage' },
    includesFrom: 'Starter',
    highlights: [
      'Automatic routing, SLA assignment and escalations',
      'AI Copilot, Conversation Learning and mood detection',
      'Shifts, roster, leave, roles and permissions',
      'All 22 reports, with customer satisfaction (CSAT)',
      'Clients, contacts, leads and sales pipeline',
      'Steadfast, Pathao and RedX courier booking',
      'Google Sheets',
    ],
    cta: { label: `Start ${trialDays}-day free trial`, subject: 'Free trial: Chithii Growth' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For larger teams running several brands, with your own systems connected.',
    price: {
      bdt: { monthly: 7999, yearly: 81590, extraSeat: 200 },
      usd: { monthly: 64.99, yearly: 662.88, extraSeat: 1.99 },
    },
    limits: { seats: '15 seats', projects: '10 projects', whatsapp: '10 WhatsApp numbers', storage: '50 GB storage' },
    includesFrom: 'Growth',
    highlights: [
      'Social Studio: calendar, approvals and publishing',
      'Public API and signed webhooks (n8n, Zapier, your systems)',
      'Product knowledge from your repository',
      'Setup of your channels and knowledge by our team',
      'Priority support with a named contact',
    ],
    cta: { label: `Start ${trialDays}-day free trial`, subject: 'Free trial: Chithii Enterprise' },
  },
];

/** The comparison table. `true` = included, `false` = not, a string = included with that limit. */
export type Cell = boolean | string;
export interface Row {
  label: string;
  cells: [Cell, Cell, Cell, Cell];
}
export interface RowGroup {
  title: string;
  rows: Row[];
}

export const comparison: RowGroup[] = [
  {
    title: 'Plan limits',
    rows: [
      { label: 'Team seats included', cells: ['1', '5', '8', '15'] },
      { label: 'Extra seats (৳200 each)', cells: [false, true, true, true] },
      { label: 'Projects (brands or clients)', cells: ['1', '1 + add-on', '3 + add-on', '10 + add-on'] },
      { label: 'WhatsApp numbers', cells: [false, '1', '3', '10'] },
      { label: 'Storage for files and media', cells: ['1 GB', '5 GB', '20 GB', '50 GB'] },
      { label: 'Conversations and contacts', cells: ['Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'] },
      { label: 'AI replies', cells: ['Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'] },
    ],
  },
  {
    title: 'Channels and inbox',
    rows: [
      { label: 'Website chat and Facebook Messenger', cells: [true, true, true, true] },
      { label: 'WhatsApp Official API', cells: [false, true, true, true] },
      { label: 'Instagram and Telegram', cells: [false, true, true, true] },
      { label: 'Shared inbox, notes, tags, priority, status and snooze', cells: [true, true, true, true] },
      { label: 'Desktop and mobile, with push notifications', cells: [true, true, true, true] },
    ],
  },
  {
    title: 'AI and automation',
    rows: [
      { label: 'AI replies from your knowledge, with confidence and hand-over', cells: [true, true, true, true] },
      { label: 'Bring your own AI provider (Claude, OpenAI, Gemini, OpenRouter, Ollama)', cells: [true, true, true, true] },
      { label: 'Automation rules', cells: [true, true, true, true] },
      { label: 'Knowledge base, communication style and menu bots', cells: [false, true, true, true] },
      { label: 'AI Copilot for agents', cells: [false, 'Add-on', true, true] },
      { label: 'Conversation Learning and AI sandbox', cells: [false, false, true, true] },
      { label: 'Mood detection', cells: [false, false, true, true] },
      { label: 'Product knowledge from your repository', cells: [false, false, false, true] },
    ],
  },
  {
    title: 'Team and support operations',
    rows: [
      { label: 'Notification Center', cells: [true, true, true, true] },
      { label: 'Tickets and follow-ups', cells: [false, true, true, true] },
      { label: 'Automatic routing (round robin or least busy)', cells: [false, 'Add-on', true, true] },
      { label: 'Support assignment with SLA, and escalations', cells: [false, 'Add-on', true, true] },
      { label: 'Shifts, roster and leave', cells: [false, false, true, true] },
      { label: 'Roles and permissions', cells: [false, false, true, true] },
    ],
  },
  {
    title: 'Reports',
    rows: [
      { label: 'Reports', cells: ['Basic', 'Core', 'All 22', 'All 22'] },
      { label: 'Customer satisfaction (CSAT)', cells: [false, false, true, true] },
    ],
  },
  {
    title: 'Customers and commerce',
    rows: [
      { label: 'Product catalogue and orders', cells: [false, true, true, true] },
      { label: 'bKash and SSLCOMMERZ payment links', cells: [false, true, true, true] },
      { label: 'Shopify and WooCommerce', cells: [false, true, true, true] },
      { label: 'Clients, contacts, leads and pipeline', cells: [false, 'Add-on', true, true] },
      { label: 'Steadfast, Pathao and RedX courier booking', cells: [false, 'Add-on', true, true] },
      { label: 'Google Sheets', cells: [false, 'Add-on', true, true] },
    ],
  },
  {
    title: 'Platform',
    rows: [
      { label: 'Every reply recorded: who sent what, when', cells: [true, true, true, true] },
      { label: 'Social Studio', cells: [false, 'Add-on', 'Add-on', true] },
      { label: 'Public API and signed webhooks', cells: [false, false, 'Add-on', true] },
    ],
  },
  {
    title: 'Help from our team',
    rows: [
      { label: 'Support', cells: ['Email', 'Email and chat', 'Email and chat', 'Priority, named contact'] },
      { label: 'Setup of channels and knowledge', cells: ['Guides', 'Guides', 'Guided call', 'Done for you'] },
    ],
  },
];

export interface Addon {
  name: string;
  icon: string;
  /** null = included or by arrangement; see `note`. */
  price: Record<Currency, number> | null;
  per: string;
  note?: string;
  body: string;
}

/** Add-ons for paid plans. Each one is a seat, number, project, storage or a module the app's billing can switch on. */
export const addons: Addon[] = [
  {
    name: 'AI replies',
    icon: 'sparkles',
    price: null,
    per: '',
    note: 'Included, unlimited',
    body: 'No AI conversation packs to buy. AI answers as many customers as you have, through your own AI provider.',
  },
  {
    name: 'Extra seat',
    icon: 'users',
    price: rates.extraSeat,
    per: '/ seat / mo',
    body: 'Add a team member to any paid plan, and remove them at your next renewal.',
  },
  {
    name: 'Extra project',
    icon: 'layers',
    price: rates.extraProject,
    per: '/ project / mo',
    body: 'Another brand or client with its own channels, team, knowledge and settings.',
  },
  {
    name: 'Extra storage',
    icon: 'server',
    price: rates.extraStorage,
    per: '/ 5 GB / mo',
    body: 'More room for the photos, voice notes and documents your customers send.',
  },
  {
    name: 'Social Studio',
    icon: 'calendar',
    price: { bdt: 850, usd: 6.99 },
    per: '/ mo',
    body: 'Plan, approve and publish posts to Facebook and Instagram from a shared calendar, for Starter and Growth.',
  },
  {
    name: 'Routing and SLA',
    icon: 'route',
    price: { bdt: 500, usd: 4.49 },
    per: '/ mo',
    body: 'Automatic assignment, response deadlines and escalations, for Starter.',
  },
  {
    name: 'AI Copilot',
    icon: 'wand',
    price: { bdt: 100, usd: 0.99 },
    per: '/ seat / mo',
    body: 'Summaries, suggested replies and rewrites inside every conversation, for Starter.',
  },
  {
    name: 'CRM, couriers and Sheets',
    icon: 'truck',
    price: { bdt: 400, usd: 3.49 },
    per: '/ mo',
    body: 'Clients, leads and pipeline, Steadfast, Pathao and RedX booking, and Google Sheets, for Starter.',
  },
  {
    name: 'API and webhooks',
    icon: 'plug',
    price: { bdt: 600, usd: 4.99 },
    per: '/ mo',
    body: 'Scoped API keys and signed webhooks to your own systems, n8n or Zapier, for Growth.',
  },
];

/**
 * What a 5-person team pays for WhatsApp, Messenger, Instagram and AI replies, from each vendor's
 * published price list (14–16 Nov 2026, monthly billing unless noted), converted at ৳122.5 per US dollar.
 * Update or remove a row when a vendor changes its prices.
 */
export const valueComparison = {
  checked: '16 November 2026',
  rate: 122.5,
  rows: [
    { name: 'Chithii Starter', usd: 9.99, bdt: 999, note: '5 seats included, WhatsApp included, unlimited AI replies', ours: true },
    { name: 'REVE Chat Growth', usd: 87.97, note: '3 seats + 2 extra; 250 AI conversations a month' },
    { name: 'Tidio Growth + Lyro AI', usd: 81.67, note: 'Lyro AI from 50 conversations a month; billed yearly' },
    { name: 'Crisp Essentials', usd: 95, note: 'about 450 automated AI conversations a month' },
    { name: 'Freshchat Growth', usd: 95, note: '$19 per agent; AI Copilot costs extra' },
    { name: 'Intercom Essential', usd: 145, note: '$29 per seat, plus $0.99 per AI resolution' },
    { name: 'Zendesk Suite Team', usd: 345, note: '$69 per agent; AI Copilot $50 per agent extra' },
  ] as { name: string; usd: number; bdt?: number; note: string; ours?: boolean }[],
};

/**
 * The Custom plan: pick channels and features one by one. The base covers what every plan has
 * (5 seats, 1 project, website chat, the shared inbox, AI replies with your own key, automation
 * rules, core reports, 5 GB). `in` lists the standard plans that already include the option, so
 * the page can say when a standard plan covers the same picks for less.
 */
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

export const custom = {
  /** Seats included, like every paid plan. */
  seats: 5,
  base: { bdt: 599, usd: 5.99 } as Record<Currency, number>,
  extraSeat: rates.extraSeat,
  extraProject: rates.extraProject,
  includes: ['5 seats and 1 project', '5 GB storage', 'Website chat', 'Shared inbox', 'AI replies with your own key', 'Automation rules', 'Core reports'],
  groups: [
    {
      title: 'Channels',
      options: [
        { id: 'messenger', label: 'Facebook Messenger', price: { bdt: 100, usd: 0.99 }, in: ['free', 'starter', 'growth', 'enterprise'] },
        { id: 'instagram', label: 'Instagram Direct', price: { bdt: 150, usd: 1.49 }, in: ['starter', 'growth', 'enterprise'] },
        { id: 'telegram', label: 'Telegram', price: { bdt: 100, usd: 0.99 }, in: ['starter', 'growth', 'enterprise'] },
        { id: 'whatsapp', label: 'WhatsApp Official API (1 number)', price: { bdt: 300, usd: 2.49 }, in: ['starter', 'growth', 'enterprise'] },
      ],
    },
    {
      title: 'AI and automation',
      options: [
        { id: 'knowledge', label: 'Knowledge base and menu bots', price: { bdt: 150, usd: 1.49 }, in: ['starter', 'growth', 'enterprise'] },
        { id: 'copilot', label: 'AI Copilot, Conversation Learning, mood detection', price: { bdt: 100, usd: 0.99 }, perSeat: true, in: ['growth', 'enterprise'] },
        { id: 'repo', label: 'Product knowledge from your repository', price: { bdt: 600, usd: 4.99 }, in: ['enterprise'] },
      ],
    },
    {
      title: 'Team and support',
      options: [
        { id: 'tickets', label: 'Tickets and follow-ups', price: { bdt: 150, usd: 1.49 }, in: ['starter', 'growth', 'enterprise'] },
        { id: 'routing', label: 'Automatic routing, SLA and escalations', price: { bdt: 500, usd: 4.49 }, in: ['growth', 'enterprise'] },
        { id: 'shifts', label: 'Shifts, roster, leave, roles and permissions', price: { bdt: 300, usd: 2.49 }, in: ['growth', 'enterprise'] },
        { id: 'reports', label: 'All 22 reports with CSAT', price: { bdt: 400, usd: 3.49 }, in: ['growth', 'enterprise'] },
      ],
    },
    {
      title: 'Sales and commerce',
      options: [
        { id: 'orders', label: 'Product catalogue, orders and bKash or SSLCOMMERZ payment links', price: { bdt: 250, usd: 1.99 }, in: ['starter', 'growth', 'enterprise'] },
        { id: 'shops', label: 'Shopify and WooCommerce', price: { bdt: 150, usd: 1.49 }, in: ['starter', 'growth', 'enterprise'] },
        { id: 'crm', label: 'Clients, contacts, leads and pipeline', price: { bdt: 200, usd: 1.99 }, in: ['growth', 'enterprise'] },
        { id: 'courier', label: 'Steadfast, Pathao and RedX courier booking', price: { bdt: 150, usd: 1.49 }, in: ['growth', 'enterprise'] },
        { id: 'sheets', label: 'Google Sheets', price: { bdt: 100, usd: 0.99 }, in: ['growth', 'enterprise'] },
      ],
    },
    {
      title: 'Platform',
      options: [
        { id: 'social', label: 'Social Studio', price: { bdt: 850, usd: 6.99 }, in: ['enterprise'] },
        { id: 'api', label: 'Public API and signed webhooks', price: { bdt: 600, usd: 4.99 }, in: ['enterprise'] },
      ],
    },
  ] as CustomGroup[],
};

export const pricingFaqs = [
  {
    q: 'Why is Chithii priced like this?',
    a: 'Most tools charge per agent and again for AI, so a five-person team pays for five seats plus AI packs. Chithii plans include five or more seats, every channel including WhatsApp, and unlimited AI replies, so you pay one plan price. The comparison above shows the difference.',
  },
  {
    q: 'Is there a free plan?',
    a: `Yes. The Free plan is for one person, with website chat and Facebook Messenger, and it has no time limit. Every paid plan can also be tried free for ${trialDays} days with your own channels; no payment is taken until you decide to continue.`,
  },
  {
    q: 'Does AI cost extra?',
    a: 'Not from us, and AI replies are not capped on any plan. You connect your own AI provider and pay it directly for what you use, usually a few hundred taka a month for a small business. <a href="/ai-transparency">How we use AI</a>.',
  },
  {
    q: 'What is a seat?',
    a: 'One team member who signs in and answers customers. Every paid plan includes at least 5 seats (Starter 5, Growth 8, Enterprise 15), and more can be added at ৳200 a seat a month, then removed at the next renewal.',
  },
  {
    q: 'What counts as storage?',
    a: 'The photos, voice notes, videos and documents sent and received in conversations, and files you upload to Chithii. Starter includes 5 GB, Growth 20 GB and Enterprise 50 GB; each extra 5 GB is ৳150 a month.',
  },
  {
    q: 'How much do I save by paying yearly?',
    a: `${yearlyDiscount} on every paid plan. Yearly plans are billed once a year.`,
  },
  {
    q: 'What does WhatsApp cost on top?',
    a: 'Meta charges for some WhatsApp Business Platform conversations under its own pricing. Those charges are between your business and Meta; Chithii adds nothing to them.',
  },
  {
    q: 'Which prices apply to me?',
    a: 'Taka (৳) prices are for businesses in Bangladesh. Dollar prices are for everyone else. Prices exclude VAT where it applies.',
  },
  {
    q: 'How can I pay?',
    a: 'bKash, cards through SSLCOMMERZ, or bank transfer.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. Upgrade at any time and the new modules switch on straight away. Moving to a smaller plan takes effect at your next renewal. Switching a module off never deletes its data.',
  },
  {
    q: 'What add-ons are there?',
    a: 'Extra seats, projects and storage, and modules from a higher plan, such as Social Studio, routing and SLA, AI Copilot, CRM and couriers, and the API. Add-ons are billed with your plan and can be removed at renewal.',
  },
  {
    q: 'How does the Custom plan work?',
    a: 'Tick only the channels and features you need, set your seats and projects, and the price updates as you go. If a standard plan already covers everything you picked for less, the page says so, and you can choose either.',
  },
  {
    q: 'Do payment gateways and couriers charge separately?',
    a: 'Yes. Payment links go to your own bKash or SSLCOMMERZ merchant account and courier bookings to your own Steadfast, Pathao or RedX account, at their own fees.',
  },
  {
    q: 'I need more than 15 seats or 10 projects.',
    a: 'Add seats and projects to any paid plan, or <a href="/contact">talk to us</a> about a plan sized to your team.',
  },
];
