import { initFoxParticleSystem } from './particleSystem.js';
import { initCubeGallery } from './cubeGallery.js';
import { initArtCard } from './artCard.js';

document.addEventListener('DOMContentLoaded', () => {
  initFoxParticleSystem('ff-three-canvas');
  initCubeGallery('cube-canvas');
  initArtCard();
});
