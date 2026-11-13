// Feature catalogue for chithii.com, written from the Chithii app's own module
// registry (see migration-source/app-feature-registry.tsv). Every item here ships
// in the app today. WhatsApp (Legacy, QR-linked) and the bulk group tools are
// deliberately not listed on the public site.

export type Status = 'available' | 'beta';

export interface Feature {
  title: string;
  body: string;
  icon: string;
  points?: string[];
  status?: Status;
}

export interface FeatureGroup {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  icon: string;
  features: Feature[];
}

export const featureGroups: FeatureGroup[] = [
  {
    id: 'inbox',
    eyebrow: 'Omnichannel inbox',
    title: 'Every channel lands in one shared inbox',
    intro:
      'WhatsApp, Facebook Messenger, Instagram, Telegram and your website chat sit side by side. Your team sees every conversation once, with its whole history, and nothing is answered twice or missed.',
    icon: 'inbox',
    features: [
      {
        title: 'One inbox for every channel',
        body: 'All Conversations brings WhatsApp, Messenger, Instagram DM, Telegram and website chat into a single list your whole team works from.',
        icon: 'inbox',
        points: ['Filter by channel, status, person or team', 'Full history on every thread', 'Webhooks recorded so nothing is lost'],
      },
      {
        title: 'WhatsApp chats and groups',
        body: 'A shared WhatsApp inbox for one-to-one chats and the customer groups you support, with profile pictures and group icons.',
        icon: 'whatsapp',
        points: ['Reply as the business from any seat', 'Group support tracked per customer', 'Works with the WhatsApp Business Platform'],
      },
      {
        title: 'WhatsApp Official API',
        body: "Connect a number through Meta's Cloud API: no phone to keep online and no QR code, with delivery receipts and approved templates after the 24-hour window.",
        icon: 'badge',
      },
      {
        title: 'Conversation status and snooze',
        body: 'Open, Pending, Snoozed and Resolved on every conversation. Snooze reopens automatically, and a new customer message can reopen a resolved one.',
        icon: 'clock',
      },
      {
        title: 'A conversation view built for support',
        body: 'Older history on demand, quoted replies, reactions, @mentions, formatting and search inside a conversation.',
        icon: 'message',
      },
      {
        title: 'Internal notes, tags and priority',
        body: 'A side panel with private notes and @mentions, priority, tags and team assignment. Notes are never sent to the customer.',
        icon: 'note',
      },
      {
        title: 'Website chat',
        body: 'Add a chat box to your own website. Visitors write in, and the conversation arrives in the same inbox as every other channel.',
        icon: 'globe',
      },
    ],
  },
  {
    id: 'ai',
    eyebrow: 'AI and automation',
    title: 'AI that answers from your knowledge, and knows when to stop',
    intro:
      'Chithii answers routine questions from the knowledge you give it, in your tone, in Bangla, English or Banglish. When it is not sure, it hands the conversation to a person and tells them why.',
    icon: 'sparkles',
    features: [
      {
        title: 'AI replies from your knowledge base',
        body: 'When no rule matches, AI answers from your verified knowledge. Each reply carries a confidence score; below your threshold it hands over instead of guessing.',
        icon: 'sparkles',
        points: ['Draft-only or automatic, per project', 'Handover reason shown to your team', 'Every AI reply recorded'],
      },
      {
        title: 'Bring your own AI provider',
        body: 'Choose the provider and model for each workspace: Anthropic Claude, OpenAI, Google Gemini, OpenRouter, or a self-hosted model through Ollama or any OpenAI-compatible endpoint.',
        icon: 'cpu',
        points: ['Your keys, stored encrypted', 'Separate models for replies and analysis', 'Switch providers without losing knowledge'],
      },
      {
        title: 'Knowledge base and communication style',
        body: 'Add answers, policies and product details by hand or by import. Chithii also learns how your team writes, so replies sound like you.',
        icon: 'book',
      },
      {
        title: 'AI Copilot for agents',
        body: 'Inside every conversation: a summary with verified knowledge and next steps, a suggested reply, and rewrites of the agent’s own text. Copilot never sends anything by itself.',
        icon: 'wand',
      },
      {
        title: 'Conversation Learning',
        body: 'Spots the questions that keep coming back with no rule to handle them, proposes rules, builds knowledge from real conversations and lets you test it all in an AI sandbox.',
        icon: 'brain',
      },
      {
        title: 'Automation rules',
        body: 'Match messages by keywords or intent, reply instantly, set a category and alert the right people the moment a support request arrives.',
        icon: 'zap',
      },
      {
        title: 'Menu bots',
        body: 'A numbered menu customers answer by typing a number: instant answers to common questions, and a hand-over to a person when they need one.',
        icon: 'list',
      },
      {
        title: 'Mood detection',
        body: 'Notices when a customer is frustrated, angry or urgent, shows how their mood is moving, pauses AI replies and alerts the person responsible.',
        icon: 'smile',
      },
      {
        title: 'Product knowledge from your repository',
        body: 'For software teams: Chithii can learn from your product’s own repository through Forge, so answers about features stay current.',
        icon: 'code',
      },
      {
        title: 'Safe sending, always',
        body: 'Rate limits and cooldowns on every automatic reply, alerts that never repeat inside a cooldown, and a kill switch that stops all automation at once.',
        icon: 'shield',
      },
    ],
  },
  {
    id: 'team',
    eyebrow: 'Team and support operations',
    title: 'The right person, before the customer has to chase',
    intro:
      'Routing, SLAs, escalations, tickets and shifts are built in. Waits, assignments and alerts reach the right person on time, and managers see what is overdue before it becomes a complaint.',
    icon: 'users',
    features: [
      {
        title: 'Automatic routing',
        body: 'Each new conversation goes to one person automatically, round robin or least busy, from a pool you choose. Respects permissions, the roster, leave and a limit of open conversations.',
        icon: 'route',
      },
      {
        title: 'Support assignment with SLA',
        body: 'Unanswered customer waits are assigned to a person with a due time. Overdue cases alert managers, and still-unanswered ones escalate to admins.',
        icon: 'timer',
      },
      {
        title: 'Priority escalations',
        body: 'SLA timers and alerts for priority customers, so important accounts never wait in the general queue.',
        icon: 'alert',
      },
      {
        title: 'Support tickets',
        body: 'Numbered cases with an owner, a priority, a due time and a full history, opened from any conversation or on their own.',
        icon: 'ticket',
      },
      {
        title: 'Follow-ups',
        body: 'A personal and team to-do list for call-backs, technician visits and promised replies, with Overdue and Due today reminders inside the app.',
        icon: 'check',
      },
      {
        title: 'Shifts, roster and leave',
        body: 'Plan shifts, manage the roster and leave, check coverage and compare each person’s scheduled duty with the support they actually recorded.',
        icon: 'calendar',
      },
      {
        title: 'Notification Center',
        body: 'Alerts for AI handovers, matched rules, upset customers and channels that need reconnecting, routed to the right team group. Every template is editable.',
        icon: 'bell',
      },
      {
        title: 'Roles and permissions',
        body: 'Invite teammates and decide exactly what each role can see and do, down to individual pages and actions.',
        icon: 'key',
      },
    ],
  },
  {
    id: 'reports',
    eyebrow: 'Reports and insights',
    title: 'Know what happened, who handled it, and what needs attention',
    intro:
      'More than 20 ready-made reports built from your stored messages, from a one-page executive view down to every customer wait. Pick a date range and export to CSV or Excel.',
    icon: 'chart',
    features: [
      {
        title: 'Executive Support Health',
        body: 'Demand, replies, unanswered and missed support, first response and SLA on one page, with the groups that need attention.',
        icon: 'chart',
      },
      {
        title: 'Human Response SLA',
        body: 'How fast a person, not a bot, answers a customer, and how often within target. AI and rule replies are shown but never counted.',
        icon: 'timer',
      },
      {
        title: 'Employee Effectiveness',
        body: 'An explainable effectiveness score per person with its breakdown, sample size and confidence, plus every case behind it.',
        icon: 'users',
      },
      {
        title: 'Customer satisfaction (CSAT)',
        body: '“How did we do? 1–5” after a resolved conversation, on the channels you choose, with results per agent and per channel.',
        icon: 'smile',
      },
    ],
  },
  {
    id: 'commerce',
    eyebrow: 'Customers and commerce',
    title: 'From the first message to a paid, delivered order',
    intro:
      'Keep one record of every customer across channels, move leads through your pipeline, take payment in the chat and book the courier, without leaving the conversation.',
    icon: 'bag',
    features: [
      {
        title: 'Client management',
        body: 'One client database across every channel, with channel references, tags, notes, import and export. Smart Bulk Import maps any Excel or CSV file of up to 5,000 clients.',
        icon: 'id',
      },
      {
        title: 'Contacts',
        body: 'Everyone you have met in your chats: names, numbers, emails, social accounts, location and notes, kept apart from clients and billing.',
        icon: 'users',
      },
      {
        title: 'Leads and sales pipeline',
        body: 'Leads, stages and follow-ups, with conversion to clients and orders in one step.',
        icon: 'funnel',
      },
      {
        title: 'Product catalogue and orders',
        body: 'Products, categories, variants, SKUs, prices and stock. Draft, confirm and track orders with totals, payment state, cancellations and returns.',
        icon: 'bag',
      },
      {
        title: 'Payment links in any chat',
        body: 'Send a link so the customer can pay with SSLCOMMERZ or bKash, straight into your own merchant account. A paid link settles the invoice.',
        icon: 'card',
      },
      {
        title: 'Courier booking and tracking',
        body: 'Book and track deliveries with Steadfast, Pathao Courier and RedX from the order.',
        icon: 'truck',
      },
      {
        title: 'Shopify and WooCommerce',
        body: 'Import products, stock and orders, keep them updated by webhook, and send approved orders back to your store.',
        icon: 'store',
      },
      {
        title: 'Google Sheets',
        body: 'Connect Google accounts, work on spreadsheets from inside Chithii, and track who changed what in the sheets you monitor.',
        icon: 'sheet',
      },
    ],
  },
  {
    id: 'social',
    eyebrow: 'Social Studio',
    title: 'Plan and publish your social posts with approval',
    intro:
      'Write, approve, schedule and follow posts for your Facebook Pages and Instagram accounts, with a calendar, media library, campaigns, templates and AI help. Nothing is published without a person’s approval.',
    icon: 'calendar',
    features: [
      {
        title: 'Content calendar',
        body: 'See every scheduled and published post across your Pages and accounts in one calendar.',
        icon: 'calendar',
      },
      {
        title: 'Approval before publishing',
        body: 'Drafts go through review. A person approves every post before it goes out.',
        icon: 'check',
      },
      {
        title: 'Media library and templates',
        body: 'Keep images, videos and reusable post templates in one place, organised by campaign.',
        icon: 'image',
      },
      {
        title: 'AI writing help',
        body: 'Draft captions and variations with the same AI provider your workspace already uses.',
        icon: 'wand',
      },
    ],
  },
  {
    id: 'platform',
    eyebrow: 'Platform and control',
    title: 'Built to run many brands, safely',
    intro:
      'Separate projects for each brand or client, modules you can switch on and off, an open API and a full record of who sent what.',
    icon: 'layers',
    features: [
      {
        title: 'Multi-project workspaces',
        body: 'Keep separate brands or clients in separate projects under one account, each with its own channels, team, knowledge and settings.',
        icon: 'layers',
      },
      {
        title: 'Modules you control',
        body: 'Turn any module on or off per project. Switching one off never deletes its data, so you can turn it back on later.',
        icon: 'toggle',
      },
      {
        title: 'API and signed webhooks',
        body: 'Scoped API keys for the public API, and signed webhooks to your own systems, n8n or Zapier.',
        icon: 'plug',
      },
      {
        title: 'Every reply recorded',
        body: 'See which team member sent which message, from which account, to which conversation and when.',
        icon: 'history',
      },
      {
        title: 'Desktop and mobile',
        body: 'Works in any modern browser and can be added to your phone’s home screen, so your team can answer on the move.',
        icon: 'phone',
      },
      {
        title: 'Release notes in the app',
        body: 'See what changed in every update, right inside Chithii.',
        icon: 'sparkles',
      },
    ],
  },
];

// The full report catalogue from the app (REPORT_CATALOGUE).
export const reports: { category: string; items: string[] }[] = [
  { category: 'Executive', items: ['Executive Support Health', 'Executive Support Intelligence'] },
  {
    category: 'Support intelligence',
    items: ['Employee Effectiveness', 'Support Cases', 'Human Response SLA', 'Customer Appreciation & Preference'],
  },
  { category: 'Support performance', items: ['Team Report', 'Support Activity', 'Customer Satisfaction (CSAT)'] },
  { category: 'Response and SLA', items: ['Response SLA', 'Missed Support', 'Support Assignment'] },
  {
    category: 'Team and employee',
    items: ['Employee Support Breakdown', 'Chat User Activity', 'Duty History', 'Duty & Workload'],
  },
  { category: 'Group and client health', items: ['Group Support Coverage', 'Group Activity Trend', 'Inactive Groups'] },
  {
    category: 'Activity and workload',
    items: ['Team Workload', 'Support Activity Heatmap', 'Call Activity', 'Workload Distribution'],
  },
];

export const totalFeatures = featureGroups.reduce((n, g) => n + g.features.length, 0);
export const totalReports = reports.reduce((n, g) => n + g.items.length, 0);
