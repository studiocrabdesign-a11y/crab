// Embedded widget: Vastu compliance checker (step flow + scored breakdown).
// Injected into any post whose frontmatter sets `embed: vastu-checker`.
// Depends on tools.js (buildToolFlow) being loaded on the page.

export const html = `
<section class="tool-panel">
  <p class="embed-eyebrow">Try it yourself</p>
  <div id="vastu-steps"></div>

  <div class="tool-result" id="vastu-result" hidden>
    <p class="tool-result__label">Your result</p>
    <p class="tool-result__value" id="vastu-verdict">—</p>
    <div id="vastu-breakdown" style="margin-bottom: 1.8rem;"></div>

    <p class="tool-disclaimer" style="margin-top: 0; margin-bottom: 1.8rem;">
      This reflects general traditional guidance, not a substitute for a
      full consultation with a qualified Vastu expert — every plot and
      structure has constraints a five-question checker can't see.
    </p>

    <button class="tool-restart" id="vastu-restart">Start over</button>
  </div>
</section>

<div class="tool-cta">
  <p class="tool-cta__title">Want a fully Vastu-aligned design from the ground up?</p>
  <p class="tool-cta__desc">We work with clients who want traditional Vastu principles considered from the earliest floor plan, not retrofitted afterward.</p>
  <div class="tool-cta__actions">
    <a href="./#notify">Talk to us</a>
  </div>
</div>`;

export const script = `
(function () {
  function dirs(spec) {
    var all = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
    return all.map(function (d) {
      var entry = spec[d] || [0, 'Not traditionally recommended for this room.'];
      var points = entry[0], note = entry[1];
      return { label: d, points: points, note: note, sub: points === 2 ? 'Ideal' : points === 1 ? 'Acceptable' : 'Consider adjusting' };
    });
  }

  var steps = [
    { q: "Which direction does your main entrance face?", grid2: true, key: 'Entrance', options: dirs({
        North: [2, 'Considered highly auspicious for the main entrance.'],
        East: [2, 'A classic, well-regarded entrance direction.'],
        Northeast: [2, 'The most favoured entrance direction in traditional Vastu.'],
        Northwest: [1, 'Workable, though not the top preference.'],
        West: [1, 'Generally fine for a main entrance.'],
        Southeast: [0, 'Traditionally considered less favourable for an entrance.'],
        South: [0, 'Traditionally advised against for a main entrance.'],
        Southwest: [0, 'Traditionally the least preferred entrance direction.'],
      })},
    { q: "Which direction is your kitchen in?", grid2: true, key: 'Kitchen', options: dirs({
        Southeast: [2, "The traditional 'Agni corner' — considered the best kitchen placement."],
        Northwest: [1, 'A commonly used secondary option.'],
        East: [1, 'Workable for a kitchen.'],
        West: [1, 'Workable, though not the top choice.'],
        North: [0, 'Not traditionally recommended for a kitchen.'],
        Northeast: [0, 'Considered unsuitable — this zone is reserved for prayer.'],
        South: [0, 'Not a preferred kitchen direction.'],
        Southwest: [0, 'Not traditionally recommended.'],
      })},
    { q: "Which direction is your master bedroom in?", grid2: true, key: 'Master bedroom', options: dirs({
        Southwest: [2, 'The traditional placement for the head of household.'],
        South: [1, 'A commonly accepted alternative.'],
        West: [1, 'Workable for a bedroom.'],
        Northwest: [1, 'Fine, especially for guest or younger family bedrooms.'],
        Northeast: [0, 'Traditionally reserved for prayer, not sleeping.'],
        North: [0, 'Not the preferred direction for a master bedroom.'],
        East: [0, 'Better suited to living or study areas.'],
        Southeast: [0, 'Associated with fire energy — not ideal for a bedroom.'],
      })},
    { q: "Where is your main toilet/bathroom, relative to the house?", grid2: true, key: 'Toilet', options: dirs({
        West: [2, 'One of the better-regarded placements for a toilet.'],
        Northwest: [2, 'Considered a favourable placement.'],
        South: [1, 'Workable placement.'],
        East: [1, 'Generally acceptable if unavoidable.'],
        Southeast: [1, 'Workable, though not the top preference.'],
        Southwest: [0, 'Not traditionally recommended.'],
        North: [0, 'Not a preferred placement.'],
        Northeast: [0, 'Strongly advised against — this zone is reserved for purity/prayer.'],
      })},
    { q: "Which direction is your pooja/prayer room in?", grid2: true, key: 'Pooja room', options: dirs({
        Northeast: [2, 'The traditional placement — the most sacred zone of the home.'],
        East: [1, 'A commonly used alternative.'],
        North: [1, 'Workable for a prayer space.'],
        West: [0, 'Not traditionally recommended.'],
        South: [0, 'Traditionally considered unsuitable.'],
        Southeast: [0, 'Associated with fire energy — not ideal here.'],
        Southwest: [0, 'Traditionally the least suitable direction.'],
        Northwest: [0, 'Not a preferred placement.'],
      })},
  ];

  var container = document.getElementById('vastu-steps');
  var result = document.getElementById('vastu-result');
  var verdictEl = document.getElementById('vastu-verdict');
  var breakdownEl = document.getElementById('vastu-breakdown');

  var flow = buildToolFlow(container, result, steps, function (answers) {
    var total = answers.reduce(function (s, a) { return s + a.points; }, 0);
    var max = steps.length * 2;

    var verdict;
    if (total >= 8) verdict = 'Strongly Vastu-aligned';
    else if (total >= 5) verdict = 'Partially aligned';
    else verdict = 'Several guidelines not met';
    verdictEl.textContent = verdict + ' (' + total + '/' + max + ')';

    breakdownEl.innerHTML = '';
    answers.forEach(function (a, i) {
      var row = document.createElement('div');
      row.style.borderTop = '1px solid var(--hair)';
      row.style.padding = '1rem 0';
      row.innerHTML = '<p style="font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin-bottom:.4rem;">' + steps[i].key + ' — ' + a.label + ' <span style="color:var(--ink-4)">(' + a.sub + ')</span></p><p style="font-size:.86rem;line-height:1.6;color:var(--ink-2);">' + a.note + '</p>';
      breakdownEl.appendChild(row);
    });
  });

  document.getElementById('vastu-restart').addEventListener('click', function () { flow.reset(); });
})();`;

