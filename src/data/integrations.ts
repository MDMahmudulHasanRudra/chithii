export interface Integration {
  name: string;
  body: string;
  mono: string; // short monogram shown on the tile (no third-party logos are loaded)
  color: string; // Tailwind background class for the tile (no inline styles: strict CSP)
  href?: string;
  id?: string;
}

export interface IntegrationGroup {
  id: string;
  title: string;
  intro: string;
  items: Integration[];
}

export const integrationGroups: IntegrationGroup[] = [
  {
    id: 'channels',
    title: 'Messaging channels',
    intro: 'Where your customers already write to you. Every channel arrives in the same inbox.',
    items: [
      {
        name: 'WhatsApp',
        body: 'Official Cloud API numbers, personal chats and the customer groups you support.',
        mono: 'WA',
        color: 'bg-wa',
        href: '/integrations/whatsapp',
        id: 'whatsapp',
      },
      {
        name: 'Facebook Messenger',
        body: 'Messages sent to the Facebook Pages you connect, answered by your team and AI.',
        mono: 'M',
        color: 'bg-fb',
        href: '/integrations/facebook',
        id: 'messenger',
      },
      {
        name: 'Instagram Direct',
        body: 'Direct messages to your Instagram professional account, next to every other chat.',
        mono: 'IG',
        color: 'bg-ig',
        href: '/integrations/instagram',
        id: 'instagram',
      },
      {
        name: 'Telegram',
        body: 'Connect a Telegram bot with its token. Messages to the bot arrive in your inbox, and replies go back through it.',
        mono: 'TG',
        color: 'bg-tg',
        id: 'telegram',
      },
      {
        name: 'Website chat',
        body: 'A chat box for your own website. Visitor conversations land in the shared inbox and can end with a CSAT card.',
        mono: 'W',
        color: 'bg-accent',
        id: 'website-chat',
      },
    ],
  },
  {
    id: 'ai',
    title: 'AI providers',
    intro: 'Each workspace picks its own provider and model, with its own key. Chithii supplies the inbox, routing and controls around it.',
    items: [
      { name: 'Anthropic Claude', body: 'Claude models direct from Anthropic. Also powers the AI Admin Assistant.', mono: 'A', color: 'bg-[#c96442]' },
      { name: 'OpenAI', body: 'GPT models from OpenAI, or any compatible private endpoint.', mono: 'O', color: 'bg-[#10a37f]' },
      { name: 'Google Gemini', body: 'Gemini models direct from Google.', mono: 'G', color: 'bg-[#4285f4]' },
      { name: 'OpenRouter', body: 'One key for many model providers.', mono: 'OR', color: 'bg-[#6467f2]' },
      { name: 'Ollama and self-hosted', body: 'Run a model on your own server and keep message content in-house.', mono: 'Ol', color: 'bg-[#0f2a2f]' },
    ],
  },
  {
    id: 'commerce',
    title: 'Commerce, payments and delivery',
    intro: 'Take the order, collect the payment and book the delivery from the conversation.',
    items: [
      { name: 'Shopify', body: 'Import products, stock and orders; send approved orders back as drafts.', mono: 'S', color: 'bg-[#5e8e3e]' },
      { name: 'WooCommerce', body: 'Import products, stock and orders; send approved orders to your shop.', mono: 'Wo', color: 'bg-[#7f54b3]' },
      { name: 'bKash', body: 'Payment links straight into your own bKash merchant account.', mono: 'bK', color: 'bg-[#e2136e]' },
      { name: 'SSLCOMMERZ', body: 'Cards, mobile banking and net banking through your SSLCOMMERZ account.', mono: 'SC', color: 'bg-[#1d4f91]' },
      { name: 'Steadfast', body: 'Book and track Steadfast deliveries from an order.', mono: 'SF', color: 'bg-[#0d8a4f]' },
      { name: 'Pathao Courier', body: 'Book and track Pathao deliveries from an order.', mono: 'P', color: 'bg-[#e41f26]' },
      { name: 'RedX', body: 'Book and track RedX deliveries from an order.', mono: 'RX', color: 'bg-[#d7262d]' },
    ],
  },
  {
    id: 'automation',
    title: 'Productivity and automation',
    intro: 'Connect Chithii to the tools and systems your business already runs on.',
    items: [
      { name: 'Google Sheets', body: 'Work on spreadsheets from Chithii and track changes in monitored sheets.', mono: 'GS', color: 'bg-[#188038]' },
      { name: 'Public API', body: 'Scoped API keys for reading and writing your Chithii data.', mono: '{ }', color: 'bg-[#0b3d45]' },
      { name: 'Signed webhooks', body: 'Real-time events to your own systems, signed so you can trust them.', mono: '↗', color: 'bg-[#0e7c86]' },
      { name: 'n8n', body: 'Build workflows on Chithii events with n8n.', mono: 'n8', color: 'bg-[#ea4b71]' },
      { name: 'Zapier', body: 'Connect Chithii to thousands of apps through Zapier.', mono: 'Z', color: 'bg-[#ff4f00]' },
      { name: 'Forge', body: 'Let Chithii learn from your product’s own code repository.', mono: 'F', color: 'bg-[#d98a14]' },
    ],
  },
];
