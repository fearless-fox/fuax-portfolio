import * as THREE from 'three';

const IMG_BASE = 'assets/images/';

// One cube per discipline. Add image filenames here as new work lands
// (e.g. from the Drive portfolio folder) — faces and galleries update automatically.
const CATEGORIES = [
  { id: 'mixed-media', label: 'MIXED MEDIA', images: ['mixed-media-pick1.jpg', 'mixed-media-pick2.jpg', 'mixed-media-pick3.jpg', 'mixed-media-01.jpg', 'mixed-media-02.jpg', 'mixed-media-03.jpg', 'mixed-media-04.jpg', 'mixed-media-05.jpg', 'mixed-media-06.jpg', 'mixed-media-07.jpg', 'mixed-media-08.jpg', 'mixed-media-09.jpg', 'mixed-media-10.jpg', 'mixed-media-11.jpg'] },
  { id: 'digital',     label: 'DIGITAL',     images: ['digital-01.jpg', 'digital-02.jpg', 'digital-03.jpg', 'digital-04.jpg', 'digital-05.jpg', 'digital-06.jpg', 'digital-07.jpg', 'digital-08.jpg', 'digital-09.png', 'digital-10.jpg'] },
  { id: 'photography', label: 'PHOTOGRAPHY', images: ['photography-01.jpg', 'photography-02.jpg'] },
  { id: 'dev',         label: 'DEV WORK',    images: [] },
  { id: 'music',       label: 'MUSIC',       images: [] },
  { id: 'typography',  label: 'TYPOGRAPHY',  images: ['typography-pick1.jpg', 'typography-01.jpg', 'typography-02.jpg'] },
  { id: 'street',      label: 'STREET',      images: ['street-pick1.jpg', 'street-pick2.jpg', 'street-01.jpg', 'street-02.jpg'] },
  { id: 'sketchbook',  label: 'SKETCHBOOK',  images: ['sketchbook-01.jpg', 'sketchbook-02.jpg', 'sketchbook-03.jpg', 'sketchbook-04.jpg', 'sketchbook-05.jpg', 'sketchbook-06.jpg'] },
];

const FOX_RED = 0xC13E1B;
const CARBON = 0x0C0C0E;

