// Embedded widget: interior design cost calculator (step flow).
// Injected into any post whose frontmatter sets `embed: cost-calculator`.
// Depends on tools.js (buildToolFlow) being loaded on the page.

export const html = `
<section class="tool-panel">
  <p class="embed-eyebrow">Try it yourself</p>
  <div id="cost-steps"></div>

  <div class="tool-result" id="cost-result" hidden>
    <p class="tool-result__label">Estimated range</p>
    <p class="tool-result__value" id="cost-value">₹0</p>
    <p class="tool-result__note">
      An illustrative range based on typical Indian market rates — not a
      quote from CRAB. The real number depends on site conditions,
      structural scope and material choices. Leave your email for a
      detailed, project-specific breakdown.
    </p>

    <div class="form" style="max-width: 22rem;">
      <input type="email" class="input" placeholder="Enter your email" autocomplete="email">
      <button type="button" class="submit" aria-label="Submit">
        <svg viewBox="0 0 32 12" aria-hidden="true">
          <path d="M0 6 H29 M24 1 L30 6 L24 11" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="square" stroke-linejoin="miter"/>
        </svg>
      </button>
    </div>
    <button class="tool-restart" id="cost-restart">Start over</button>
  </div>
</section>`;

export const script = `
(function () {
  var steps = [
    { q: "What are you working on?", options: [
        { label: 'New build', mult: 1.15 },
        { label: 'Full renovation', mult: 1.0 },
        { label: 'Partial renovation', mult: 0.6 },
      ]},
    { q: "Which city?", grid2: true, options: [
        { label: 'Bengaluru', rate: 2400 },
        { label: 'Mumbai', rate: 3200 },
        { label: 'Delhi NCR', rate: 2600 },
        { label: 'Other', rate: 2000 },
      ]},
    { q: "Approximate area", grid2: true, options: [
        { label: 'Under 1,000 sq ft', sqft: 800 },
        { label: '1,000–2,500 sq ft', sqft: 1750 },
        { label: '2,500–5,000 sq ft', sqft: 3750 },
        { label: '5,000+ sq ft', sqft: 6000 },
      ]},
    { q: "Finish level", options: [
        { label: 'Essential', sub: 'Clean, functional, budget-conscious', f: 0.8 },
        { label: 'Refined', sub: 'Considered materials, custom detailing', f: 1.15 },
        { label: 'Bespoke', sub: 'Fully custom, no compromises', f: 1.6 },
      ]},
  ];

  var container = document.getElementById('cost-steps');
  var result = document.getElementById('cost-result');
  var value = document.getElementById('cost-value');

  var flow = buildToolFlow(container, result, steps, function (answers) {
    var project = answers[0], city = answers[1], area = answers[2], finish = answers[3];
    var base = city.rate * area.sqft * project.mult * finish.f;
    var low = Math.round(base * 0.85 / 100000);
    var high = Math.round(base * 1.2 / 100000);
    value.textContent = '₹' + low + 'L – ₹' + high + 'L';
  });

  document.getElementById('cost-restart').addEventListener('click', function () { flow.reset(); });
})();`;

export const faqHtml = `
<div class="tool-faq">
  <details>
    <summary>How much does interior design cost per square foot in India?</summary>
    <p>Roughly: essential/basic fit-outs run ₹1,200-1,800/sq ft, mid-range refined interiors ₹1,800-3,000/sq ft, and premium bespoke work ₹3,000-5,000+/sq ft. Rates vary by city, vendor and materials.</p>
  </details>
  <details>
    <summary>What affects the cost the most?</summary>
    <p>Finish level has the biggest impact, followed by city, followed by project type — new build vs. full renovation vs. partial renovation.</p>
  </details>
  <details>
    <summary>Is this calculator an official quote?</summary>
    <p>No — it's an illustrative estimate based on typical market ranges, not a quote from CRAB Design Studio. Site conditions and material choices can move the real number significantly.</p>
  </details>
</div>`;

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How much does interior design cost per square foot in India?', acceptedAnswer: { '@type': 'Answer', text: 'As a rough industry range: essential/basic fit-outs run about ₹1,200-1,800 per sq ft, mid-range refined interiors ₹1,800-3,000 per sq ft, and premium bespoke work ₹3,000-5,000+ per sq ft. Actual rates vary widely by city, vendor and material choices.' } },
    { '@type': 'Question', name: 'What affects interior design cost the most?', acceptedAnswer: { '@type': 'Answer', text: 'The finish level (materials, custom joinery vs modular) has the biggest impact, followed by city (metro rates run higher), and whether it is a full renovation, partial renovation, or a new build being fitted out from scratch.' } },
    { '@type': 'Question', name: 'Is this calculator an official quote?', acceptedAnswer: { '@type': 'Answer', text: 'No. This is an illustrative estimate based on typical Indian market ranges, not a quote from CRAB Design Studio. Site conditions, structural changes and specific material choices can move the real number significantly.' } }
  ]
};
