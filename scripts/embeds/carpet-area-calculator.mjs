// Embedded widget: carpet vs built-up vs super built-up area calculator.
// Injected into any post whose frontmatter sets `embed: carpet-area-calculator`.

export const html = `
<section class="tool-panel">
  <p class="embed-eyebrow">Try it yourself</p>

  <div class="tool-toggle" id="area-toggle" role="tablist">
    <button type="button" class="is-active" data-mode="carpet">I know carpet area</button>
    <button type="button" data-mode="builtup">I know built-up area</button>
    <button type="button" data-mode="super">I know super built-up area</button>
  </div>

  <div class="tool-field">
    <label for="area-input">Area (sq ft)</label>
    <div class="convo__field">
      <input class="convo__input" id="area-input" type="number" min="0" step="1" placeholder="e.g. 1200" inputmode="decimal">
    </div>
  </div>

  <div class="tool-field">
    <label for="loading-builtup">Built-up loading over carpet area — <span id="loading-builtup-val">15</span>%</label>
    <input type="range" id="loading-builtup" min="5" max="30" value="15" style="width: min(100%, 20rem);">
  </div>

  <div class="tool-field">
    <label for="loading-super">Super built-up loading over built-up area — <span id="loading-super-val">20</span>%</label>
    <input type="range" id="loading-super" min="5" max="40" value="20" style="width: min(100%, 20rem);">
  </div>

  <div class="tool-stats" id="area-stats">
    <div class="tool-stat" id="stat-carpet">
      <p class="tool-stat__label">Carpet area</p>
      <p class="tool-stat__value">—</p>
    </div>
    <div class="tool-stat" id="stat-builtup">
      <p class="tool-stat__label">Built-up area</p>
      <p class="tool-stat__value">—</p>
    </div>
    <div class="tool-stat" id="stat-super">
      <p class="tool-stat__label">Super built-up area</p>
      <p class="tool-stat__value">—</p>
    </div>
  </div>

  <p class="tool-disclaimer">
    Loading factors vary by builder and project — treat this as a working
    estimate, and confirm exact figures in your sale agreement.
  </p>
</section>

<div class="tool-cta">
  <p class="tool-cta__title">Comparing flats, or planning a layout for one?</p>
  <p class="tool-cta__desc">We help clients read floor plans, verify actual usable space, and design for the carpet area you're really getting.</p>
  <div class="tool-cta__actions">
    <a href="./#notify">Talk to us</a>
  </div>
</div>`;

export const script = `
(function () {
  var toggle = document.getElementById('area-toggle');
  var input = document.getElementById('area-input');
  var loadingBuiltup = document.getElementById('loading-builtup');
  var loadingSuper = document.getElementById('loading-super');
  var loadingBuiltupVal = document.getElementById('loading-builtup-val');
  var loadingSuperVal = document.getElementById('loading-super-val');

  var statCarpet = document.querySelector('#stat-carpet .tool-stat__value');
  var statBuiltup = document.querySelector('#stat-builtup .tool-stat__value');
  var statSuper = document.querySelector('#stat-super .tool-stat__value');
  var cards = { carpet: document.getElementById('stat-carpet'), builtup: document.getElementById('stat-builtup'), super: document.getElementById('stat-super') };

  var mode = 'carpet';

  function fmt(n) {
    return isFinite(n) && n > 0 ? Math.round(n).toLocaleString('en-IN') + ' sq ft' : '—';
  }

  function recalc() {
    var val = parseFloat(input.value);
    var lb = parseFloat(loadingBuiltup.value) / 100;
    var ls = parseFloat(loadingSuper.value) / 100;

    Object.keys(cards).forEach(function (k) { cards[k].classList.remove('is-primary'); });
    cards[mode].classList.add('is-primary');

    if (!val || val <= 0) {
      statCarpet.textContent = statBuiltup.textContent = statSuper.textContent = '—';
      return;
    }

    var carpet, builtup, sup;
    if (mode === 'carpet') {
      carpet = val;
      builtup = carpet * (1 + lb);
      sup = builtup * (1 + ls);
    } else if (mode === 'builtup') {
      builtup = val;
      carpet = builtup / (1 + lb);
      sup = builtup * (1 + ls);
    } else {
      sup = val;
      builtup = sup / (1 + ls);
      carpet = builtup / (1 + lb);
    }

    statCarpet.textContent = fmt(carpet);
    statBuiltup.textContent = fmt(builtup);
    statSuper.textContent = fmt(sup);
  }

  toggle.querySelectorAll('button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      toggle.querySelectorAll('button').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      mode = btn.dataset.mode;
      var labels = { carpet: 'Carpet area', builtup: 'Built-up area', super: 'Super built-up area' };
      document.querySelector('label[for="area-input"]').textContent = labels[mode] + ' (sq ft)';
      recalc();
    });
  });

  loadingBuiltup.addEventListener('input', function () { loadingBuiltupVal.textContent = loadingBuiltup.value; recalc(); });
  loadingSuper.addEventListener('input', function () { loadingSuperVal.textContent = loadingSuper.value; recalc(); });
  input.addEventListener('input', recalc);
})();`;

export const faqHtml = `
<div class="tool-faq">
  <details>
    <summary>What is carpet area?</summary>
    <p>The net usable floor area inside an apartment's walls — literally the area you could lay a carpet across. Under RERA it excludes external wall thickness but includes internal partition walls.</p>
  </details>
  <details>
    <summary>What is built-up area?</summary>
    <p>Carpet area plus the thickness of the apartment's own walls and any attached balcony or terrace. Typically 10–20% larger than carpet area.</p>
  </details>
  <details>
    <summary>What is super built-up area?</summary>
    <p>Built-up area plus a proportionate share of common areas like lobbies, staircases, lifts and clubhouses. This is usually what the quoted price-per-square-foot is based on, and is typically 20–35% larger than carpet area.</p>
  </details>
</div>`;

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is carpet area?', acceptedAnswer: { '@type': 'Answer', text: "Carpet area is the net usable floor area inside an apartment's walls — the actual space you can lay a carpet on. Under RERA, it excludes the area of external walls but includes internal partition walls." } },
    { '@type': 'Question', name: 'What is built-up area?', acceptedAnswer: { '@type': 'Answer', text: "Built-up area is the carpet area plus the thickness of the apartment's own walls and any attached balcony or terrace. It's typically 10-20% larger than the carpet area." } },
    { '@type': 'Question', name: 'What is super built-up area?', acceptedAnswer: { '@type': 'Answer', text: 'Super built-up area (also called saleable area) is the built-up area plus a proportionate share of common areas like lobbies, staircases, lifts and clubhouses. It is usually 20-35% larger than the carpet area.' } }
  ]
};
