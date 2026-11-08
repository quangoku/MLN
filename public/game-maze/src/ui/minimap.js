import { CONFIG } from '../config.js';

/**
 * 2D Circular Minimap + Full-screen Map cho thế giới 1000x1000m:
 * - 10 Icon khu vực khám phá
 * - Sương mù khám phá theo ô 20m (50x50 cells)
 * - Hiển thị 3 Đá Cổ Ngữ, trụ dịch chuyển, người chơi, hướng nhìn
 */
export function createMinimap(explorationWorld) {
  // ── 1. MINIMAP CANVAS ELEMENT ──
  const minimapCanvas = document.createElement('canvas');
  minimapCanvas.id = 'minimap-canvas';
  minimapCanvas.width = 200;
  minimapCanvas.height = 200;
  minimapCanvas.style.position = 'fixed';
  minimapCanvas.style.top = '16px';
  minimapCanvas.style.right = '16px';
  minimapCanvas.style.width = '200px';
  minimapCanvas.style.height = '200px';
  minimapCanvas.style.borderRadius = '50%';
  minimapCanvas.style.border = '2px solid rgba(0, 245, 210, 0.6)';
  minimapCanvas.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(0, 245, 210, 0.2)';
  minimapCanvas.style.background = 'rgba(2, 20, 22, 0.88)';
  minimapCanvas.style.backdropFilter = 'blur(8px)';
  minimapCanvas.style.zIndex = '35';
  document.body.appendChild(minimapCanvas);

  const mctx = minimapCanvas.getContext('2d');

  // ── 2. FULL-SCREEN MAP MODAL ──
  const fullmapOverlay = document.createElement('div');
  fullmapOverlay.id = 'fullmap-overlay';
  fullmapOverlay.style.position = 'fixed';
  fullmapOverlay.style.inset = '0';
  fullmapOverlay.style.background = 'radial-gradient(ellipse at center, rgba(3, 26, 28, 0.94) 0%, rgba(1, 10, 12, 0.98) 100%)';
  fullmapOverlay.style.backdropFilter = 'blur(16px)';
  fullmapOverlay.style.zIndex = '120';
  fullmapOverlay.style.display = 'none';
  fullmapOverlay.style.flexDirection = 'column';
  fullmapOverlay.style.alignItems = 'center';
  fullmapOverlay.style.justifyContent = 'center';
  fullmapOverlay.style.padding = '20px';

  fullmapOverlay.innerHTML = `
    <div style="font-family:'Cinzel',serif; font-size:28px; font-weight:900; color:#5effdb; margin-bottom:8px; letter-spacing:2px; text-shadow:0 0 16px rgba(0,255,220,0.5);">
      BẢN ĐỒ THẾ GIỚI CỔ ĐẠI (1000x1000m)
    </div>
    <div style="font-size:13px; color:rgba(180,240,230,0.8); margin-bottom:12px;">
      Vùng đất chưa khám phá bị che phủ bởi sương mù. Nhấn phím <b style="color:#00ffff;">[M]</b> để đóng.
    </div>
    <div style="position:relative; width:min(72vh, 600px); height:min(72vh, 600px); border:2px solid rgba(0,245,210,0.5); border-radius:16px; box-shadow:0 0 35px rgba(0,0,0,0.9); overflow:hidden; background:#021517;">
      <canvas id="fullmap-canvas" width="600" height="600" style="width:100%; height:100%; display:block;"></canvas>
    </div>
    <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:16px; margin-top:12px; font-size:12.5px; color:#d2faf0;">
      <span>🏛️ <b>Đền Trung Tâm</b></span>
      <span>🌲 <b>Rừng Sáng</b></span>
      <span>🌊 <b>Hồ Linh Thiêng</b></span>
      <span>🌾 <b>Làng Nông Trại</b></span>
      <span>🏪 <b>Thị Trấn Chợ</b></span>
      <span>💨 <b>Thung Lũng Gió</b></span>
      <span>🌫️ <b>Đầm Lầy</b></span>
      <span>🔷 <b style="color:#00ffcc;">Đá Cổ Ngữ</b></span>
    </div>
  `;
  document.body.appendChild(fullmapOverlay);

  const fullCanvas = fullmapOverlay.querySelector('#fullmap-canvas');
  const fctx = fullCanvas.getContext('2d');
  let isFullmapOpen = false;

  // ── 3. SƯƠNG MÙ KHÁM PHÁ (50x50 ô, mỗi ô 20x20m bao phủ 1000m) ──
  const gridSize = 50;
  let savedFog = [];
  try {
    const raw = localStorage.getItem('PHILOVERSE_FOG_OF_WAR');
    if (raw) savedFog = JSON.parse(raw);
  } catch (e) {
    savedFog = [];
  }
  const fogGrid = new Uint8Array(gridSize * gridSize);

  if (savedFog && savedFog.length === gridSize * gridSize) {
    for (let i = 0; i < savedFog.length; i++) fogGrid[i] = savedFog[i];
  } else {
    // Mở sẵn vùng đền trung tâm (ô 22-28)
    for (let gx = 22; gx <= 28; gx++) {
      for (let gz = 22; gz <= 28; gz++) {
        fogGrid[gz * gridSize + gx] = 1;
      }
    }
  }

  function saveFog() {
    localStorage.setItem('PHILOVERSE_FOG_OF_WAR', JSON.stringify(Array.from(fogGrid)));
  }

  let fogSaveTimer = 0;

  function updateFog(playerX, playerZ) {
    const halfSize = CONFIG.world.size * 0.5; // 500
    const gx = Math.floor(((playerX + halfSize) / CONFIG.world.size) * gridSize);
    const gz = Math.floor(((playerZ + halfSize) / CONFIG.world.size) * gridSize);

    let changed = false;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        const cx = gx + dx;
        const cz = gz + dz;
        if (cx >= 0 && cx < gridSize && cz >= 0 && cz < gridSize) {
          const idx = cz * gridSize + cx;
          if (fogGrid[idx] === 0) {
            fogGrid[idx] = 1;
            changed = true;
          }
        }
      }
    }
    return changed;
  }

  // ── 4. DANH SÁCH 10 KHU VỰC VỚI ICON ──
  const mapZones = [
    { name: 'Đền Cổ',            x:    0, z:    0, icon: '🏛️' },
    { name: 'Rừng Phát Sáng',    x: -250, z: -250, icon: '🌲' },
    { name: 'Hồ Linh Thiêng',    x:  230, z: -230, icon: '🌊' },
    { name: 'Tàn Tích',          x:  260, z:  260, icon: '🏛️' },
    { name: 'Hang Tinh Thể',     x: -280, z:  280, icon: '💎' },
    { name: 'Đài Quan Sát',      x:    0, z:  300, icon: '🔭' },
    { name: 'Làng Nông Trại',    x: -220, z:    0, icon: '🌾' },
    { name: 'Thị Trấn Chợ',      x:    0, z: -200, icon: '🏪' },
    { name: 'Thung Lũng Gió',    x:  350, z:    0, icon: '💨' },
    { name: 'Đầm Lầy Sương Mù',  x: -350, z:  350, icon: '🌫️' },
    { name: 'Vách Thác Nước',    x:  300, z: -300, icon: '🌊' }
  ];

  // ── 5. VẼ MINIMAP XOAY TRÒN QUANH NGƯỜI CHƠI ──
  function drawMinimap(playerPos, playerYaw) {
    const w = minimapCanvas.width;
    const h = minimapCanvas.height;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const mapScale = 0.55; // Tỉ lệ hiển thị ~180m bán kính

    mctx.clearRect(0, 0, w, h);

    mctx.save();
    mctx.beginPath();
    mctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    mctx.clip();

    // Nền
    mctx.fillStyle = '#021517';
    mctx.fillRect(0, 0, w, h);

    // Xoay theo góc nhìn
    mctx.translate(cx, cy);
    mctx.rotate(playerYaw);

    // Vẽ các khu vực
    for (const z of mapZones) {
      const rx = (z.x - playerPos.x) * mapScale;
      const rz = (z.z - playerPos.z) * mapScale;
      if (Math.hypot(rx, rz) < 120) {
        mctx.font = '14px Arial';
        mctx.textAlign = 'center';
        mctx.textBaseline = 'middle';
        mctx.fillText(z.icon, rx, rz);
      }
    }

    // Vẽ 3 Đá Cổ Ngữ
    for (const r of explorationWorld.runes) {
      const rx = (r.pos.x - playerPos.x) * mapScale;
      const rz = (r.pos.z - playerPos.z) * mapScale;
      if (Math.hypot(rx, rz) < 120) {
        mctx.fillStyle = r.isActivated() ? '#00ffcc' : '#ffaa00';
        mctx.beginPath();
        mctx.arc(rx, rz, 4.5, 0, Math.PI * 2);
        mctx.fill();
      }
    }

    mctx.restore();

    // Mũi tên chỉ hướng người chơi ở tâm
    mctx.save();
    mctx.translate(cx, cy);
    mctx.fillStyle = '#00f7ff';
    mctx.beginPath();
    mctx.moveTo(0, -7);
    mctx.lineTo(5, 6);
    mctx.lineTo(0, 3);
    mctx.lineTo(-5, 6);
    mctx.closePath();
    mctx.fill();
    mctx.restore();

    // Vành la bàn
    mctx.strokeStyle = 'rgba(0, 245, 210, 0.4)';
    mctx.lineWidth = 1.5;
    mctx.beginPath();
    mctx.arc(cx, cy, cx - 4, 0, Math.PI * 2);
    mctx.stroke();
  }

  // ── 6. VẼ BẢN ĐỒ TOÀN MÀN HÌNH (M KEY) ──
  function drawFullmap(playerPos, playerYaw) {
    if (!isFullmapOpen) return;

    const w = fullCanvas.width;
    const h = fullCanvas.height;
    fctx.clearRect(0, 0, w, h);

    // Nền
    fctx.fillStyle = '#041d20';
    fctx.fillRect(0, 0, w, h);

    const worldSize = CONFIG.world.size; // 1000
    const toMapX = (wx) => ((wx + worldSize * 0.5) / worldSize) * w;
    const toMapY = (wz) => ((wz + worldSize * 0.5) / worldSize) * h;

    // Vẽ các khu vực
    for (const z of mapZones) {
      const mx = toMapX(z.x);
      const my = toMapY(z.z);
      fctx.font = '18px Arial';
      fctx.textAlign = 'center';
      fctx.textBaseline = 'middle';
      fctx.fillText(z.icon, mx, my);

      fctx.fillStyle = 'rgba(200, 250, 240, 0.85)';
      fctx.font = '10px Inter, sans-serif';
      fctx.fillText(z.name, mx, my + 14);
    }

    // Vẽ 3 Đá Cổ Ngữ
    for (const r of explorationWorld.runes) {
      const rx = toMapX(r.pos.x);
      const ry = toMapY(r.pos.z);
      fctx.fillStyle = r.isActivated() ? '#00ffcc' : '#ff7700';
      fctx.beginPath();
      fctx.arc(rx, ry, 6, 0, Math.PI * 2);
      fctx.fill();
      fctx.strokeStyle = '#ffffff';
      fctx.lineWidth = 1.5;
      fctx.stroke();
    }

    // Vẽ sương mù khám phá (50x50 cells)
    const cellW = w / gridSize;
    const cellH = h / gridSize;
    fctx.fillStyle = 'rgba(1, 10, 12, 0.94)';

    for (let gz = 0; gz < gridSize; gz++) {
      for (let gx = 0; gx < gridSize; gx++) {
        const idx = gz * gridSize + gx;
        if (fogGrid[idx] === 0) {
          fctx.fillRect(gx * cellW, gz * cellH, cellW + 0.5, cellH + 0.5);
        }
      }
    }

    // Vị trí người chơi
    const px = toMapX(playerPos.x);
    const py = toMapY(playerPos.z);

    fctx.save();
    fctx.translate(px, py);
    fctx.rotate(-playerYaw + Math.PI);
    fctx.fillStyle = '#00f7ff';
    fctx.beginPath();
    fctx.moveTo(0, -9);
    fctx.lineTo(6, 8);
    fctx.lineTo(0, 4);
    fctx.lineTo(-6, 8);
    fctx.closePath();
    fctx.fill();
    fctx.restore();
  }

  // Toggle bản đồ bằng phím M
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyM') {
      isFullmapOpen = !isFullmapOpen;
      fullmapOverlay.style.display = isFullmapOpen ? 'flex' : 'none';
      if (isFullmapOpen && document.exitPointerLock) {
        document.exitPointerLock();
      }
    }
  });

  return {
    isOpen: () => isFullmapOpen,
    update: (delta, playerPos, playerYaw) => {
      const fogChanged = updateFog(playerPos.x, playerPos.z);
      fogSaveTimer += delta;
      if (fogChanged && fogSaveTimer > 5.0) {
        saveFog();
        fogSaveTimer = 0;
      }
      drawMinimap(playerPos, playerYaw);
      if (isFullmapOpen) {
        drawFullmap(playerPos, playerYaw);
      }
    }
  };
}
