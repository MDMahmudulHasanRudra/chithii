// Google Tag Manager for chithii.com (container GTM-PK2HSTC4).
// A file on this site rather than an inline snippet, because the CSP (public/_headers) allows no inline
// script. It does what Google's snippet does: set up dataLayer and gtag(), then load gtm.js.
(function () {
  var GTM_ID = 'GTM-PK2HSTC4';

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  // Consent Mode: where the law asks for consent before analytics or advertising cookies (the EEA, the
  // UK and Switzerland) nothing is stored, and Google tags send cookieless pings only. Elsewhere tags may
  // store cookies. Change this here if a consent banner is added.
  var ASK_FIRST = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU',
    'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
  ];
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    region: ASK_FIRST,
  });
  gtag('consent', 'default', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  });

  gtag('js', new Date());
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
  document.head.appendChild(s);
})();