export const faqHtml = `
<div class="tool-faq">
  <details>
    <summary>Which direction is best for a main entrance?</summary>
    <p>North, East and Northeast are traditionally considered the most favourable directions for a home's main entrance.</p>
  </details>
  <details>
    <summary>Which direction is best for a kitchen?</summary>
    <p>Southeast is traditionally considered ideal — sometimes called the "Agni" or fire corner. Northwest is a commonly used secondary option.</p>
  </details>
  <details>
    <summary>Is this checker a substitute for a Vastu consultant?</summary>
    <p>No. It offers general traditional guidance based on commonly published principles. For a full consultation tailored to your specific plot and structure, speak with a qualified Vastu expert.</p>
  </details>
</div>`;

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Which direction is best for a main entrance according to Vastu?', acceptedAnswer: { '@type': 'Answer', text: "North, East and Northeast are traditionally considered the most favourable directions for a home's main entrance." } },
    { '@type': 'Question', name: 'Which direction is best for a kitchen according to Vastu?', acceptedAnswer: { '@type': 'Answer', text: "Southeast is traditionally considered the ideal direction for a kitchen, sometimes called the 'Agni' or fire corner. Northwest is a commonly used secondary option." } },
    { '@type': 'Question', name: 'Is this checker a substitute for a Vastu consultant?', acceptedAnswer: { '@type': 'Answer', text: 'No. This tool offers general traditional guidance based on commonly published Vastu Shastra principles. For a full consultation tailored to your specific plot and structure, speak with a qualified Vastu expert.' } }
  ]
};
