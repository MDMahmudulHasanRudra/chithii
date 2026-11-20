// Checks a pricing file from the admin portal before it is committed, so a mistake cannot break the site
// build or the pricing page. Returns a list of problems in plain words; empty means it can be saved.
export function validatePricing(p) {
  const problems = [];
  const need = (ok, msg) => {
    if (!ok) problems.push(msg);
  };
  const isNum = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0;
  const isText = (s) => typeof s === 'string' && s.trim().length > 0;
  const money = (m, where) => {
    need(m && isNum(m.bdt) && isNum(m.usd), `${where}: needs a taka and a dollar amount (0 or more).`);
  };

  if (!p || typeof p !== 'object') return ['The pricing file is empty.'];

  need(isNum(p.yearlyDiscountPercent) && p.yearlyDiscountPercent < 100, 'Yearly discount must be a number from 0 to 99.');
  need(Number.isInteger(p.trialDays) && p.trialDays >= 0, 'Free trial days must be a whole number.');
  need(p.rates && typeof p.rates === 'object', 'Rates are missing.');
  if (p.rates) ['extraSeat', 'extraProject', 'extraStorage'].forEach((k) => money(p.rates[k], `Rate "${k}"`));

  need(Array.isArray(p.plans) && p.plans.length === 4, 'There must be exactly 4 plans (the page and comparison table have 4 columns).');
  (p.plans || []).forEach((plan, i) => {
    const w = `Plan ${i + 1} (${plan && plan.name ? plan.name : 'no name'})`;
    need(isText(plan.id) && /^[a-z0-9-]+$/.test(plan.id), `${w}: the id must be lower-case letters, digits or dashes.`);
    need(isText(plan.name), `${w}: needs a name.`);
    need(typeof plan.tagline === 'string', `${w}: needs a description.`);
    if (plan.price !== null) {
      need(plan.price && plan.price.bdt && plan.price.usd, `${w}: needs prices in taka and dollars.`);
      if (plan.price && plan.price.bdt && plan.price.usd) {
        need(isNum(plan.price.bdt.monthly) && isNum(plan.price.usd.monthly), `${w}: monthly prices must be numbers.`);
        ['bdt', 'usd'].forEach((c) =>
          need(plan.price[c].extraSeat === null || isNum(plan.price[c].extraSeat), `${w}: the extra seat price must be a number or empty.`),
        );
      }
    }
    need(plan.limits && ['seats', 'projects', 'whatsapp', 'storage'].every((k) => typeof plan.limits[k] === 'string'), `${w}: seats, projects, WhatsApp and storage must be filled in.`);
    need(plan.limits && /^\d+/.test(plan.limits.seats || '') && /^\d+/.test(plan.limits.projects || ''), `${w}: seats and projects must start with a number, like "5 seats".`);
    need(Array.isArray(plan.highlights) && plan.highlights.every((h) => typeof h === 'string'), `${w}: the feature list must be lines of text.`);
    need(plan.cta && isText(plan.cta.label) && typeof plan.cta.subject === 'string', `${w}: the button needs a label.`);
  });
  const ids = (p.plans || []).map((x) => x && x.id);
  need(new Set(ids).size === ids.length, 'Two plans have the same id.');

  need(Array.isArray(p.comparison), 'The comparison table is missing.');
  (p.comparison || []).forEach((g, gi) => {
    need(isText(g.title) && Array.isArray(g.rows), `Comparison group ${gi + 1}: needs a title and rows.`);
    (g.rows || []).forEach((r, ri) =>
      need(
        isText(r.label) && Array.isArray(r.cells) && r.cells.length === 4 && r.cells.every((c) => typeof c === 'boolean' || typeof c === 'string'),
        `Comparison "${g.title}", row ${ri + 1}: needs a label and 4 cells (yes, no, or a short text).`,
      ),
    );
  });

  need(Array.isArray(p.addons), 'Add-ons are missing.');
  (p.addons || []).forEach((a, i) => {
    need(isText(a.name) && typeof a.body === 'string' && typeof a.icon === 'string', `Add-on ${i + 1}: needs a name, icon and description.`);
    if (a.price !== null) money(a.price, `Add-on "${a.name}"`);
  });

  const v = p.valueComparison;
  need(v && isNum(v.rate) && typeof v.checked === 'string' && Array.isArray(v.rows), 'The value comparison needs a date, a rate and rows.');
  ((v && v.rows) || []).forEach((r, i) => need(isText(r.name) && isNum(r.usd), `Value comparison row ${i + 1}: needs a name and a dollar price.`));

  const c = p.custom;
  need(c && Number.isInteger(c.seats) && c.seats >= 1, 'Custom plan: included seats must be a whole number.');
  if (c) money(c.base, 'Custom plan base price');
  need(c && Array.isArray(c.includes) && Array.isArray(c.groups), 'Custom plan: needs what is included and option groups.');
  ((c && c.groups) || []).forEach((g) => {
    need(isText(g.title) && Array.isArray(g.options), 'Custom plan: every group needs a title and options.');
    (g.options || []).forEach((o) => {
      need(isText(o.id) && isText(o.label) && Array.isArray(o.in), `Custom option "${o.label || o.id}": needs an id, a label and the plans that include it.`);
      money(o.price, `Custom option "${o.label}"`);
    });
  });

  need(Array.isArray(p.faqs) && p.faqs.every((f) => isText(f.q) && isText(f.a)), 'Every question needs an answer.');
  need(p.currency && typeof p.currency.overrides === 'object', 'Currency settings are missing.');
  Object.entries((p.currency && p.currency.overrides) || {}).forEach(([code, rate]) =>
    need(/^[A-Z]{3}$/.test(code) && isNum(rate) && rate > 0, `Exchange rate for "${code}": use a 3-letter code like EUR and a number above 0.`),
  );
  return problems;
}
