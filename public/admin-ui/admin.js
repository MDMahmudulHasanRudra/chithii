// The pricing editor at chithii.com/admin. It loads src/data/pricing.json through the Worker
// (/admin/api/pricing), shows it as forms, and saves it back; the Worker checks it and commits it to
// GitHub, and Cloudflare rebuilds the site. Plain JavaScript in a file: the CSP allows no inline script.
(function () {
  var app = document.getElementById('app');
  var state = null;
  var sha = null;
  var canSave = false;
  var dirty = false;

  var ICONS = 'sparkles users layers server calendar route wand truck plug whatsapp inbox badge clock message note globe cpu book brain zap list smile code shield timer alert ticket check bell key chart bag id funnel card store sheet image toggle history phone lock mail pin send language trash'.split(' ');

  // ---- tiny DOM helper ------------------------------------------------------------------------------------
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else if (v !== false && v != null) el.setAttribute(k, v);
    });
    (children || []).forEach(function (c) {
      if (c != null) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }
  function changed() {
    dirty = true;
    status('You have unsaved changes.', 'warn');
  }

  // ---- fields ---------------------------------------------------------------------------------------------
  var uid = 0;
  function field(label, input, hint) {
    var id = 'f' + ++uid;
    input.id = id;
    return h('div', { class: 'field' }, [h('label', { for: id, text: label }), input, hint ? h('small', { text: hint }) : null]);
  }
  function text(label, obj, key, hint) {
    return field(label, h('input', { type: 'text', value: obj[key] == null ? '' : obj[key], oninput: function (e) { obj[key] = e.target.value; changed(); } }), hint);
  }
  function area(label, obj, key, hint) {
    var t = h('textarea', { rows: 3, oninput: function (e) { obj[key] = e.target.value; changed(); } });
    t.value = obj[key] == null ? '' : obj[key];
    return field(label, t, hint);
  }
  function num(label, obj, key, opts) {
    opts = opts || {};
    return field(
      label,
      h('input', {
        type: 'number', step: opts.step || 'any', min: '0', value: obj[key] == null ? '' : obj[key],
        oninput: function (e) {
          var v = e.target.value;
          obj[key] = v === '' ? (opts.nullable ? null : 0) : Number(v);
          changed();
        },
      }),
      opts.hint,
    );
  }
  function bool(label, obj, key) {
    var id = 'f' + ++uid;
    return h('div', { class: 'field check' }, [
      h('input', { type: 'checkbox', id: id, checked: !!obj[key], onchange: function (e) { obj[key] = e.target.checked; changed(); } }),
      h('label', { for: id, text: label }),
    ]);
  }
  function lines(label, obj, key, hint) {
    var t = h('textarea', {
      rows: Math.max(3, (obj[key] || []).length + 1),
      oninput: function (e) {
        obj[key] = e.target.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        changed();
      },
    });
    t.value = (obj[key] || []).join('\n');
    return field(label, t, hint || 'One per line.');
  }
  function moneyPair(label, obj, key) {
    if (!obj[key]) obj[key] = { bdt: 0, usd: 0 };
    return h('div', { class: 'pair' }, [num(label + ' (৳)', obj[key], 'bdt', { step: '1' }), num(label + ' ($)', obj[key], 'usd', { step: '0.01' })]);
  }
  function select(label, obj, key, options) {
    var s = h('select', { onchange: function (e) { obj[key] = e.target.value; changed(); } }, options.map(function (o) {
      return h('option', { value: o, selected: obj[key] === o, text: o });
    }));
    return field(label, s);
  }

  /** An editable list: each item drawn by `draw`, with move up/down, remove, and add (from `blank`). */
  function list(arr, draw, blank, addLabel, redraw) {
    var box = h('div', { class: 'list' });
    arr.forEach(function (item, i) {
      box.appendChild(
        h('div', { class: 'item' }, [
          h('div', { class: 'item-tools' }, [
            h('button', { type: 'button', class: 'mini', disabled: i === 0, text: '↑', title: 'Move up', onclick: function () { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); changed(); redraw(); } }),
            h('button', { type: 'button', class: 'mini', disabled: i === arr.length - 1, text: '↓', title: 'Move down', onclick: function () { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); changed(); redraw(); } }),
            h('button', { type: 'button', class: 'mini danger', text: 'Remove', onclick: function () { if (confirm('Remove this item?')) { arr.splice(i, 1); changed(); redraw(); } } }),
          ]),
          draw(item, i),
        ]),
      );
    });
    if (blank) box.appendChild(h('button', { type: 'button', class: 'ghost', text: '+ ' + addLabel, onclick: function () { arr.push(blank()); changed(); redraw(); } }));
    return box;
  }

  function section(title, intro, build, open) {
    var body = h('div', { class: 'section-body' });
    var d = h('details', { class: 'section', open: !!open }, [h('summary', { text: title }), intro ? h('p', { class: 'muted', text: intro }) : null, body]);
    function redraw() {
      body.textContent = '';
      body.appendChild(build(redraw));
    }
    redraw();
    return d;
  }

  // ---- sections -------------------------------------------------------------------------------------------
  function general() {
    return h('div', {}, [
      h('div', { class: 'pair' }, [
        num('Yearly discount (%)', state, 'yearlyDiscountPercent', { step: '1', hint: 'Yearly prices are worked out from the monthly price.' }),
        num('Free trial (days)', state, 'trialDays', { step: '1' }),
      ]),
      moneyPair('Extra seat, per month', state.rates, 'extraSeat'),
      moneyPair('Extra project, per month', state.rates, 'extraProject'),
      moneyPair('Extra 5 GB storage, per month', state.rates, 'extraStorage'),
    ]);
  }

  function plans() {
    return h('div', { class: 'cards' }, state.plans.map(function (p) {
      var kids = [h('h3', { text: p.name || p.id }), text('Name', p, 'name'), area('Description', p, 'tagline'), bool('Most popular badge', p, 'popular')];
      if (p.price) {
        kids.push(h('div', { class: 'pair' }, [num('Monthly price (৳)', p.price.bdt, 'monthly', { step: '1' }), num('Monthly price ($)', p.price.usd, 'monthly', { step: '0.01' })]));
        kids.push(h('div', { class: 'pair' }, [
          num('Extra seat (৳)', p.price.bdt, 'extraSeat', { step: '1', nullable: true, hint: 'Empty = seats cannot be added.' }),
          num('Extra seat ($)', p.price.usd, 'extraSeat', { step: '0.01', nullable: true }),
        ]));
      }
      kids.push(h('div', { class: 'pair' }, [text('Seats', p.limits, 'seats', 'Starts with the number, e.g. "5 seats".'), text('Projects', p.limits, 'projects')]));
      kids.push(h('div', { class: 'pair' }, [text('WhatsApp numbers', p.limits, 'whatsapp'), text('Storage', p.limits, 'storage')]));
      kids.push(lines('Features listed on the card', p, 'highlights'));
      kids.push(h('div', { class: 'pair' }, [text('Button label', p.cta, 'label'), text('Email subject', p.cta, 'subject')]));
      return h('div', { class: 'card' }, kids);
    }));
  }

  function addons(redraw) {
    return list(
      state.addons,
      function (a) {
        var hasPrice = a.price !== null;
        return h('div', {}, [
          h('div', { class: 'pair' }, [text('Name', a, 'name'), select('Icon', a, 'icon', ICONS.indexOf(a.icon) >= 0 ? ICONS : [a.icon].concat(ICONS))]),
          h('div', { class: 'field check' }, [
            h('input', { type: 'checkbox', id: 'np' + ++uid, checked: !hasPrice, onchange: function (e) { a.price = e.target.checked ? null : { bdt: 0, usd: 0 }; changed(); redraw(); } }),
            h('label', { for: 'np' + uid, text: 'No price (shows the note instead)' }),
          ]),
          hasPrice ? moneyPair('Price', a, 'price') : null,
          h('div', { class: 'pair' }, [text('After the price', a, 'per', 'e.g. "/ seat / mo"'), text('Note', a, 'note', 'e.g. "Included, unlimited" or "from"')]),
          area('Description', a, 'body'),
        ]);
      },
      function () { return { name: 'New add-on', icon: 'sparkles', price: { bdt: 0, usd: 0 }, per: '/ mo', body: '' }; },
      'Add an add-on',
      redraw,
    );
  }

  function custom(redraw) {
    var c = state.custom;
    var planIds = state.plans.map(function (p) { return p.id; });
    return h('div', {}, [
      h('div', { class: 'pair' }, [num('Seats included', c, 'seats', { step: '1' })]),
      moneyPair('Base price, per month', c, 'base'),
      lines('Always included', c, 'includes'),
      list(
        c.groups,
        function (g) {
          return h('div', {}, [
            text('Group title', g, 'title'),
            list(
              g.options,
              function (o) {
                return h('div', {}, [
                  h('div', { class: 'pair' }, [text('Label', o, 'label'), text('Id', o, 'id', 'Short, unique, no spaces.')]),
                  moneyPair('Price', o, 'price'),
                  bool('Priced per seat', o, 'perSeat'),
                  h('div', { class: 'field' }, [h('span', { class: 'label', text: 'Already included in' }), h('div', { class: 'checks' }, planIds.map(function (id) {
                    var cid = 'in' + ++uid;
                    return h('span', {}, [
                      h('input', { type: 'checkbox', id: cid, checked: o.in.indexOf(id) >= 0, onchange: function (e) {
                        o.in = e.target.checked ? o.in.concat([id]) : o.in.filter(function (x) { return x !== id; });
                        changed();
                      } }),
                      h('label', { for: cid, text: id }),
                    ]);
                  }))]),
                ]);
              },
              function () { return { id: 'option' + Date.now().toString(36), label: 'New option', price: { bdt: 0, usd: 0 }, in: [] }; },
              'Add an option',
              redraw,
            ),
          ]);
        },
        function () { return { title: 'New group', options: [] }; },
        'Add a group',
        redraw,
      ),
    ]);
  }

  function value(redraw) {
    var v = state.valueComparison;
    return h('div', {}, [
      h('div', { class: 'pair' }, [text('Prices checked on', v, 'checked'), num('Taka per US dollar', v, 'rate', { step: '0.01' })]),
      list(
        v.rows,
        function (r) {
          return h('div', {}, [
            h('div', { class: 'pair' }, [text('Product', r, 'name'), num('Price per month ($)', r, 'usd', { step: '0.01' })]),
            h('div', { class: 'pair' }, [num('Price in taka (empty = converted)', r, 'bdt', { step: '1', nullable: true }), bool('This is Chithii (highlighted)', r, 'ours')]),
            text('What that includes', r, 'note'),
          ]);
        },
        function () { return { name: 'Product', usd: 0, note: '' }; },
        'Add a product',
        redraw,
      ),
    ]);
  }

  function cellEditor(row, i) {
    var cell = row.cells[i];
    var kind = cell === true ? 'yes' : cell === false ? 'no' : 'text';
    var input = h('input', { type: 'text', value: kind === 'text' ? cell : '', disabled: kind !== 'text', oninput: function (e) { row.cells[i] = e.target.value; changed(); } });
    var sel = h('select', { onchange: function (e) {
      var k = e.target.value;
      row.cells[i] = k === 'yes' ? true : k === 'no' ? false : input.value || 'Add-on';
      input.disabled = k !== 'text';
      if (k === 'text') input.value = row.cells[i];
      changed();
    } }, [['yes', '✓ Included'], ['no', '— Not included'], ['text', 'Text']].map(function (o) { return h('option', { value: o[0], selected: kind === o[0], text: o[1] }); }));
    return h('div', { class: 'cell' }, [h('span', { class: 'label', text: (state.plans[i] && state.plans[i].name) || 'Plan ' + (i + 1) }), sel, input]);
  }

  function comparison(redraw) {
    return list(
      state.comparison,
      function (g) {
        return h('div', {}, [
          text('Group title', g, 'title'),
          list(
            g.rows,
            function (r) {
              return h('div', {}, [text('Feature', r, 'label'), h('div', { class: 'cells' }, [0, 1, 2, 3].map(function (i) { return cellEditor(r, i); }))]);
            },
            function () { return { label: 'New feature', cells: [false, true, true, true] }; },
            'Add a feature row',
            redraw,
          ),
        ]);
      },
      function () { return { title: 'New group', rows: [] }; },
      'Add a group',
      redraw,
    );
  }

  function faqs(redraw) {
    return list(
      state.faqs,
      function (f) { return h('div', {}, [text('Question', f, 'q'), area('Answer', f, 'a', 'Links can be written as <a href="/contact">text</a>.')]); },
      function () { return { q: 'New question', a: '' }; },
      'Add a question',
      redraw,
    );
  }

  function rates(redraw) {
    var o = state.currency.overrides;
    var rows = Object.keys(o).map(function (code) { return { code: code, rate: o[code] }; });
    function sync() {
      var next = {};
      rows.forEach(function (r) { if (r.code) next[r.code.toUpperCase()] = r.rate; });
      state.currency.overrides = next;
      o = next;
      changed();
    }
    return h('div', {}, [
      h('p', { class: 'muted', text: 'Visitors outside Bangladesh and the US see prices converted from the dollar prices at a rate updated daily. Set a rate here to fix it for a currency (1 US dollar = this many).' }),
      list(
        rows,
        function (r) {
          return h('div', { class: 'pair' }, [
            field('Currency code', h('input', { type: 'text', maxlength: 3, value: r.code, oninput: function (e) { r.code = e.target.value; sync(); } }), 'e.g. EUR, INR, GBP'),
            field('1 USD =', h('input', { type: 'number', step: 'any', min: '0', value: r.rate, oninput: function (e) { r.rate = Number(e.target.value); sync(); } })),
          ]);
        },
        function () { return { code: '', rate: 1 }; },
        'Add a rate',
        function () { sync(); redraw(); },
      ),
    ]);
  }

  function advanced(redraw) {
    var t = h('textarea', { rows: 18, class: 'code', spellcheck: 'false' });
    t.value = JSON.stringify(state, null, 2);
    var msg = h('p', { class: 'muted' });
    return h('div', {}, [
      h('p', { class: 'muted', text: 'Everything above, as JSON. Edit it here for anything the forms do not cover, then press Apply.' }),
      t,
      h('button', { type: 'button', class: 'ghost', text: 'Apply', onclick: function () {
        try {
          state = JSON.parse(t.value);
          changed();
          render();
        } catch (e) {
          msg.textContent = 'That is not valid JSON: ' + e.message;
        }
      } }),
      msg,
    ]);
  }

  // ---- page -----------------------------------------------------------------------------------------------
  var statusEl = h('p', { class: 'status', role: 'status' });
  function status(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = 'status ' + (kind || '');
  }

  function render() {
    app.textContent = '';
    var note = h('input', { type: 'text', placeholder: 'What changed? (optional, kept in the history)' });
    var save = h('button', { type: 'button', text: 'Save and publish', disabled: !canSave });
    var problems = h('ul', { class: 'problems' });
    save.addEventListener('click', function () {
      save.disabled = true;
      problems.textContent = '';
      status('Saving…');
      fetch('/admin/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Chithii-Admin': '1' },
        body: JSON.stringify({ pricing: state, sha: sha, message: note.value }),
      })
        .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, status: r.status, body: b }; }); })
        .then(function (res) {
          save.disabled = !canSave;
          if (res.status === 401) return status('Your session ended. Reload the page and sign in again; your changes are still in this tab until you reload.', 'error');
          if (!res.ok) {
            status(res.body.error || 'Saving failed.', 'error');
            (res.body.problems || []).forEach(function (p) { problems.appendChild(h('li', { text: p })); });
            return;
          }
          sha = res.body.sha || sha;
          dirty = false;
          status('Saved. The site is rebuilding; the new prices are live on chithii.com/pricing in a few minutes.', 'ok');
          if (res.body.commit) statusEl.appendChild(h('a', { href: res.body.commit, target: '_blank', rel: 'noopener', text: ' See the change' }));
        })
        .catch(function () {
          save.disabled = !canSave;
          status('Could not reach the server. Check your connection and try again.', 'error');
        });
    });

    app.appendChild(section('General', 'Discount, trial and the rates for extra seats, projects and storage on every paid plan.', general, true));
    app.appendChild(section('Plans', 'The four plan cards. Yearly prices are worked out from the monthly price and the yearly discount.', plans));
    app.appendChild(section('Add-ons', 'The "Add only what your business needs" cards.', addons));
    app.appendChild(section('Custom plan', 'The build-your-own card: base price and the options people can tick.', custom));
    app.appendChild(section('5-person comparison', 'The "What a 5-person team pays each month" table. Keep competitor prices current.', value));
    app.appendChild(section('Feature comparison table', 'The "Explore the best plan" table, one column per plan.', comparison));
    app.appendChild(section('Questions and answers', 'The pricing FAQ.', faqs));
    app.appendChild(section('Exchange rates', null, rates));
    app.appendChild(section('Advanced (JSON)', null, advanced));
    app.appendChild(h('div', { class: 'savebar' }, [note, save, statusEl, problems]));
    if (!canSave) status('Read-only for now: ' + (window.__note || 'saving is not set up.'), 'warn');
  }

  window.addEventListener('beforeunload', function (e) {
    if (dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  fetch('/admin/api/pricing', { headers: { accept: 'application/json' } })
    .then(function (r) {
      if (r.status === 401) {
        location.reload();
        return null;
      }
      return r.json();
    })
    .then(function (b) {
      if (!b) return;
      state = b.pricing;
      sha = b.sha;
      canSave = !!b.canSave;
      window.__note = b.note;
      render();
    })
    .catch(function () {
      app.textContent = 'Could not load the prices. Reload the page to try again.';
    });
})();
