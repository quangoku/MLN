import * as THREE from 'three';

/**
 * Global Configuration for Ancient Temple & Exploration World.
 * Chỉnh sửa tất cả hằng số tại đây để tinh chỉnh mà không cần đọc code game.
 */
export const CONFIG = {
  // ── 1. RENDERER & EXPOSURE ──
  renderer: {
    exposure: 2.0,             // Độ phơi sáng cơ bản (chỉnh bằng [ và ] in-game)
    minExposure: 0.8,          // Tối thiểu
    maxExposure: 3.5,          // Tối đa
    exposureStep: 0.1,         // Bước mỗi lần nhấn [ hoặc ]
    toneMapping: THREE.ACESFilmicToneMapping,
    outputColorSpace: THREE.SRGBColorSpace,
    pixelRatioLimit: 2.0,      // Giới hạn pixel ratio để không quá nặng
    shadowMapSize: 2048        // Kích thước shadow map (1024 nếu FPS thấp)
  },

  // ── 2. LIGHTING ──
  lighting: {
    // HemisphereLight: bầu trời teal sáng, mặt đất xanh rêu
    hemiSkyColor: 0x7fd0e0,    // Bầu trời xanh lam teal sáng
    hemiGroundColor: 0x1d4a34, // Mặt đất xanh rêu
    hemiIntensity: 2.2,        // Cường độ tổng thể

    // AmbientLight: fill light xanh teal
    ambientColor: 0x4a9a96,
    ambientIntensity: 1.0,

    // DirectionalLight ánh trăng: xanh lam nhạt từ cao
    moonColor: 0x9fd0ff,
    moonIntensity: 1.6,
    moonPosition: [60, 120, 40],

    // Portal PointLight: phát sáng cyan mạnh
    portalLightColor: 0x00ffcc,
    portalLightIntensity: 80.0,
    portalLightDistance: 28.0,
    portalLightDecay: 2.0,

    // 2 PointLight cột đền: chiếu sáng mặt trong cột
    pillarLightColor: 0x00e5c8,
    pillarLightIntensity: 18.0,
    pillarLightDistance: 14.0
  },

  // ── 3. FOG ──
  fog: {
    color: 0x15404a,           // Teal sáng (không đen kịt)
    density: 0.010             // Thấp = tầm nhìn xa hơn 150m
  },

  // ── 4. BLOOM & POST-PROCESSING ──
  bloom: {
    strength: 0.6,             // Nhẹ hơn để không làm mờ toàn màn hình
    radius: 0.5,
    threshold: 0.90            // Chỉ phần rất sáng mới bloom
  },
  colorGrading: {
    vignetteDarkness: 0.6,     // Giảm vignette để góc không bị đen
    vignetteOffset: 1.0,
    tealShadowTint: 0x052226
  },

  // ── 5. GRASS & MATERIALS ──
  grass: {
    baseColor: 0x145c35,       // Gốc xanh đậm (+40% so với trước)
    tipColor: 0x5fe0a0,        // Ngọn xanh sáng mượt
    cyanRimColor: 0x4ff5d0,    // Rim sáng cyan gần cổng
    count: 38000,              // Số lá cỏ
    bladeHeight: 0.65          // Chiều cao trung bình lá cỏ
  },
  stone: {
    roughness: 0.80,
    metalness: 0.12,
    emissiveColor: 0x0f3030,   // Emissive nhẹ để đá không chìm trong bóng
    emissiveIntensity: 0.25    // Tăng lên 0.25 để rõ chi tiết
  },

  // ── 6. CAMERAS & FOV ──
  camera: {
    worldFov: 75,
    viewmodelFov: 60,          // FPS tay: FOV riêng để không méo
    near: 0.1,
    far: 600.0                 // Tăng far plane cho thế giới 1000m
  },

  // ── 7. WORLD & TERRAIN ──
  world: {
    size: 1000,                // 1000x1000m terrain
    templeRadius: 28.0,        // Vùng phẳng quanh đền
    maxSlopeClimb: 0.72,       // Độ dốc tối đa leo được
    cullingDistance: 100.0,    // Khoảng cách render foliage
    boundaryRadius: 485.0      // Giới hạn đi (núi biên giới)
  },

  // ── 8. GAMEPLAY ──
  gameplay: {
    requiredRunes: 3,
    totalCrystals: 30,         // Tăng lên 30 tinh thể
    storageKey: 'PHILOVERSE_ANCIENT_TEMPLE_SAVE',
    exposureKey: 'PHILOVERSE_EXPOSURE',
    goldKey: 'PHILOVERSE_GOLD',
    inventoryKey: 'PHILOVERSE_INVENTORY',
    questKey: 'PHILOVERSE_QUESTS',
    farmKey: 'PHILOVERSE_FARM'
  },

  // ── 9. NPC SYSTEM ──
  npc: {
    activationRadius: 80.0,    // Bán kính kích hoạt AI
    interactRadius: 4.0,       // Khoảng cách bắt đầu hội thoại
    walkSpeed: 1.5,            // Tốc độ NPC đi bộ
    patrolWaitTime: 2.5        // Thời gian đứng chờ ở waypoint
  },

  // ── 10. ECONOMY ──
  economy: {
    startingGold: 50,          // Vàng ban đầu
    maxInventorySlots: 20
  },

  // ── 11. FARMING ──
  farming: {
    cropGrowthTime: {          // Thời gian trồng (ms)
      carrot: 180000,          // 3 phút
      rice: 300000,            // 5 phút
      pumpkin: 480000,         // 8 phút
      cyanFlower: 120000,      // 2 phút
      cyanMushroom: 240000     // 4 phút
    }
  }
};
