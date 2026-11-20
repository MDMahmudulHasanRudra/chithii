// Seat and project counters on the /pricing plan cards. An external file because the CSP allows no
// inline script. Without it the page still works: each plan shows its included seats, projects and price.
(function () {
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

  var MAX = 200;
  document.querySelectorAll('[data-plan]').forEach(function (card) {
    var counters = {};
    card.querySelectorAll('[data-counter]').forEach(function (box) {
      var key = box.getAttribute('data-counter');
      var included = Number(box.getAttribute('data-included')) || 1;
      counters[key] = { box: box, included: included, value: included };
    });
    if (!Object.keys(counters).length) return;

    function extra(key) {
      var c = counters[key];
      return c ? c.value - c.included : 0;
    }

    function render() {
      Object.keys(counters).forEach(function (key) {
        var c = counters[key];
        c.box.querySelector('output').textContent = String(c.value);
        var minus = c.box.querySelector('[data-step="-1"]');
        if (minus) minus.disabled = c.value <= c.included;
      });
      card.querySelectorAll('[data-amount]').forEach(function (el) {
        var base = Number(el.getAttribute('data-base'));
        var seat = Number(el.getAttribute('data-seat')) || 0;
        var project = Number(el.getAttribute('data-project')) || 0;
        el.textContent = money(el.getAttribute('data-c'), base + extra('seats') * seat + extra('projects') * project);
      });
    }

    Object.keys(counters).forEach(function (key) {
      var c = counters[key];
      c.box.querySelectorAll('[data-step]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          c.value = Math.min(MAX, Math.max(c.included, c.value + Number(btn.getAttribute('data-step'))));
          render();
        });
      });
    });
    render();
    document.addEventListener('chithii:currency', render);
  });
})();