export function initCubeGallery(canvasId = 'cube-canvas') {
  const container = document.querySelector('.cube-gallery');
  const canvas = document.getElementById(canvasId);
  const loadingEl = document.getElementById('cube-loading');
  if (!container || !canvas) return;

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(2, 2, 5);
  scene.add(dirLight);

  // ---- textures ----
  const textureLoader = new THREE.TextureLoader();
  let loadedCount = 0;
  let totalTextures = 0;

  function checkDone() {
    loadedCount++;
    if (totalTextures > 0 && loadedCount >= totalTextures && loadingEl) {
      loadingEl.style.opacity = '0';
      setTimeout(() => loadingEl.remove(), 300);
    }
  }

  // letterbox non-square artwork into the square face
  function loadTexture(url) {
    totalTextures++;
    return textureLoader.load(url, (tex) => {
      const img = tex.image;
      if (img) {
        const aspect = img.width / img.height;
        if (aspect > 1) {
          tex.repeat.set(1, 1 / aspect);
          tex.offset.set(0, (1 - 1 / aspect) / 2);
        } else {
          tex.repeat.set(aspect, 1);
          tex.offset.set((1 - aspect) / 2, 0);
        }
      }
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      checkDone();
    }, undefined, () => checkDone());
  }

  // discipline name plate, drawn on a canvas texture
  function makeLabelTexture(label) {
    const s = 512;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    g.fillStyle = '#0C0C0E';
    g.fillRect(0, 0, s, s);
    g.strokeStyle = '#C13E1B';
    g.lineWidth = 10;
    g.strokeRect(28, 28, s - 56, s - 56);
    g.fillStyle = '#EDEDE6';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    let px = 84;
    g.font = `800 ${px}px Sarpanch, Arial, sans-serif`;
    while (g.measureText(label).width > s - 120 && px > 30) {
      px -= 6;
      g.font = `800 ${px}px Sarpanch, Arial, sans-serif`;
    }
    g.fillText(label, s / 2, s / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  // faces: artwork first, then the name plate, then brand solids to fill
  function buildMaterials(cat) {
    const mats = cat.images.map(
      (src) => new THREE.MeshBasicMaterial({ map: loadTexture(IMG_BASE + src), transparent: true })
    );
    mats.push(new THREE.MeshBasicMaterial({ map: makeLabelTexture(cat.label), transparent: true }));
    const solids = [FOX_RED, CARBON];
    let si = 0;
    while (mats.length < 6) {
      mats.push(new THREE.MeshBasicMaterial({ color: solids[si % 2], transparent: true, opacity: 0.95 }));
      si++;
    }
    return mats;
  }

  const cubes = [];
  CATEGORIES.forEach((cat, i) => {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), buildMaterials(cat));
    cube.userData = {
      categoryId: cat.id,
      label: cat.label,
      targetRotX: 0.25,
      targetRotY: -0.35,
      isHovered: false,
      baseY: 0,
      phase: i * 0.8,
    };
    scene.add(cube);
    cubes.push(cube);
  });

  // no artwork at all yet → drop the loader immediately
  if (totalTextures === 0 && loadingEl) loadingEl.remove();

  // ---- responsive grid layout ----
  function layout() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);

    let cols, size, spacing;
    if (w < 600) {
      cols = 2; size = 56; spacing = 88; camera.position.z = 320;
    } else if (w < 960) {
      cols = 4; size = 58; spacing = 96; camera.position.z = 380;
    } else {
      cols = 4; size = 74; spacing = 122; camera.position.z = 440;
    }

    const rows = Math.ceil(cubes.length / cols);
    cubes.forEach((cube, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      cube.scale.setScalar(size);
      cube.position.x = (col - (cols - 1) / 2) * spacing;
      cube.position.y = ((rows - 1) / 2 - row) * spacing * 0.92;
      cube.userData.baseY = cube.position.y;
    });
  }

  // ---- interaction: drag to spin, click a cube to open its gallery ----
  const raycaster = new THREE.Raycaster();
  const mouseVector = new THREE.Vector2();
  let isDragging = false;
  let dragCubes = [];
  let lastPos = { x: 0, y: 0 };
  let downPos = null;
  let downTime = 0;

  function getPointerPos(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function endPos(e) {
    if (e.changedTouches && e.changedTouches.length > 0) {
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function pick(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    mouseVector.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseVector.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseVector, camera);
    const hits = raycaster.intersectObjects(cubes);
    return hits.length > 0 ? hits[0].object : null;
  }

  function onPointerDown(e) {
    const pos = getPointerPos(e);
    isDragging = true;
    downPos = { ...pos };
    downTime = Date.now();
    lastPos = { ...pos };
    canvas.style.cursor = 'grabbing';
    const hit = pick(pos.x, pos.y);
    dragCubes = hit ? [hit] : cubes.slice();
  }

  function onPointerMove(e) {
    const pos = getPointerPos(e);
    if (!isDragging) {
      const hit = pick(pos.x, pos.y);
      cubes.forEach((c) => { c.userData.isHovered = false; });
      if (hit) {
        hit.userData.isHovered = true;
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'grab';
      }
      return;
    }
    e.preventDefault();
    const dx = pos.x - lastPos.x;
    const dy = pos.y - lastPos.y;
    lastPos = { ...pos };
    const s = 0.008;
    dragCubes.forEach((cube) => {
      cube.userData.targetRotY += dx * s;
      cube.userData.targetRotX += dy * s;
    });
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    dragCubes = [];
    canvas.style.cursor = 'grab';
    // a short tap without drag = click → open that cube's gallery
    if (downPos) {
      const p = endPos(e);
      const moved = Math.hypot(p.x - downPos.x, p.y - downPos.y);
      if (moved < 8 && Date.now() - downTime < 500) {
        const hit = pick(p.x, p.y);
        if (hit) openGallery(hit.userData.categoryId);
      }
    }
    downPos = null;
  }

  canvas.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  canvas.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('touchend', onPointerUp);

  // ---- gallery overlay ----
  const overlay = document.getElementById('gallery-overlay');
  const gKicker = document.getElementById('gallery-kicker');
  const gTitle = document.getElementById('gallery-title');
  const gImages = document.getElementById('gallery-images');
  const gClose = document.getElementById('gallery-close');

  function openGallery(categoryId) {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    if (!cat || !overlay) return;
    gKicker.textContent = `GALLERY // ${cat.label}`;
    gTitle.textContent = cat.label;
    gImages.innerHTML = '';
    if (cat.images.length === 0) {
      const p = document.createElement('p');
      p.className = 'gallery-empty';
      p.textContent = 'More dropping soon. Check back.';
      gImages.appendChild(p);
    } else {
      cat.images.forEach((src) => {
        const img = document.createElement('img');
        img.src = IMG_BASE + src;
        img.alt = `${cat.label} — ${src}`;
        img.loading = 'lazy';
        gImages.appendChild(img);
      });
    }
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeGallery() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  if (gClose) gClose.addEventListener('click', closeGallery);
  if (overlay) overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeGallery();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGallery();
  });

  // ---- render loop ----
  function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.001;
    cubes.forEach((cube) => {
      const u = cube.userData;
      const f = u.isHovered ? 0.12 : 0.08;
      cube.rotation.x += (u.targetRotX - cube.rotation.x) * f;
      cube.rotation.y += (u.targetRotY - cube.rotation.y) * f;
      if (!isDragging) {
        u.targetRotY += 0.0025;
        cube.position.y = u.baseY + Math.sin(t + u.phase) * 3;
      }
    });
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', layout);
  layout();
  animate();
}
