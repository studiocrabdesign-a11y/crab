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
    publicKey:  '',   // e.g. 'AbC12dEfGhIJKlmno'
    serviceId:  '',   // e.g. 'service_ab12cde'
    templateId: ''    // e.g. 'template_xy34zwv'
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

  /* ── 3. Email capture ────────────────────────────────────
     Sends via EmailJS when configured (see EMAILJS above);
     otherwise stores locally so the form still works.        */

  var form   = document.getElementById('form');
  var input  = document.getElementById('email');
  var msg    = document.getElementById('form-msg');
  var notify = document.querySelector('.notify');
  var submit = form && form.querySelector('.submit');

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function say(text, isError) {
    msg.textContent = text;
    msg.classList.add('is-visible');
    msg.classList.toggle('is-error', !!isError);
    form.classList.toggle('is-error', !!isError);
  }

  function succeed() {
    notify.classList.add('is-done');
    say('Thank you. We’ll be in touch.', false);
    msg.style.marginTop = '0';
  }

  function storeLocally(value) {
    try {
      var list = JSON.parse(localStorage.getItem('crab:subscribers') || '[]');
      if (list.indexOf(value) === -1) list.push(value);
      localStorage.setItem('crab:subscribers', JSON.stringify(list));
    } catch (err) { /* storage blocked — not fatal */ }
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var value = input.value.trim();

      if (!value) {
        say('Please enter your email address.', true);
        input.focus();
        return;
      }
      if (!EMAIL.test(value)) {
        say('That email doesn’t look right.', true);
        input.focus();
        return;
      }

      if (!emailjsReady) {
        // No provider configured yet — keep the address locally.
        storeLocally(value);
        succeed();
        return;
      }

      // Live send via EmailJS.
      if (submit) submit.disabled = true;
      say('Sending…', false);

      emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, { email: value })
        .then(function () {
          succeed();
        })
        .catch(function () {
          storeLocally(value);   // don't lose the address if the send fails
          say('Something went wrong. Please try again later.', true);
          if (submit) submit.disabled = false;
        });
    });

    // clear the error state as soon as they start correcting
    input.addEventListener('input', function () {
      if (form.classList.contains('is-error')) {
        form.classList.remove('is-error');
        msg.classList.remove('is-visible', 'is-error');
      }
    });
  }
})();
