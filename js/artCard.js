// 3D collectible art card — ported from the Atom-I Founder Pass card mechanics
// (CSS preserve-3d drag-to-spin, backface culling fix, holographic HUD fx).
// Vanilla JS: openArtCard({ src, title, category }) shows any piece as a
// spinnable card. Front = the artwork, back = the story/specs.

const CARD_T = 10; // card thickness px
const CARD_HALF = CARD_T / 2;

let overlay, stage, inner, frontFace, backFace, frontImg;
let backTitle, backCategory;
let rotationY = 0, tiltX = 0;
let isDragging = false, dragStartX = 0, startRotY = 0;
let autoRotate = false, spinning = false, rafId = null;
let built = false;

function build() {
  if (built) return;
  built = true;

  overlay = document.createElement('div');
  overlay.id = 'artcard-overlay';
  overlay.className = 'artcard-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="artcard-modal" role="dialog" aria-label="3D art card">
      <button class="artcard-close" aria-label="Close">×</button>
      <div class="artcard-stage">
        <div class="artcard-inner">
          <div class="artcard-face artcard-front">
            <img class="artcard-art" alt="" draggable="false">
            <div class="artcard-scan"></div>
            <div class="artcard-sheen"></div>
            <span class="artcard-dot dot-a"></span>
            <span class="artcard-dot dot-b"></span>
            <div class="artcard-vignette"></div>
            <div class="artcard-glow"></div>
          </div>
          <div class="artcard-face artcard-back">
            <div class="artcard-back-inner">
              <div class="artcard-brand">FUAX</div>
              <div class="artcard-piece-title"></div>
              <div class="artcard-piece-cat"></div>
              <div class="artcard-rule"></div>
              <div class="artcard-meta">ORIGINAL ART — 1 OF 1</div>
              <div class="artcard-meta dim">FOREVER UNFINISHED ARTWORX</div>
              <div class="artcard-mail">fuax.machine@gmail.com</div>
            </div>
            <div class="artcard-scan"></div>
            <div class="artcard-sheen"></div>
            <div class="artcard-vignette"></div>
          </div>
          <div class="artcard-edge edge-h edge-top" aria-hidden="true"></div>
          <div class="artcard-edge edge-h edge-bottom" aria-hidden="true"></div>
          <div class="artcard-edge edge-v edge-left" aria-hidden="true"></div>
          <div class="artcard-edge edge-v edge-right" aria-hidden="true"></div>
        </div>
      </div>
      <div class="artcard-controls">
        <button data-act="spin">⟳ 360° SPIN</button>
        <button data-act="orbit">AUTO-ORBIT</button>
        <button data-act="reset">RESET</button>
      </div>
      <p class="artcard-hint">drag the card to spin it</p>
    </div>`;

  document.body.appendChild(overlay);

  stage = overlay.querySelector('.artcard-stage');
  inner = overlay.querySelector('.artcard-inner');
  frontFace = overlay.querySelector('.artcard-front');
  backFace = overlay.querySelector('.artcard-back');
  frontImg = overlay.querySelector('.artcard-art');
  backTitle = overlay.querySelector('.artcard-piece-title');
  backCategory = overlay.querySelector('.artcard-piece-cat');

  overlay.querySelector('.artcard-close').addEventListener('click', closeArtCard);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeArtCard(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) closeArtCard(); });

  overlay.querySelectorAll('.artcard-controls button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.act;
      if (act === 'spin') trigger360Spin();
      else if (act === 'orbit') setAutoRotate(!autoRotate, btn);
      else if (act === 'reset') { setAutoRotate(false); rotationY = 0; tiltX = 0; applyTransform(); syncOrbitBtn(); }
    });
  });

  // drag to spin + hover tilt
  stage.addEventListener('pointerdown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    startRotY = rotationY;
    setAutoRotate(false);
    stage.setPointerCapture?.(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStartX;
      let y = (startRotY + dx * 0.9) % 360;
      rotationY = y < 0 ? y + 360 : y;
      applyTransform();
    } else if (!autoRotate && !spinning) {
      const rect = stage.getBoundingClientRect();
      const y = e.clientY - rect.top;
      tiltX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
      applyTransform();
    }
  });
  const endDrag = () => { isDragging = false; };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
}

function applyTransform() {
  inner.style.transform = `rotateX(${tiltX}deg) rotateY(${rotationY}deg)`;
  // backface culling fix: hard-toggle faces past 90°/270° (Chrome/WebKit bleed-through)
  const norm = ((Math.round(rotationY) % 360) + 360) % 360;
  const back = norm > 90 && norm < 270;
  frontFace.style.visibility = back ? 'hidden' : 'visible';
  frontFace.style.opacity = back ? '0' : '1';
  backFace.style.visibility = back ? 'visible' : 'hidden';
  backFace.style.opacity = back ? '1' : '0';
}

function setAutoRotate(on, btn) {
  autoRotate = on;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  if (on) {
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      rotationY = (rotationY + dt * 35) % 360;
      applyTransform();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }
  syncOrbitBtn();
}

function syncOrbitBtn() {
  const btn = overlay.querySelector('[data-act="orbit"]');
  if (btn) btn.classList.toggle('active', autoRotate);
}

function trigger360Spin() {
  if (spinning) return;
  spinning = true;
  setAutoRotate(false);
  const start = rotationY, target = start + 360, dur = 1000;
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    rotationY = start + (target - start) * ease;
    applyTransform();
    if (p < 1) requestAnimationFrame(step);
    else { rotationY = target % 360; applyTransform(); spinning = false; }
  };
  requestAnimationFrame(step);
}

export function openArtCard({ src, title, category }) {
  build();
  frontImg.src = src;
  frontImg.alt = title;
  backTitle.textContent = title;
  backCategory.textContent = category;
  rotationY = 0; tiltX = 0;
  applyTransform();
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  setAutoRotate(true); // slow showcase orbit until the user grabs it
}

export function closeArtCard() {
  if (!built || overlay.hidden) return;
  overlay.hidden = true;
  // gallery overlay manages its own scroll lock; only release if it's closed too
  const gallery = document.getElementById('gallery-overlay');
  if (!gallery || gallery.hidden) document.body.style.overflow = '';
  setAutoRotate(false);
}

export function initArtCard() {
  build(); // pre-build so first open is instant
}
