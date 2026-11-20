// Currency on /pricing, chosen by the visitor's country (from /api/geo, which the Worker answers from
// Cloudflare's country and a daily exchange rate). Bangladesh: taka. United States: dollars. Elsewhere:
// the local currency, converted from the dollar prices, with a note that billing is in US dollars.
// Visitors can still switch with the buttons. Without this script, or if /api/geo fails, the page shows
// taka as before. An external file because the CSP allows no inline script.
(function () {
  var bdtFmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  var usdWhole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  var usdCents = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var local = null; // { code, rate, label, updated }

  function radio(id) {
    return document.getElementById(id);
  }
  function mode() {
    if (radio('cl') && radio('cl').checked && local) return 'local';
    if (radio('cu') && radio('cu').checked) return 'usd';
    return 'bdt';
  }

  function localFormat(amount) {
    var opts = { style: 'currency', currency: local.code, currencyDisplay: 'narrowSymbol' };
    if (Math.abs(amount) >= 100) opts.maximumFractionDigits = 0;
    try {
      return new Intl.NumberFormat(undefined, opts).format(amount);
    } catch (e) {
      return local.code + ' ' + Math.round(amount);
    }
  }

  /** The one formatter every pricing script uses: c is 'bdt' or 'usd' (the stored price). */
  function format(c, n) {
    if (c === 'bdt') return '৳' + bdtFmt.format(Math.round(n));
    if (mode() === 'local') return localFormat(n * local.rate);
    var cents = Math.round(n * 100);
    return '$' + (cents % 100 === 0 ? usdWhole : usdCents).format(cents / 100);
  }

  function render() {
    document.querySelectorAll('[data-usd]').forEach(function (el) {
      if (el.tagName === 'INPUT') return;
      el.textContent = format('usd', Number(el.getAttribute('data-usd')));
    });
    document.dispatchEvent(new CustomEvent('chithii:currency', { detail: { mode: mode() } }));
  }

  window.ChithiiCurrency = { format: format, mode: mode, render: render };

  var touched = false;
  ['cb', 'cu', 'cl'].forEach(function (id) {
    var el = radio(id);
    if (el)
      el.addEventListener('change', function () {
        touched = true;
        render();
      });
  });

  function choose(id) {
    var el = radio(id);
    if (el) el.checked = true;
    render();
  }

  // ?country=XX is passed on so the page can be checked as a visitor from elsewhere would see it.
  var q = new URLSearchParams(location.search).get('country');
  fetch('/api/geo' + (q ? '?country=' + encodeURIComponent(q) : ''), { headers: { accept: 'application/json' } })
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (geo) {
      if (!geo || touched) return;
      if (geo.country === 'BD') return choose('cb');
      if (!geo.currency || geo.currency === 'USD' || geo.currency === 'BDT' || !(geo.rate > 0)) return choose('cu');

      var symbol = geo.currency;
      try {
        var part = new Intl.NumberFormat('en', { style: 'currency', currency: geo.currency, currencyDisplay: 'narrowSymbol' })
          .formatToParts(0)
          .find(function (p) {
            return p.type === 'currency';
          });
        if (part) symbol = part.value;
      } catch (e) {}
      var name = geo.currency;
      try {
        name = new Intl.DisplayNames(['en'], { type: 'currency' }).of(geo.currency) || geo.currency;
      } catch (e) {}
      local = { code: geo.currency, rate: geo.rate, label: symbol + ' ' + name, updated: geo.updated };

      var label = document.querySelector('[data-local-label]');
      if (label) label.textContent = local.label;
      var note = document.querySelector('[data-local-note]');
      if (note) {
        note.textContent =
          'Converted from US dollar prices at 1 USD = ' +
          (Math.round(geo.rate * 10000) / 10000) +
          ' ' +
          geo.currency +
          (geo.updated ? ' (' + geo.updated + ')' : '') +
          '. You are billed in US dollars. ';
        if (geo.source) {
          var a = document.createElement('a');
          a.href = geo.source.url;
          a.textContent = geo.source.name;
          a.rel = 'noopener';
          note.appendChild(a);
        }
      }
      document.documentElement.classList.add('has-local');
      choose('cl');
    })
    .catch(function () {});
})();
