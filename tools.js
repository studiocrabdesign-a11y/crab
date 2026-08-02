/* Shared step-flow engine for multi-question tool pages
   (interior design cost calculator, vastu checker). Each page supplies
   its own step data + a callback to compute the result. */

function buildToolFlow(container, resultEl, steps, onDone) {
  let i = 0;
  const answers = [];

  function render() {
    container.innerHTML = '';
    const step = steps[i];

    const count = document.createElement('span');
    count.className = 'convo__count';
    count.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b> / ${steps.length}`;
    container.appendChild(count);

    const q = document.createElement('p');
    q.className = 'convo__q';
    q.textContent = step.q;
    container.appendChild(q);

    const opts = document.createElement('div');
    opts.className = 'tool-options' + (step.grid2 ? ' is-grid2' : '');
    step.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tool-option';
      const label = document.createElement('span');
      label.textContent = opt.label;
      btn.appendChild(label);
      if (opt.sub) {
        const sub = document.createElement('small');
        sub.textContent = opt.sub;
        btn.appendChild(sub);
      }
      btn.addEventListener('click', () => {
        answers[i] = opt;
        if (i < steps.length - 1) { i++; render(); }
        else { resultEl.hidden = false; container.hidden = true; onDone(answers); }
      });
      opts.appendChild(btn);
    });
    container.appendChild(opts);

    if (i > 0) {
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'convo__back';
      back.textContent = '← Back';
      back.style.marginTop = '.4rem';
      back.addEventListener('click', () => { i--; render(); });
      container.appendChild(back);
    }
  }

  render();
  return {
    reset() { i = 0; answers.length = 0; resultEl.hidden = true; container.hidden = false; render(); }
  };
}
