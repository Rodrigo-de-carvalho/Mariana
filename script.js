'use strict';

/* ═══════════════════════════════════════════
   STARS CANVAS
═══════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.3 + 0.2,
      a: Math.random(),
      da: (Math.random() * 0.005 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
      gold: Math.random() < 0.14,
      vx: (Math.random() - 0.5) * 0.06,
      vy: (Math.random() - 0.5) * 0.06,
    };
  }

  function init() {
    resize();
    stars = Array.from({ length: 220 }, mkStar);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.a = Math.max(0.04, Math.min(1, s.a + s.da));
      if (s.a <= 0.04 || s.a >= 1) s.da *= -1;
      s.x = (s.x + s.vx + W) % W;
      s.y = (s.y + s.vy + H) % H;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.gold
        ? `rgba(201,168,76,${s.a * 0.65})`
        : `rgba(220,220,240,${s.a * 0.5})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
})();

/* ═══════════════════════════════════════════
   CUSTOM CURSOR
═══════════════════════════════════════════ */
(function () {
  const cur = document.getElementById('cursor');
  let ax = 0, ay = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

  function loop() {
    ax += (tx - ax) * 0.2;
    ay += (ty - ay) * 0.2;
    cur.style.left = ax + 'px';
    cur.style.top  = ay + 'px';
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ═══════════════════════════════════════════
   INTRO CINEMATOGRÁFICO
═══════════════════════════════════════════ */
(function () {
  const intro   = document.getElementById('intro');
  const textEl  = document.getElementById('intro-text');
  const hero    = document.getElementById('hero');
  const message = 'Para Mariana';

  // Quebra em chars com espaço preservado
  textEl.innerHTML = message.split('').map(c =>
    `<span class="char">${c === ' ' ? '&nbsp;' : c}</span>`
  ).join('');

  const chars = textEl.querySelectorAll('.char');
  let i = 0;

  function revealChar() {
    if (i < chars.length) {
      chars[i].classList.add('visible');
      i++;
      setTimeout(revealChar, 90);
    } else {
      // pausa, depois transição para o site
      setTimeout(() => {
        intro.classList.add('fade-out');
        setTimeout(() => {
          intro.classList.add('gone');
          showHero();
        }, 1000);
      }, 900);
    }
  }

  setTimeout(revealChar, 400);

  function showHero() {
    hero.classList.add('visible');

    // desenha o coração SVG
    setTimeout(() => {
      const path = document.querySelector('.heart-path');
      if (path) path.classList.add('drawn');
    }, 300);

    // tagline
    setTimeout(() => {
      const tag = document.getElementById('hero-tagline');
      if (tag) tag.classList.add('show');
    }, 600);

    // contador
    setTimeout(() => {
      const cnt = document.querySelector('.hero-counter');
      if (cnt) cnt.classList.add('show');
      startCounter();
    }, 900);
  }
})();

/* ═══════════════════════════════════════════
   CONTADOR DE DIAS
═══════════════════════════════════════════ */
function startCounter() {
  const start = new Date('2024-12-04');
  const now   = new Date();
  const days  = Math.floor((now - start) / 86400000);
  const el    = document.getElementById('days-counter');
  if (!el) return;

  let cur = 0;
  const step = Math.max(1, Math.ceil(days / 70));
  const timer = setInterval(() => {
    cur = Math.min(cur + step, days);
    el.textContent = cur.toLocaleString('pt-BR');
    if (cur >= days) clearInterval(timer);
  }, 20);
}

/* ═══════════════════════════════════════════
   TIMELINE HORIZONTAL
═══════════════════════════════════════════ */
(function () {
  const track  = document.getElementById('tlTrack');
  const dots   = document.querySelectorAll('.tl-dot');
  const btnP   = document.getElementById('tlPrev');
  const btnN   = document.getElementById('tlNext');
  const slides = document.querySelectorAll('.tl-slide');
  let current  = 0;
  let startX   = 0;

  function go(n) {
    current = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  btnP.addEventListener('click', () => go(current - 1));
  btnN.addEventListener('click', () => go(current + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));

  // touch / swipe
  const wrap = document.querySelector('.tl-track-wrap');
  wrap.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(dx < 0 ? current + 1 : current - 1);
  });

  // auto-advance
  let auto = setInterval(() => go(current + 1), 5000);
  [btnP, btnN, ...dots].forEach(el => {
    el.addEventListener('click', () => { clearInterval(auto); auto = setInterval(() => go(current + 1), 5000); });
  });
})();

/* ═══════════════════════════════════════════
   POEMA PARALLAX + REVEAL
═══════════════════════════════════════════ */
(function () {
  const section = document.getElementById('poema');
  const bg      = document.getElementById('poema-bg');
  const lines   = document.querySelectorAll('.pl');
  const author  = document.querySelector('.poema-author');
  let revealed  = false;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !revealed) {
        revealed = true;
        lines.forEach((l, i) => {
          setTimeout(() => l.classList.add('visible'), i * 80);
        });
        setTimeout(() => {
          if (author) author.classList.add('visible');
        }, lines.length * 80 + 200);
      }
    });
  }, { threshold: 0.15 });

  if (section) obs.observe(section);

  // Parallax no scroll
  window.addEventListener('scroll', () => {
    if (!section || !bg) return;
    const rect = section.getBoundingClientRect();
    const pct  = -rect.top / window.innerHeight;
    bg.style.transform = `translateY(${pct * 30}px)`;
  }, { passive: true });
})();

