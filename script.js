/* ============================================================
   CRAB Design Studio — Coming Soon
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
     Front-end only for now: validates, confirms, and stores
     locally. Swap the `submit` body for a real endpoint
     (Mailchimp / Formspree / your API) when the client is
     ready to collect for real.                               */

  var form   = document.getElementById('form');
  var input  = document.getElementById('email');
  var msg    = document.getElementById('form-msg');
  var notify = document.querySelector('.notify');

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function say(text, isError) {
    msg.textContent = text;
    msg.classList.add('is-visible');
    msg.classList.toggle('is-error', !!isError);
    form.classList.toggle('is-error', !!isError);
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

      // ── replace this block with your real submission ──
      try {
        var list = JSON.parse(localStorage.getItem('crab:subscribers') || '[]');
        if (list.indexOf(value) === -1) list.push(value);
        localStorage.setItem('crab:subscribers', JSON.stringify(list));
      } catch (err) {
        /* storage blocked — not fatal, carry on */
      }
      // ───────────────────────────────────────────────────

      notify.classList.add('is-done');
      say('Thank you. We’ll be in touch.', false);
      msg.style.marginTop = '0';
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
