import * as THREE from 'three';

// Procedural texture generators using Canvas for zero-network stylized hand-painted visuals
const textureCache = {};

/**
 * Creates a stylized stone slab texture with beveled edge highlights, cracks, and moss patches.
 */
export function getStoneTexture() {
  if (textureCache.stone) return textureCache.stone;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base stone dark teal-grey
  ctx.fillStyle = '#111e22';
  ctx.fillRect(0, 0, 1024, 1024);

  // Surface stone noise & mottling
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const r = Math.random() * 8 + 2;
    const lum = Math.floor(Math.random() * 25 + 18);
    const teal = Math.floor(Math.random() * 30 + 32);
    ctx.fillStyle = `rgba(${lum}, ${teal}, ${teal + 10}, 0.15)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw stylized rectangular stone blocks / seams
  const rows = 4;
  const cols = 4;
  const rw = 1024 / cols;
  const rh = 1024 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * rw;
      const y = r * rh;

      // Inner tile fill
      const grad = ctx.createLinearGradient(x, y, x + rw, y + rh);
      grad.addColorStop(0, 'rgba(28, 48, 54, 0.45)');
      grad.addColorStop(0.5, 'rgba(18, 32, 37, 0.6)');
      grad.addColorStop(1, 'rgba(10, 20, 24, 0.7)');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 4, y + 4, rw - 8, rh - 8);

      // Deep groove
      ctx.strokeStyle = '#050a0c';
      ctx.lineWidth = 6;
      ctx.strokeRect(x + 3, y + 3, rw - 6, rh - 6);

      // Stylized hand-painted bright edge highlight (top and left)
      ctx.strokeStyle = 'rgba(78, 140, 155, 0.65)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + rh - 6);
      ctx.lineTo(x + 5, y + 5);
      ctx.lineTo(x + rw - 6, y + 5);
      ctx.stroke();

      // Shadowed bottom and right edge
      ctx.strokeStyle = 'rgba(4, 10, 12, 0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + rw - 5, y + 5);
      ctx.lineTo(x + rw - 5, y + rh - 5);
      ctx.lineTo(x + 5, y + rh - 5);
      ctx.stroke();
    }
  }

  // Weathering cracks
  ctx.strokeStyle = 'rgba(5, 12, 14, 0.9)';
  ctx.lineWidth = 2;
  for (let k = 0; k < 12; k++) {
    let cx = Math.random() * 900 + 50;
    let cy = Math.random() * 900 + 50;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let s = 0; s < 5; s++) {
      cx += (Math.random() - 0.5) * 45;
      cy += (Math.random() - 0.5) * 45;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Moss spots along seams
  for (let m = 0; m < 50; m++) {
    const mx = Math.random() * 1024;
    const my = Math.random() * 1024;
    const mr = Math.random() * 24 + 10;
    const grad = ctx.createRadialGradient(mx, my, 2, mx, my, mr);
    grad.addColorStop(0, 'rgba(28, 85, 58, 0.7)');
    grad.addColorStop(0.6, 'rgba(15, 55, 38, 0.4)');
    grad.addColorStop(1, 'rgba(10, 30, 20, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.stone = texture;
  return texture;
}

/**
 * Creates stylized stone column texture with vertical fluting lines and edge beveling.
 */
export function getPillarTexture() {
  if (textureCache.pillar) return textureCache.pillar;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#121f24';
  ctx.fillRect(0, 0, 512, 1024);

  // Vertical fluting channels
  const channels = 6;
  const cw = 512 / channels;
  for (let i = 0; i < channels; i++) {
    const x = i * cw;
    const grad = ctx.createLinearGradient(x, 0, x + cw, 0);
    grad.addColorStop(0, 'rgba(6, 14, 18, 0.85)');
    grad.addColorStop(0.25, 'rgba(25, 45, 52, 0.5)');
    grad.addColorStop(0.75, 'rgba(35, 60, 68, 0.6)');
    grad.addColorStop(1, 'rgba(6, 14, 18, 0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(x + 4, 0, cw - 8, 1024);

    // Sharp stylized edge highlight on fluting
    ctx.strokeStyle = 'rgba(75, 145, 160, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 5, 0);
    ctx.lineTo(x + 5, 1024);
    ctx.stroke();
  }

  // Moss build-up near bottom
  const mossGrad = ctx.createLinearGradient(0, 700, 0, 1024);
  mossGrad.addColorStop(0, 'rgba(20, 65, 45, 0)');
  mossGrad.addColorStop(0.6, 'rgba(25, 80, 55, 0.5)');
  mossGrad.addColorStop(1, 'rgba(30, 95, 60, 0.85)');
  ctx.fillStyle = mossGrad;
  ctx.fillRect(0, 700, 512, 324);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.pillar = texture;
  return texture;
}

/**
 * Creates the glowing vertical emerald banner texture hanging on the front pillars.
 */
export function getBannerTexture() {
  if (textureCache.banner) return textureCache.banner;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 256, 1024);

  // Banner ribbon background: rich emerald green with cyan gradient
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, 'rgba(0, 120, 70, 0.85)');
  grad.addColorStop(0.5, 'rgba(20, 200, 120, 0.95)');
  grad.addColorStop(1, 'rgba(0, 120, 70, 0.85)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(236, 0);
  ctx.lineTo(236, 920);
  ctx.lineTo(128, 1010); // Pointed tip at bottom
  ctx.lineTo(20, 920);
  ctx.closePath();
  ctx.fill();

  // Glowing neon green border
  ctx.strokeStyle = '#4eff90';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Inner stylized runic chevron patterns
  ctx.strokeStyle = '#d4ffea';
  ctx.lineWidth = 6;
  ctx.fillStyle = '#a6ffd4';

  for (let y = 100; y < 850; y += 120) {
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(128, y + 40);
    ctx.lineTo(176, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(128, y - 15, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.banner = texture;
  return texture;
}

/**
 * Creates the celestial circular stone disc with glowing cyan spiral rune.
 */
export function getRuneDiscTexture() {
  if (textureCache.runeDisc) return textureCache.runeDisc;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Outer stone circular medallion
  ctx.fillStyle = '#142227';
  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#32525c';
  ctx.lineWidth = 14;
  ctx.stroke();

  // Stepped inner stone ring
  ctx.beginPath();
  ctx.arc(256, 256, 200, 0, Math.PI * 2);
  ctx.strokeStyle = '#091317';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Radial notches / ancient markings
  ctx.strokeStyle = '#457280';
  ctx.lineWidth = 6;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    const x1 = 256 + Math.cos(a) * 205;
    const y1 = 256 + Math.sin(a) * 205;
    const x2 = 256 + Math.cos(a) * 230;
    const y2 = 256 + Math.sin(a) * 230;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Radiant Glowing Cyan Spiral Glyph
  ctx.save();
  ctx.shadowColor = '#00f7ff';
  ctx.shadowBlur = 35;

  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';

  ctx.beginPath();
  let angle = 0;
  let radius = 18;
  ctx.moveTo(256, 256);
  while (angle < Math.PI * 5.2) {
    angle += 0.15;
    radius += 3.2;
    const sx = 256 + Math.cos(angle) * radius;
    const sy = 256 + Math.sin(angle) * radius;
    ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Core white-cyan inner filament
  ctx.strokeStyle = '#e0ffff';
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.runeDisc = texture;
  return texture;
}

/**
 * Creates transparent ivy and creeping vine leaf texture.
 */
export function getIvyTexture() {
  if (textureCache.ivy) return textureCache.ivy;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 512);

  // Winding vine branches
  ctx.strokeStyle = '#1b3827';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(256, 512);
  ctx.bezierCurveTo(200, 380, 310, 220, 230, 40);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(230, 350);
  ctx.bezierCurveTo(140, 300, 100, 210, 80, 120);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(260, 240);
  ctx.bezierCurveTo(340, 200, 410, 170, 440, 80);
  ctx.stroke();

  // Function to draw stylized leaf
  function drawLeaf(x, y, angle, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Leaf body
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size * 0.7, -size * 0.4, -size * 0.6, -size * 1.1, 0, -size * 1.4);
    ctx.bezierCurveTo(size * 0.6, -size * 1.1, size * 0.7, -size * 0.4, 0, 0);

    const leafGrad = ctx.createLinearGradient(0, 0, 0, -size * 1.4);
    leafGrad.addColorStop(0, '#195c37');
    leafGrad.addColorStop(0.5, '#2ecc71');
    leafGrad.addColorStop(1, '#65f3ad');
    ctx.fillStyle = leafGrad;
    ctx.fill();

    // Stylized bright rim
    ctx.strokeStyle = 'rgba(150, 255, 200, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center vein
    ctx.strokeStyle = '#104526';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -size * 1.2);
    ctx.stroke();

    ctx.restore();
  }

  // Draw clusters of leaves
  const leaves = [
    { x: 245, y: 460, a: -0.6, s: 32 },
    { x: 265, y: 430, a: 0.8, s: 30 },
    { x: 220, y: 370, a: -1.0, s: 36 },
    { x: 275, y: 340, a: 0.7, s: 34 },
    { x: 190, y: 290, a: -0.8, s: 32 },
    { x: 140, y: 260, a: -1.2, s: 28 },
    { x: 100, y: 200, a: -1.5, s: 30 },
    { x: 80, y: 130, a: -1.0, s: 26 },
    { x: 260, y: 240, a: 0.5, s: 35 },
    { x: 320, y: 210, a: 1.1, s: 32 },
    { x: 380, y: 170, a: 0.9, s: 28 },
    { x: 430, y: 90, a: 1.3, s: 26 },
    { x: 240, y: 160, a: -0.4, s: 30 },
    { x: 225, y: 90, a: 0.6, s: 32 },
    { x: 230, y: 45, a: 0.1, s: 24 }
  ];

  for (const l of leaves) {
    drawLeaf(l.x, l.y, l.a, l.s);
  }

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.ivy = texture;
  return texture;
}

/**
 * Creates armillary metallic ring texture with etched grooves and cyan inlay.
 */
export function getArmillaryTexture() {
  if (textureCache.armillary) return textureCache.armillary;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Dark metallic bronze/slate base
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#162329');
  grad.addColorStop(0.3, '#263b44');
  grad.addColorStop(0.7, '#1b2c33');
  grad.addColorStop(1, '#0f181c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Glowing cyan inlay channel
  ctx.fillStyle = '#00e5ff';
  ctx.fillRect(0, 118, 512, 20);

  ctx.strokeStyle = '#a6ffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 120, 512, 16);

  // Etched notches
  ctx.fillStyle = '#0b1317';
  for (let x = 0; x < 512; x += 16) {
    ctx.fillRect(x, 80, 4, 30);
    ctx.fillRect(x, 146, 4, 30);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.armillary = texture;
  return texture;
}

