// Plans and prices for chithii.com/pricing. Change a price here and the page,
// the yearly totals, the comparison table and the homepage FAQ all follow.
//
// Since 16 Nov 2026 the plans match REVE Chat's (revechat.com/pricing): the same
// four plans, seats included and dollar prices, with 15% off for yearly billing.
// Taka prices are the dollar prices at about ৳122.5 per dollar, rounded to the
// nearest ৳50; Taka is for Bangladesh, dollars for everyone else.

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
  limits: { seats: string; projects: string; whatsapp: string };
  includesFrom?: string;
  highlights: string[];
  cta: { label: string; subject: string };
}

export const symbol: Record<Currency, string> = { bdt: '৳', usd: '$' };

// Taka in the Bangladeshi grouping (৳3,64,680), whole taka. Dollars with cents when there are any ($14.99).
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
    limits: { seats: '1 seat', projects: '1 project', whatsapp: 'No WhatsApp number' },
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
    tagline: 'For a solo seller or support person who answers on every social channel.',
    price: {
      bdt: { monthly: 1850, yearly: 18840, extraSeat: 1100 },
      usd: { monthly: 14.99, yearly: 152.88, extraSeat: 8.99 },
    },
    limits: { seats: '1 seat', projects: '1 project', whatsapp: 'No WhatsApp number' },
    includesFrom: 'Free',
    highlights: [
      'Instagram and Telegram',
      'Menu bots and a knowledge base in Bangla, English and Banglish',
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
    tagline: 'For a growing team with WhatsApp, SLAs, and sales in the chat.',
    popular: true,
    price: {
      bdt: { monthly: 7350, yearly: 75000, extraSeat: 1700 },
      usd: { monthly: 59.99, yearly: 611.88, extraSeat: 13.99 },
    },
    limits: { seats: '3 seats', projects: '2 projects', whatsapp: '1 WhatsApp number' },
    includesFrom: 'Starter',
    highlights: [
      'WhatsApp Official API',
      'Automatic routing, SLA assignment and escalations',
      'AI Copilot, Conversation Learning and mood detection',
      'Shifts, roster, leave, roles and permissions',
      'All 22 reports, with customer satisfaction (CSAT)',
      'Clients, contacts, leads and sales pipeline',
      'Steadfast, Pathao and RedX courier booking, Google Sheets',
    ],
    cta: { label: `Start ${trialDays}-day free trial`, subject: 'Free trial: Chithii Growth' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For larger teams running several brands, with your own systems connected.',
    price: {
      bdt: { monthly: 35750, yearly: 364680, extraSeat: 3050 },
      usd: { monthly: 291.99, yearly: 2978.28, extraSeat: 24.99 },
    },
    limits: { seats: '10 seats', projects: '5 projects', whatsapp: '3 WhatsApp numbers' },
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
      { label: 'Team seats included', cells: ['1', '1', '3', '10'] },
      { label: 'Extra seats', cells: [false, true, true, true] },
      { label: 'Projects (brands or clients)', cells: ['1', '1', '2', '5'] },
      { label: 'WhatsApp numbers', cells: [false, false, '1', '3'] },
      { label: 'Conversations and contacts', cells: ['Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'] },
      { label: 'AI replies', cells: ['Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'] },
    ],
  },
  {
    title: 'Channels and inbox',
    rows: [
      { label: 'Website chat and Facebook Messenger', cells: [true, true, true, true] },
      { label: 'Instagram and Telegram', cells: [false, true, true, true] },
      { label: 'WhatsApp Official API', cells: [false, false, true, true] },
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
      { label: 'AI Copilot for agents', cells: [false, false, true, true] },
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
      { label: 'Automatic routing (round robin or least busy)', cells: [false, false, true, true] },
      { label: 'Support assignment with SLA, and escalations', cells: [false, false, true, true] },
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
      { label: 'Clients, contacts, leads and pipeline', cells: [false, false, true, true] },
      { label: 'Steadfast, Pathao and RedX courier booking', cells: [false, false, true, true] },
      { label: 'Google Sheets', cells: [false, false, true, true] },
    ],
  },
  {
    title: 'Platform',
    rows: [
      { label: 'Every reply recorded: who sent what, when', cells: [true, true, true, true] },
      { label: 'Social Studio', cells: [false, false, false, true] },
      { label: 'Public API and signed webhooks', cells: [false, false, false, true] },
    ],
  },
  {
    title: 'Help from our team',
    rows: [
      { label: 'Support', cells: ['Email', 'Email', 'Email and chat', 'Priority, named contact'] },
      { label: 'Setup of channels and knowledge', cells: ['Guides', 'Guides', 'Guided call', 'Done for you'] },
    ],
  },
];

export const pricingFaqs = [
  {
    q: 'Is there a free plan?',
    a: `Yes. The Free plan is for one person, with website chat and Facebook Messenger, and it has no time limit. Every paid plan can also be tried free for ${trialDays} days with your own channels; no payment is taken until you decide to continue.`,
  },
  {
    q: 'Does AI cost extra?',
    a: 'Not from us, and AI replies are not capped on any plan. You connect your own AI provider, and its usage is billed by that provider at its own rates, usually a small fraction of a seat. <a href="/ai-transparency">How we use AI</a>.',
  },
  {
    q: 'What is a seat?',
    a: 'One team member who signs in and answers customers. On paid plans, seats can be added at any time at the extra-seat price of your plan, and removed at the next renewal.',
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
    q: 'I need more than 10 seats or 5 projects.',
    a: 'Add seats to Enterprise at the extra-seat price, or <a href="/contact">talk to us</a> about a plan sized to your team.',
  },
];
