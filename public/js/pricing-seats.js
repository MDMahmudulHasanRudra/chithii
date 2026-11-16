// Seat counters on /pricing. An external file because the CSP allows no inline script.
// Without it the page still works: each plan simply shows its included seats and price.
(function () {
  document.documentElement.classList.add('js');

  var bdt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  var usdWhole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  var usdCents = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function money(c, n) {
    if (c === 'bdt') return '৳' + bdt.format(Math.round(n));
    var cents = Math.round(n * 100);
    return '$' + (cents % 100 === 0 ? usdWhole : usdCents).format(cents / 100);
  }

  var MAX = 200;
  document.querySelectorAll('[data-seats]').forEach(function (box) {
    var card = box.closest('[data-plan]');
    var out = box.querySelector('output');
    var minus = box.querySelector('[data-step="-1"]');
    var included = Number(box.getAttribute('data-included')) || 1;
    var seats = included;

    function render() {
      var extra = seats - included;
      out.textContent = String(seats);
      minus.disabled = seats <= included;
      card.querySelectorAll('[data-amount]').forEach(function (el) {
        var base = Number(el.getAttribute('data-base'));
        var seat = Number(el.getAttribute('data-seat'));
        el.textContent = money(el.getAttribute('data-c'), base + extra * seat);
      });
    }

    box.querySelectorAll('[data-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        seats = Math.min(MAX, Math.max(included, seats + Number(btn.getAttribute('data-step'))));
        render();
      });
    });
    render();
  });
})();
