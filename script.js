/* ============================================================
   CRAB Design Studio — Coming Soon
   ============================================================ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     EMAILJS CONFIG  —  fill these three in to go live.
     Get them free at https://dashboard.emailjs.com
       1. Email Services → add Gmail/your inbox → copy the Service ID
       2. Email Templates → create one with a {{email}} field → Template ID
       3. Account → General → copy the Public Key
     The Public Key is DESIGNED to be exposed in the browser; it is not
     a secret. Lock it down in EmailJS: Account → Security → turn on
     "Use domain restriction" and add crabdesignstudio.com so nobody can
     borrow your key from another site.
     Until all three are filled, the form quietly falls back to storing
     addresses locally (nothing is sent), so the page never looks broken.
     ══════════════════════════════════════════════════════════ */
  var EMAILJS = {
    publicKey:  '09Dy9d1lAhIkHIUH8',
    serviceId:  'service_zam1vjc',
    templateId: 'template_1naf3kp'
  };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var emailjsReady = false;
  if (window.emailjs && EMAILJS.publicKey && EMAILJS.serviceId && EMAILJS.templateId) {
    try {
      emailjs.init({ publicKey: EMAILJS.publicKey });
      emailjsReady = true;
    } catch (e) {
      emailjsReady = false;
    }
  }

  /* ── 1. Per-character title reveal ───────────────────────
     Split into spans so each letter can rise independently.
     data-text holds the source string; aria-label keeps the
     heading readable to screen readers as one phrase.        */

  var lines = document.querySelectorAll('.title .line');
  var index = 0;

  lines.forEach(function (line, li) {
    var text = line.getAttribute('data-text') || '';
    var frag = document.createDocumentFragment();

    text.split('').forEach(function (ch) {
      var span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      span.style.setProperty('--d', (260 + index * 42 + li * 80) + 'ms');
      frag.appendChild(span);
      index++;
    });

    line.appendChild(frag);
  });

  var title = document.querySelector('.title');
  if (title) title.setAttribute('aria-label', 'Coming soon');

  /* ── 2. Pointer parallax on the composition ──────────────
     Subtle rotation only — the scene should feel like light
     shifting through a room, never like a toy.               */

  var scene = document.getElementById('scene');

  if (scene && !reduced && window.matchMedia('(pointer: fine)').matches) {
    var raf = null;
    var tx = 0, ty = 0;

    window.addEventListener('mousemove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;   // -1 … 1
      ty = (e.clientY / window.innerHeight - 0.5) * 2;

      if (raf) return;
      raf = requestAnimationFrame(function () {
        // translate, not rotate — rotation skewed the plane edges off
        // vertical and made the concrete detailing read as mushy
        scene.style.setProperty('--px', (tx * -9).toFixed(1) + 'px');
        scene.style.setProperty('--py', (ty * -6).toFixed(1) + 'px');
        raf = null;
      });
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      scene.style.setProperty('--px', '0px');
      scene.style.setProperty('--py', '0px');
    });
  }

  /* ── 3. Contact — notify (primary) + guided dialogue (opt-in) ──
     Two separate intents. The one-field waitlist stays the main
     CTA; a subtle link opens the guided message dialogue.        */

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* 3a. Notify (launch waitlist) — a single email field. */
  (function () {
    var box    = document.getElementById('notify');
    var form   = document.getElementById('form');
    var email  = document.getElementById('email');
    var msg    = document.getElementById('form-msg');
    var submit = form && form.querySelector('.submit');
    if (!form) return;

    function say(text, isError) {
      msg.textContent = text;
      msg.classList.add('is-visible');
      msg.classList.toggle('is-error', !!isError);
      form.classList.toggle('is-error', !!isError);
    }
    function store(value) {
      try {
        var list = JSON.parse(localStorage.getItem('crab:subscribers') || '[]');
        if (list.indexOf(value) === -1) list.push(value);
        localStorage.setItem('crab:subscribers', JSON.stringify(list));
      } catch (e) { /* storage blocked — not fatal */ }
    }
    function done() {
      box.classList.add('is-done');
      say('Thank you. We’ll be in touch.', false);
      msg.style.marginTop = '0';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = email.value.trim();
      if (!value)             { say('Please enter your email address.', true); email.focus(); return; }
      if (!EMAIL.test(value)) { say('That email doesn’t look right.', true);   email.focus(); return; }

      if (!emailjsReady) { store(value); done(); return; }

      if (submit) submit.disabled = true;
      say('Sending…', false);
      emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, {
        email: value, name: 'Launch signup', message: 'Wants to be notified when the site launches.'
      })
        .then(done)
        .catch(function () {
          store(value);   // don't lose the address if the send fails
          say('Something went wrong. Please try again later.', true);
          if (submit) submit.disabled = false;
        });
    });

    email.addEventListener('input', function () {
      if (form.classList.contains('is-error')) {
        form.classList.remove('is-error');
        msg.classList.remove('is-visible', 'is-error');
      }
    });
  })();

  /* 3b. Guided message dialogue (opt-in) + notify⇄dialogue toggle. */
  var convo = document.getElementById('convo');
  if (convo) {
    var leaveBtn = document.getElementById('to-notify');
    var stage   = document.getElementById('convo-stage');
    var qEl     = document.getElementById('convo-q');
    var input   = document.getElementById('convo-input');
    var area    = document.getElementById('convo-area');
    var field   = convo.querySelector('.convo__field');
    var nextBtn = document.getElementById('convo-next');
    var backBtn = document.getElementById('convo-back');
    var hintEl  = document.getElementById('convo-hint');
    var errEl   = document.getElementById('convo-err');
    var countEl = document.getElementById('convo-n');
    var doneEl  = document.getElementById('convo-done');
    var nameEl  = document.getElementById('convo-name');
    var wipe    = document.getElementById('lightwipe');

    var STEPS = [
      { key: 'name', q: 'What should we call you?', area: false,
        placeholder: 'Your name', hint: 'press Enter ↵',
        validate: function (v) { return v.trim() ? '' : 'A name, however you like.'; } },
      { key: 'message', q: 'What’s on your mind?', area: true,
        placeholder: 'A project, a question, an idea…', hint: 'Shift + Enter for a new line',
        validate: function (v) { return v.trim().length > 2 ? '' : 'Tell us a little more.'; } },
      { key: 'email', q: 'Where can we reach you?', area: false,
        placeholder: 'you@example.com', hint: 'press Enter ↵',
        validate: function (v) { return EMAIL.test(v.trim()) ? '' : 'That email doesn’t look right.'; } }
    ];

    var data = {};
    var i = 0;
    var busy = false;

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function current() { return STEPS[i]; }
    function activeInput() { return current().area ? area : input; }

    function showError(text) {
      errEl.textContent = text;
      errEl.classList.add('is-visible');
      field.classList.add('is-error');
    }
    function clearError() {
      errEl.classList.remove('is-visible');
      field.classList.remove('is-error');
    }

    function grow() {
      if (!current().area) return;
      area.style.height = 'auto';
      area.style.height = Math.min(area.scrollHeight, 200) + 'px';
    }

    function render(animate) {
      var step = current();

      input.hidden = step.area;
      area.hidden  = !step.area;
      var el = activeInput();
      el.placeholder = step.placeholder;
      el.value = data[step.key] || '';

      countEl.textContent = pad(i + 1);
      hintEl.textContent = step.hint;
      backBtn.hidden = (i === 0);
      clearError();
      grow();

      if (animate) {
        qEl.classList.add('is-swap');
        setTimeout(function () {
          qEl.textContent = step.q;
          qEl.classList.remove('is-swap');
        }, 220);
      } else {
        qEl.textContent = step.q;
      }

      setTimeout(function () { el.focus(); }, animate ? 260 : 0);
    }

    function advance() {
      if (busy) return;
      var step = current();
      var el = activeInput();
      var err = step.validate(el.value);
      if (err) { showError(err); el.focus(); return; }

      data[step.key] = el.value.trim();

      if (i < STEPS.length - 1) {
        i++;
        render(true);
      } else {
        submitAll();
      }
    }

    function goBack() {
      if (busy || i === 0) return;
      data[current().key] = activeInput().value;   // keep what they typed
      i--;
      render(true);
    }

    function playWipe() {
      return new Promise(function (resolve) {
        if (reduced || !wipe) { resolve(); return; }
        wipe.classList.add('is-active');
        setTimeout(function () {
          wipe.classList.remove('is-active');
          resolve();
        }, 1050);
      });
    }

    function finish() {
      if (leaveBtn) leaveBtn.hidden = true;   // no going back once received
      stage.classList.add('is-out');
      setTimeout(function () {
        stage.hidden = true;
        nameEl.textContent = data.name ? ', ' + data.name.trim().split(/\s+/)[0] : '';
        doneEl.hidden = false;
        playWipe().then(function () { doneEl.classList.add('is-in'); });
      }, 380);
    }

    function storeLocally() {
      try {
        var list = JSON.parse(localStorage.getItem('crab:messages') || '[]');
        list.push({ name: data.name, email: data.email, message: data.message, at: Date.now() });
        localStorage.setItem('crab:messages', JSON.stringify(list));
      } catch (e) { /* storage blocked — not fatal */ }
    }

    function submitAll() {
      busy = true;
      hintEl.textContent = 'Sending…';

      if (!emailjsReady) {
        storeLocally();
        finish();
        return;
      }

      emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, {
        name: data.name, email: data.email, message: data.message
      }).then(function () {
        finish();
      }).catch(function () {
        storeLocally();
        busy = false;
        hintEl.textContent = '';
        showError('Something went wrong. Please try again.');
      });
    }

    nextBtn.addEventListener('click', advance);
    backBtn.addEventListener('click', goBack);

    [input, area].forEach(function (el) {
      el.addEventListener('focus', function () { field.classList.add('is-focus'); });
      el.addEventListener('blur',  function () { field.classList.remove('is-focus'); });
      el.addEventListener('input', function () { clearError(); grow(); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          if (current().area && e.shiftKey) return;   // newline in the message
          e.preventDefault();
          advance();
        }
      });
    });

    /* ── notify ⇄ dialogue toggle ── */
    var notifyBox = document.getElementById('notify');
    var toMessage = document.getElementById('to-message');

    function swap(hideEl, showEl, after) {
      hideEl.classList.add('is-out');
      setTimeout(function () {
        hideEl.hidden = true;
        hideEl.classList.remove('is-out');
        showEl.hidden = false;
        showEl.classList.add('is-out');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { showEl.classList.remove('is-out'); });
        });
        if (after) setTimeout(after, 120);
      }, 300);
    }

    if (toMessage && notifyBox) {
      toMessage.addEventListener('click', function () {
        swap(notifyBox, convo, function () { activeInput().focus(); });
      });
    }
    if (leaveBtn && notifyBox) {
      leaveBtn.addEventListener('click', function () {
        swap(convo, notifyBox, function () {
          var e = document.getElementById('email'); if (e) e.focus();
        });
      });
    }

    render(false);
  }
})();
