// The Custom plan on /pricing: tick channels and features, set seats and projects, see the price.
// An external file because the CSP allows no inline script. Without it, every option still shows
// its own price and the card shows the base price.
(function () {
  var card = document.querySelector('[data-custom]');
  if (!card) return;
  document.documentElement.classList.add('js');

  var bdt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  var usdWhole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  var usdCents = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function money(c, n) {
    if (window.ChithiiCurrency) return window.ChithiiCurrency.format(c, n);
    if (c === 'bdt') return '৳' + bdt.format(Math.round(n));
    var cents = Math.round(n * 100);
    return '$' + (cents % 100 === 0 ? usdWhole : usdCents).format(cents / 100);
  }
  function num(name) {
    return Number(card.getAttribute(name)) || 0;
  }

  var price = {
    base: { bdt: num('data-base-bdt'), usd: num('data-base-usd') },
    seat: { bdt: num('data-seat-bdt'), usd: num('data-seat-usd') },
    project: { bdt: num('data-project-bdt'), usd: num('data-project-usd') },
  };
  var includedSeats = num('data-included-seats') || 1;
  var discount = num('data-discount');
  var plans = [];
  try {
    plans = JSON.parse(card.getAttribute('data-plans') || '[]');
  } catch (e) {
    plans = [];
  }
  var mail = card.getAttribute('data-mail');
  var options = Array.prototype.slice.call(card.querySelectorAll('[data-opt]'));
  var hint = card.querySelector('[data-custom-hint]');
  var cta = card.querySelector('[data-custom-cta]');

  var counts = {};
  card.querySelectorAll('[data-custom-count]').forEach(function (box) {
    var key = box.getAttribute('data-custom-count');
    var min = Number(box.getAttribute('data-min')) || 1;
    counts[key] = { value: min, min: min, out: box.querySelector('output'), minus: box.querySelector('[data-step="-1"]') };
    box.querySelectorAll('[data-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var c = counts[key];
        c.value = Math.min(200, Math.max(c.min, c.value + Number(btn.getAttribute('data-step'))));
        render();
      });
    });
  });
  function count(key) {
    return counts[key] ? counts[key].value : 1;
  }

  function checked() {
    return options.filter(function (o) {
      return o.checked;
    });
  }

  /** Price per month when billed monthly, in currency c. */
  function monthly(c) {
    var seats = count('seats');
    var total = price.base[c] + Math.max(0, seats - includedSeats) * price.seat[c] + Math.max(0, count('projects') - 1) * price.project[c];
    checked().forEach(function (o) {
      total += Number(o.getAttribute('data-' + c)) * (o.getAttribute('data-per-seat') === '1' ? seats : 1);
    });
    return total;
  }

  /** The cheapest standard plan that already includes every pick, or null. Price per month. */
  function cheaperPlan(c, yearly) {
    var picked = checked().map(function (o) {
      return (o.getAttribute('data-in') || '').split(' ');
    });
    var seats = count('seats');
    var projects = count('projects');
    var best = null;
    plans.forEach(function (p) {
      var covers = picked.every(function (ins) {
        return ins.indexOf(p.id) !== -1;
      });
      if (!covers) return;
      var extraSeats = Math.max(0, seats - p.seats);
      if (extraSeats > 0 && p[c].seat === null) return; // a plan that cannot add seats
      var perMonth = (yearly ? p[c].yearly / 12 : p[c].monthly) + extraSeats * (p[c].seat || 0) + Math.max(0, projects - p.projects) * price.project[c];
      if (!best || perMonth < best.perMonth) best = { name: p.name, id: p.id, perMonth: perMonth };
    });
    return best;
  }

  function isOn(id) {
    var el = document.getElementById(id);
    return Boolean(el && el.checked);
  }

  function render() {
    Object.keys(counts).forEach(function (k) {
      var c = counts[k];
      c.out.textContent = String(c.value);
      if (c.minus) c.minus.disabled = c.value <= c.min;
    });

    ['bdt', 'usd'].forEach(function (c) {
      var m = monthly(c);
      var set = function (sel, n) {
        var el = card.querySelector(sel);
        if (el) el.textContent = money(c, n);
      };
      set('[data-custom-amount="' + c + '-monthly"]', m);
      set('[data-custom-amount="' + c + '-yearly"]', m * (1 - discount));
      set('[data-custom-yearly="' + c + '-yearly"]', m * 12 * (1 - discount));
    });

    var c = isOn('cu') || isOn('cl') ? 'usd' : 'bdt';
    var yearly = isOn('by');
    var mine = monthly(c) * (yearly ? 1 - discount : 1);
    var best = cheaperPlan(c, yearly);
    if (best && best.perMonth < mine - 0.005) {
      hint.textContent =
        best.name + ' includes everything you picked for ' + money(c, best.perMonth) + ' a month, ' + money(c, mine - best.perMonth) + ' less than this.';
      hint.classList.remove('hidden');
    } else {
      hint.classList.add('hidden');
      hint.textContent = '';
    }

    var picks = checked().map(function (o) {
      return '- ' + o.getAttribute('data-label');
    });
    var body =
      'I would like the Chithii Custom plan:\n' +
      '- Seats: ' + count('seats') + '\n' +
      '- Projects: ' + count('projects') + '\n' +
      (picks.length ? picks.join('\n') + '\n' : '') +
      'Price shown: ' + money(c, mine) + ' a month, billed ' + (yearly ? 'yearly' : 'monthly') + '.';
    cta.href = 'mailto:' + mail + '?subject=' + encodeURIComponent('Chithii Custom plan') + '&body=' + encodeURIComponent(body);
  }

  options.forEach(function (o) {
    o.addEventListener('change', render);
  });
  document.addEventListener('chithii:currency', render);
  ['bm', 'by', 'cb', 'cu', 'cl'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', render);
  });
  render();
})();