/* ═══════════════════════════════════════════
   ENVELOPES / RAZÕES
═══════════════════════════════════════════ */
document.querySelectorAll('.envelope').forEach(env => {
  function toggle() {
    const isOpen = env.classList.contains('open');
    // fecha todos
    document.querySelectorAll('.envelope.open').forEach(o => o.classList.remove('open'));
    if (!isOpen) env.classList.add('open');
  }
  env.addEventListener('click', toggle);
  env.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
});

/* ═══════════════════════════════════════════
   PLAYER DE MÚSICA (visual — sem áudio)
═══════════════════════════════════════════ */
(function () {
  const btnPlay    = document.getElementById('btnPlay');
  const btnPrev    = document.getElementById('btnPrev');
  const btnNext    = document.getElementById('btnNext');
  const disc       = document.getElementById('playerDisc');
  const needle     = document.getElementById('discNeedle');
  const fill       = document.getElementById('progressFill');
  const thumb      = document.getElementById('progressThumb');
  const timeNow    = document.getElementById('timeNow');
  const iconPlay   = btnPlay ? btnPlay.querySelector('.icon-play')  : null;
  const iconPause  = btnPlay ? btnPlay.querySelector('.icon-pause') : null;
  const canvas     = document.getElementById('waveCanvas');

  if (!btnPlay || !canvas) return;

  const TOTAL_SEC = 252; // 4:12
  let playing  = false;
  let elapsed  = 0;
  let ticker   = null;
  let waveAnim = null;

  /* wave canvas */
  const ctx = canvas.getContext('2d');
  let wavePhase = 0;

  function drawWave() {
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const bars = 48;
    const gap  = 2;
    const barW = (W - gap * (bars - 1)) / bars;

    for (let i = 0; i < bars; i++) {
      const t = i / bars;
      const amp = playing
        ? 0.15 + 0.7 * Math.abs(Math.sin(t * Math.PI * 3.5 + wavePhase + i * 0.4))
        : 0.05 + 0.1 * Math.abs(Math.sin(t * Math.PI * 2));
      const h = amp * H;
      const x = i * (barW + gap);
      const y = (H - h) / 2;

      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, 'rgba(232,160,180,0.9)');
      grad.addColorStop(0.5, 'rgba(201,168,76,0.85)');
      grad.addColorStop(1, 'rgba(150,118,42,0.6)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, h, 2);
      ctx.fill();
    }

    if (playing) {
      wavePhase += 0.1;
      waveAnim = requestAnimationFrame(drawWave);
    }
  }

  drawWave();

  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function updateProgress() {
    const pct = (elapsed / TOTAL_SEC) * 100;
    fill.style.width  = pct + '%';
    thumb.style.left  = pct + '%';
    timeNow.textContent = fmt(elapsed);
  }

  function play() {
    playing = true;
    disc.classList.add('spinning');
    needle.classList.add('playing');
    iconPlay.style.display  = 'none';
    iconPause.style.display = '';
    cancelAnimationFrame(waveAnim);
    drawWave();
    ticker = setInterval(() => {
      elapsed = Math.min(elapsed + 1, TOTAL_SEC);
      updateProgress();
      if (elapsed >= TOTAL_SEC) pause();
    }, 1000);
  }

  function pause() {
    playing = false;
    disc.classList.remove('spinning');
    needle.classList.remove('playing');
    iconPlay.style.display  = '';
    iconPause.style.display = 'none';
    clearInterval(ticker);
    cancelAnimationFrame(waveAnim);
    drawWave();
  }

  function reset() {
    pause();
    elapsed = 0;
    updateProgress();
  }

  btnPlay.addEventListener('click', () => playing ? pause() : play());
  btnPrev.addEventListener('click', () => reset());
  btnNext.addEventListener('click', () => { reset(); });

  // clique na barra de progresso
  document.querySelector('.player-progress-bar').addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    elapsed = Math.round(pct * TOTAL_SEC);
    updateProgress();
  });

  updateProgress();
})();

