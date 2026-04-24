window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loading').classList.add('hidden');
    triggerHeroReveal();
  }, 1900);
});

// Campo de estrelas
(function () {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function mkStar() { return { x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.2+.2, a: Math.random(), da: (Math.random()*.004+.001)*(Math.random()<.5?1:-1), gold: Math.random()<.18 }; }
  function init() { resize(); stars = Array.from({ length: 200 }, mkStar); }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.a = Math.max(.05, Math.min(1, s.a + s.da));
      if (s.a <= .05 || s.a >= 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = s.gold ? `rgba(201,168,76,${s.a*.7})` : `rgba(242,242,240,${s.a*.55})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  init(); draw();
})();

// Nav scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 60); });

// Hero reveal
function triggerHeroReveal() {
  document.querySelectorAll('#hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 220);
  });
}

// Scroll animations
const observer = new IntersectionObserver(
  entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target); } }); },
  { threshold: 0.12 }
);
document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

// Poema stagger
const poemCard = document.querySelector('.poem-card');
if (poemCard) {
  const poemObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      poemCard.querySelectorAll('.poem-lines p').forEach((p, i) => {
        setTimeout(() => { p.style.transition = `opacity .6s ease ${i*60}ms, transform .6s ease ${i*60}ms`; p.style.opacity = '1'; p.style.transform = 'none'; }, i*60);
      });
      poemObs.unobserve(poemCard);
    }
  }, { threshold: .25 });
  poemCard.querySelectorAll('.poem-lines p').forEach(p => { p.style.opacity = '0'; p.style.transform = 'translateY(12px)'; });
  poemObs.observe(poemCard);
}

// Contador de dias desde 4 de dezembro de 2024
(function () {
  const start = new Date('2024-12-04');
  const now   = new Date();
  const days  = Math.floor((now - start) / (1000*60*60*24));
  const el    = document.getElementById('days-counter');
  if (!el) return;
  let current = 0;
  const step  = Math.ceil(days / 60);
  const timer = setInterval(() => {
    current = Math.min(current + step, days);
    el.textContent = current.toLocaleString('pt-BR');
    if (current >= days) clearInterval(timer);
  }, 24);
})();

// Flip cards — razões
document.querySelectorAll('.razao-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});

// Cursor coração
const cursorEl = document.getElementById('cursor');
let curX = 0, curY = 0, aimX = 0, aimY = 0;
document.addEventListener('mousemove', e => { aimX = e.clientX; aimY = e.clientY; });
(function animateCursor() {
  curX += (aimX - curX) * 0.18;
  curY += (aimY - curY) * 0.18;
  cursorEl.style.left = curX + 'px';
  cursorEl.style.top  = curY + 'px';
  requestAnimationFrame(animateCursor);
})();

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Easter egg — Konami code
const konami = [38,38,40,40,37,39,37,39,66,65];
let konamiIdx = 0;
document.addEventListener('keydown', e => {
  if (e.keyCode === konami[konamiIdx]) { konamiIdx++; if (konamiIdx === konami.length) { konamiIdx = 0; showKonami(); } }
  else { konamiIdx = 0; }
});
function showKonami() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;background:rgba(8,8,8,.85);font-family:Georgia,serif;text-align:center;';
  overlay.innerHTML = `<div style="color:#c9a84c;padding:2rem;"><div style="font-size:3rem;margin-bottom:1rem;">♥</div><p style="font-size:1.4rem;font-style:italic;max-width:480px;line-height:1.7;">"Você é a parte favorita de todos os meus dias."</p><p style="margin-top:1.5rem;font-size:.8rem;letter-spacing:.2em;color:#7a7a7a;">— clique para fechar —</p></div>`;
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
}