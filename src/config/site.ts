// One place for everything that changes between domains or brands.
export const site = {
  name: 'Chithii',
  domain: 'chithii.com',
  url: 'https://chithii.com',
  appUrl: 'https://app.chithii.com/login',
  tagline: 'Every conversation. Every team. Every channel. One place.',
  description:
    'Chithii brings WhatsApp, Messenger, Instagram, Telegram and website chat into one inbox, answered by your team and AI together, with routing, SLAs, reports and commerce built in.',
  email: {
    contact: 'contact@chithii.com',
    support: 'support@chithii.com',
    privacy: 'privacy@chithii.com',
  },
  founders: ['MD Mahmudul Hasan Rudra', 'Sifat A Rabbi'],
  location: 'Dhaka, Bangladesh',
  // Legal pages: effective date of the original policies and date of this revision.
  legal: { effective: '27 October 2026', updated: '17 November 2026' },
} as const;

export const nav = [
  { href: '/features', label: 'Features' },
  { href: '/integrations', label: 'Integrations' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export const footerNav = [
  {
    title: 'Product',
    links: [
      { href: '/features', label: 'All features' },
      { href: '/features#ai', label: 'AI and automation' },
      { href: '/features#reports', label: 'Reports' },
      { href: '/features#commerce', label: 'Commerce' },
      { href: '/integrations', label: 'Integrations' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Channels',
    links: [
      { href: '/integrations/whatsapp', label: 'WhatsApp' },
      { href: '/integrations/facebook', label: 'Facebook Messenger' },
      { href: '/integrations/instagram', label: 'Instagram DM' },
      { href: '/integrations#telegram', label: 'Telegram' },
      { href: '/integrations#website-chat', label: 'Website chat' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { href: '/security', label: 'Security' },
      { href: '/subprocessors', label: 'Subprocessors' },
      { href: '/ai-transparency', label: 'AI transparency' },
      { href: '/about', label: 'About us' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/data-deletion', label: 'Data deletion' },
      { href: '/cookies', label: 'Cookies' },
    ],
  },
];