/* ═══════════════════════════════════════════
   GALERIA POLAROID + LIGHTBOX
═══════════════════════════════════════════ */
(function () {
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lbImg');
  const lbClose   = document.getElementById('lbClose');
  const lbBackdrop = document.getElementById('lbBackdrop');

  document.querySelectorAll('.polaroid').forEach(p => {
    p.addEventListener('click', () => {
      const img = p.querySelector('img');
      if (!img || !lightbox) return;
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLb() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (lbClose)   lbClose.addEventListener('click', closeLb);
  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLb);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
})();

/* ═══════════════════════════════════════════
   MENSAGEM FINAL — TYPEWRITER
═══════════════════════════════════════════ */
(function () {
  const section = document.getElementById('mensagem');
  const target  = document.getElementById('typeText');
  const sig     = document.getElementById('msgSig');

  const text = 'Você não está aqui por uma data especial. ' +
    'Você está aqui porque você é especial — todos os dias, em todos os momentos. ' +
    'Dois anos me ensinaram que o que existe entre a gente não cabe em nenhuma data do calendário. ' +
    'Cabe só aqui, no peito, onde você mora desde que te conheci. ' +
    'Obrigado por voltar. Obrigado por ser você. Obrigado por ser minha.';

  let started = false;

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      typeWriter(text, target, 28, () => {
        if (sig) setTimeout(() => sig.classList.add('show'), 400);
      });
    }
  }, { threshold: 0.3 });

  if (section) obs.observe(section);

  function typeWriter(str, el, speed, done) {
    let i = 0;
    function next() {
      if (i < str.length) {
        el.textContent += str[i];
        i++;
        setTimeout(next, speed + Math.random() * 18);
      } else if (done) {
        done();
      }
    }
    next();
  }
})();

/* ═══════════════════════════════════════════
   SCROLL REVEAL GENÉRICO
═══════════════════════════════════════════ */
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.player-card, .envelopes-grid, .polaroid-table').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity .8s ease, transform .8s ease';
    obs.observe(el);
  });
})();

/* ═══════════════════════════════════════════
   EASTER EGG — KONAMI
═══════════════════════════════════════════ */
(function () {
  const seq = [38,38,40,40,37,39,37,39,66,65];
  let idx = 0;
  document.addEventListener('keydown', e => {
    idx = e.keyCode === seq[idx] ? idx + 1 : 0;
    if (idx === seq.length) {
      idx = 0;
      const ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(4,6,16,.9);';
      ov.innerHTML = `<div style="color:#c9a84c;text-align:center;padding:2rem;font-family:Georgia,serif;">
        <div style="font-size:3rem;margin-bottom:1rem;">♥</div>
        <p style="font-size:1.3rem;font-style:italic;max-width:460px;line-height:1.8;color:#e8a0b4;">
          "Você é a parte favorita de todos os meus dias."
        </p>
        <p style="margin-top:2rem;font-size:.72rem;letter-spacing:.2em;color:#6a7090;">— toque para fechar —</p>
      </div>`;
      ov.addEventListener('click', () => ov.remove());
      document.body.appendChild(ov);
    }
  });
})();
