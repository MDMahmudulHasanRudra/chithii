// Plans and prices for chithii.com/pricing. Change a price here and the page,
// the yearly totals and the comparison table all follow.
//
// Prices are set per plan, not converted: BDT for Bangladesh, USD for everyone
// else. Yearly prices are about two months free, rounded to a whole monthly figure.
// Benchmarked on 14 Nov 2026 against REVE Chat, Intercom, Tidio, Crisp,
// Zendesk, Freshchat, LiveAgent, Zoho SalesIQ and tawk.to.

export type Currency = 'bdt' | 'usd';

export interface Price {
  /** Price per month when billed monthly. */
  monthly: number;
  /** Total for a year when billed yearly. */
  yearly: number;
  /** Each seat above the included ones, per month. */
  extraSeat: number;
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

// Taka in the Bangladeshi grouping (৳1,48,800), dollars in the usual one.
const fmt: Record<Currency, Intl.NumberFormat> = { bdt: new Intl.NumberFormat('en-IN'), usd: new Intl.NumberFormat('en-US') };
export const money = (c: Currency, n: number) => `${symbol[c]}${fmt[c].format(Math.round(n))}`;
/** What a yearly plan costs per month. */
export const perMonthYearly = (p: Price) => p.yearly / 12;

export const trialDays = 14;

export const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'One brand and a small team, every channel in one inbox, with AI answering from your knowledge.',
    price: {
      bdt: { monthly: 5900, yearly: 58800, extraSeat: 1500 },
      usd: { monthly: 49, yearly: 492, extraSeat: 12 },
    },
    limits: { seats: '3 seats', projects: '1 project', whatsapp: '1 WhatsApp number' },
    highlights: [
      'WhatsApp, Messenger, Instagram, Telegram and website chat',
      'Shared inbox with notes, tags, priority and snooze',
      'AI replies from your knowledge, in Bangla, English and Banglish',
      'Automation rules and menu bots',
      'Roles and permissions',
      'Core reports',
    ],
    cta: { label: `Start ${trialDays}-day free trial`, subject: 'Free trial: Chithii Starter' },
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For support and sales teams that run on SLAs, and shops that sell in the chat.',
    popular: true,
    price: {
      bdt: { monthly: 14900, yearly: 148800, extraSeat: 1200 },
      usd: { monthly: 129, yearly: 1284, extraSeat: 10 },
    },
    limits: { seats: '10 seats', projects: '3 projects', whatsapp: '3 WhatsApp numbers' },
    includesFrom: 'Starter',
    highlights: [
      'AI Copilot, Conversation Learning and mood detection',
      'Automatic routing, SLA assignment and escalations',
      'Tickets, follow-ups, shifts, roster and leave',
      'All 22 reports, with customer satisfaction (CSAT)',
      'Clients, contacts, leads and sales pipeline',
      'Orders, bKash and SSLCOMMERZ payment links, courier booking',
      'Shopify, WooCommerce and Google Sheets',
    ],
    cta: { label: `Start ${trialDays}-day free trial`, subject: 'Free trial: Chithii Growth' },
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Several brands or clients, bigger teams, and your own systems connected.',
    price: {
      bdt: { monthly: 34900, yearly: 348000, extraSeat: 1000 },
      usd: { monthly: 299, yearly: 2988, extraSeat: 8 },
    },
    limits: { seats: '25 seats', projects: '10 projects', whatsapp: '10 WhatsApp numbers' },
    includesFrom: 'Growth',
    highlights: [
      'Social Studio: calendar, approvals and publishing',
      'Public API and signed webhooks (n8n, Zapier, your systems)',
      'Product knowledge from your repository',
      'Setup of your channels and knowledge by our team',
      'Priority support with a named contact',
    ],
    cta: { label: `Start ${trialDays}-day free trial`, subject: 'Free trial: Chithii Business' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Large teams, many brands, and terms agreed in a contract.',
    price: null,
    limits: { seats: '50+ seats', projects: 'Custom projects', whatsapp: 'Custom numbers' },
    includesFrom: 'Business',
    highlights: [
      'Seats, projects and numbers sized to you',
      'Response and uptime commitments in your contract',
      'A dedicated success manager',
      'Invoice and bank-transfer billing',
      'Help migrating from your current tool',
    ],
    cta: { label: 'Talk to us', subject: 'Chithii Enterprise' },
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
      { label: 'Team seats included', cells: ['3', '10', '25', '50+'] },
      { label: 'Projects (brands or clients)', cells: ['1', '3', '10', 'Custom'] },
      { label: 'WhatsApp numbers', cells: ['1', '3', '10', 'Custom'] },
      { label: 'Conversations and contacts', cells: ['Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'] },
    ],
  },
  {
    title: 'Channels and inbox',
    rows: [
      { label: 'WhatsApp Official API, Messenger, Instagram, Telegram, website chat', cells: [true, true, true, true] },
      { label: 'Shared inbox, notes, tags, priority, status and snooze', cells: [true, true, true, true] },
      { label: 'Desktop and mobile, with push notifications', cells: [true, true, true, true] },
    ],
  },
  {
    title: 'AI and automation',
    rows: [
      { label: 'AI replies from your knowledge, with confidence and hand-over', cells: [true, true, true, true] },
      { label: 'Bring your own AI provider (Claude, OpenAI, Gemini, OpenRouter, Ollama)', cells: [true, true, true, true] },
      { label: 'Knowledge base and communication style', cells: [true, true, true, true] },
      { label: 'Automation rules and menu bots', cells: [true, true, true, true] },
      { label: 'AI Copilot for agents', cells: [false, true, true, true] },
      { label: 'Conversation Learning and AI sandbox', cells: [false, true, true, true] },
      { label: 'Mood detection', cells: [false, true, true, true] },
      { label: 'Product knowledge from your repository', cells: [false, false, true, true] },
    ],
  },
  {
    title: 'Team and support operations',
    rows: [
      { label: 'Roles and permissions', cells: [true, true, true, true] },
      { label: 'Notification Center', cells: [true, true, true, true] },
      { label: 'Automatic routing (round robin or least busy)', cells: [false, true, true, true] },
      { label: 'Support assignment with SLA, and escalations', cells: [false, true, true, true] },
      { label: 'Tickets and follow-ups', cells: [false, true, true, true] },
      { label: 'Shifts, roster and leave', cells: [false, true, true, true] },
    ],
  },
  {
    title: 'Reports',
    rows: [
      { label: 'Reports', cells: ['Core', 'All 22', 'All 22', 'All 22'] },
      { label: 'Customer satisfaction (CSAT)', cells: [false, true, true, true] },
    ],
  },
  {
    title: 'Customers and commerce',
    rows: [
      { label: 'Clients, contacts, leads and pipeline', cells: [false, true, true, true] },
      { label: 'Product catalogue and orders', cells: [false, true, true, true] },
      { label: 'bKash and SSLCOMMERZ payment links', cells: [false, true, true, true] },
      { label: 'Steadfast, Pathao and RedX courier booking', cells: [false, true, true, true] },
      { label: 'Shopify, WooCommerce and Google Sheets', cells: [false, true, true, true] },
    ],
  },
  {
    title: 'Platform',
    rows: [
      { label: 'Social Studio', cells: [false, false, true, true] },
      { label: 'Public API and signed webhooks', cells: [false, false, true, true] },
      { label: 'Every reply recorded: who sent what, when', cells: [true, true, true, true] },
    ],
  },
  {
    title: 'Help from our team',
    rows: [
      { label: 'Support', cells: ['Email', 'Email and chat', 'Priority, named contact', 'Dedicated manager'] },
      { label: 'Setup of channels and knowledge', cells: ['Guides', 'Guided call', 'Done for you', 'Done for you'] },
      { label: 'Contract with response and uptime commitments', cells: [false, false, false, true] },
    ],
  },
];

export const pricingFaqs = [
  {
    q: 'Is there a free trial?',
    a: `Yes. Every plan can be tried free for ${trialDays} days with your own channels. No payment is taken until you decide to continue.`,
  },
  {
    q: 'Does AI cost extra?',
    a: 'Not from us. Chithii does not charge per AI reply or per resolution. You connect your own AI provider, and its usage is billed by that provider at its own rates, usually a small fraction of a seat. <a href="/ai-transparency">How we use AI</a>.',
  },
  {
    q: 'What is a seat?',
    a: 'One team member who signs in and answers customers. Seats can be added at any time at the extra-seat price of your plan, and removed at the next renewal.',
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
    a: 'bKash, cards through SSLCOMMERZ, or bank transfer. Yearly plans are billed once a year and include two months free.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. Upgrade at any time and the new modules switch on straight away. Moving to a smaller plan takes effect at your next renewal. Switching a module off never deletes its data.',
  },
  {
    q: 'Do payment gateways and couriers charge separately?',
    a: 'Yes. Payment links go to your own bKash or SSLCOMMERZ merchant account and courier bookings to your own Steadfast, Pathao or RedX account, at their own fees.',
  },
];
