import * as THREE from 'three';
import { CONFIG } from './config.js';
import { createTerrain } from './scene/terrain.js';
import { createExplorationWorld } from './scene/exploration.js';
import { createTemple } from './scene/temple.js';
import { createGrassField } from './scene/grass.js';
import { createPortal } from './scene/portal.js';
import { createCharacter } from './character.js';
import { createViewmodel } from './viewmodel.js';
import { createPhysics } from './physics.js';
import { createControls } from './controls.js';
import { createEffects } from './effects.js';
import { createMinimap } from './ui/minimap.js';
import { createFarmingVillage } from './scene/farmingVillage.js';
import { createTradeTown } from './scene/tradeTown.js';
import { createNPCSystem } from './npc/NPCSystem.js';
import { createDialogueSystem } from './npc/dialogue.js';
import { createEconomySystem, ITEM_DEFINITIONS } from './systems/economy.js';
import { createQuestSystem } from './systems/quests.js';

// ── 1. RENDERER & COLOR SPACE SETUP ──
const canvas = document.getElementById('webgl-canvas');

// Khôi phục exposure từ localStorage nếu có
const savedExposure = parseFloat(localStorage.getItem(CONFIG.gameplay.exposureKey) || String(CONFIG.renderer.exposure));

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  powerPreference: 'high-performance',
  stencil: false,
  depth: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.renderer.pixelRatioLimit));
renderer.toneMapping = CONFIG.renderer.toneMapping;
renderer.toneMappingExposure = savedExposure; // Mặc định 2.0 (sáng rõ)
renderer.outputColorSpace = CONFIG.renderer.outputColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.autoClear = false;

// ── 2. SCENE & FOG ──
const scene = new THREE.Scene();
scene.background = new THREE.Color(CONFIG.fog.color); // 0x15404a (teal sáng hơn)
scene.fog = new THREE.FogExp2(CONFIG.fog.color, CONFIG.fog.density); // 0.010 (tầm nhìn 150m+)

const camera = new THREE.PerspectiveCamera(
  CONFIG.camera.worldFov,
  window.innerWidth / window.innerHeight,
  CONFIG.camera.near,
  CONFIG.camera.far
);

// ── 3. ATMOSPHERIC LIGHTING OVERHAUL ──
// HemisphereLight: bầu trời teal 0x7fd0e0, mặt đất xanh rêu 0x1d4a34, intensity 2.2
const hemiLight = new THREE.HemisphereLight(
  CONFIG.lighting.hemiSkyColor,
  CONFIG.lighting.hemiGroundColor,
  CONFIG.lighting.hemiIntensity
);
scene.add(hemiLight);

// AmbientLight: deep cyan fill 0x4a9a96, intensity 1.0
const ambientLight = new THREE.AmbientLight(
  CONFIG.lighting.ambientColor,
  CONFIG.lighting.ambientIntensity
);
scene.add(ambientLight);

// DirectionalLight "Moonlight": xanh lam nhạt 0x9fd0ff, intensity 1.6
const moonLight = new THREE.DirectionalLight(
  CONFIG.lighting.moonColor,
  CONFIG.lighting.moonIntensity
);
moonLight.position.set(
  CONFIG.lighting.moonPosition[0],
  CONFIG.lighting.moonPosition[1],
  CONFIG.lighting.moonPosition[2]
);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = CONFIG.renderer.shadowMapSize;
moonLight.shadow.mapSize.height = CONFIG.renderer.shadowMapSize;
moonLight.shadow.camera.near = 10;
moonLight.shadow.camera.far = 400;
moonLight.shadow.camera.left = -100;
moonLight.shadow.camera.right = 100;
moonLight.shadow.camera.top = 100;
moonLight.shadow.camera.bottom = -100;
moonLight.shadow.bias = -0.001;
scene.add(moonLight);

// ── 4. ECONOMY & QUEST SYSTEMS ──
const economy = createEconomySystem();
const quests = createQuestSystem(economy);
const dialogue = createDialogueSystem(quests, economy);

// ── 5. WORLD & GAMEPLAY MODULES ──
const terrain = createTerrain(scene);
const explorationWorld = createExplorationWorld(scene);
const temple = createTemple(scene);
const grass = createGrassField(scene);
const portal = createPortal(scene);
const farmingVillage = createFarmingVillage(scene);
const tradeTown = createTradeTown(scene);
const npcSystem = createNPCSystem(scene, explorationWorld);
const character = createCharacter(scene);
const viewmodel = createViewmodel(canvas);
const physics = createPhysics(temple.colliders);

// ── 6. UI MODAL CALLBACKS ──
const settingsModal = document.getElementById('settings-modal');
const inventoryModal = document.getElementById('inventory-modal');
const questModal = document.getElementById('quest-modal');
const exposureSlider = document.getElementById('exposure-slider');
const exposureVal = document.getElementById('exposure-val');

if (exposureSlider) {
  exposureSlider.value = renderer.toneMappingExposure;
  if (exposureVal) exposureVal.textContent = renderer.toneMappingExposure.toFixed(1);
  exposureSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    renderer.toneMappingExposure = val;
    if (exposureVal) exposureVal.textContent = val.toFixed(1);
    localStorage.setItem(CONFIG.gameplay.exposureKey, String(val));
  });
}

function toggleSettings() {
  const isShown = settingsModal.style.display === 'flex';
  settingsModal.style.display = isShown ? 'none' : 'flex';
  if (!isShown && controls) controls.unlockPointer();
}

function toggleInventory() {
  const isShown = inventoryModal.style.display === 'flex';
  if (!isShown) {
    renderInventoryUI();
    inventoryModal.style.display = 'flex';
    if (controls) controls.unlockPointer();
  } else {
    inventoryModal.style.display = 'none';
  }
}

function toggleQuests() {
  const isShown = questModal.style.display === 'flex';
  if (!isShown) {
    renderQuestUI();
    questModal.style.display = 'flex';
    if (controls) controls.unlockPointer();
  } else {
    questModal.style.display = 'none';
  }
}

function renderInventoryUI() {
  const grid = document.getElementById('inventory-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const inv = economy.getInventory();

  for (let s = 0; s < CONFIG.economy.maxInventorySlots; s++) {
    const slotEl = document.createElement('div');
    slotEl.className = 'inventory-slot';

    if (s < inv.length) {
      const item = inv[s];
      const def = ITEM_DEFINITIONS[item.itemId] || { name: item.itemId, icon: '📦' };
      slotEl.innerHTML = `
        <span>${def.icon}</span>
        <span class="inventory-slot-name">${def.name}</span>
        <span class="inventory-slot-count">x${item.count}</span>
      `;
    }
    grid.appendChild(slotEl);
  }
}

function renderQuestUI() {
  const list = document.getElementById('quest-list');
  if (!list) return;
  list.innerHTML = '';
  const allQuests = quests.getQuests();

  if (allQuests.length === 0) {
    list.innerHTML = `<div style="text-align:center; color:rgba(180,240,230,0.6); padding:20px;">Chưa có nhiệm vụ nào. Hãy nói chuyện với các NPC!</div>`;
    return;
  }

  for (const q of allQuests) {
    const itemEl = document.createElement('div');
    itemEl.className = `quest-item ${q.completed ? 'completed' : ''}`;
    itemEl.innerHTML = `
      <div>
        <div style="font-weight:700; color:${q.completed ? '#27e39a' : '#5effdb'}; font-size:13.5px;">${q.description}</div>
        <div style="font-size:11.5px; color:rgba(180,240,230,0.7); margin-top:2px;">
          Tiến trình: ${q.progress} / ${q.objective.count} ${q.completed ? '✓ (Hoàn thành)' : ''}
        </div>
      </div>
      <div style="font-size:12px; color:#ffd700; font-weight:700;">+${q.reward.gold || 0}🪙</div>
    `;
    list.appendChild(itemEl);
  }
}

// Event listeners cho các nút modal
const closeSettingsBtn = document.getElementById('close-settings-btn');
if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', toggleSettings);

const settingsBtn = document.getElementById('settings-btn');
if (settingsBtn) settingsBtn.addEventListener('click', toggleSettings);

const inventoryBtn = document.getElementById('inventory-btn');
if (inventoryBtn) inventoryBtn.addEventListener('click', toggleInventory);

const questBtn = document.getElementById('quest-btn');
if (questBtn) questBtn.addEventListener('click', toggleQuests);

const dialogueClose = document.getElementById('dialogue-close');
if (dialogueClose) dialogueClose.addEventListener('click', () => dialogue.close());

// Real-time exposure adjustment handler cho [ và ]
function onExposureChange(delta) {
  let cur = renderer.toneMappingExposure + delta;
  cur = THREE.MathUtils.clamp(cur, CONFIG.renderer.minExposure, CONFIG.renderer.maxExposure);
  renderer.toneMappingExposure = parseFloat(cur.toFixed(2));
  localStorage.setItem(CONFIG.gameplay.exposureKey, String(renderer.toneMappingExposure));
  if (exposureSlider) exposureSlider.value = renderer.toneMappingExposure;
  if (exposureVal) exposureVal.textContent = renderer.toneMappingExposure.toFixed(1);
  showNotification(`Độ sáng (Exposure): ${renderer.toneMappingExposure.toFixed(1)}`);
}

const controls = createControls(camera, character, canvas, onExposureChange, viewmodel, {
  toggleSettings,
  toggleInventory,
  toggleQuests
});

const effects = createEffects(renderer, scene, camera);
const minimap = createMinimap(explorationWorld);

window.loadCharacter = character.loadCharacter;

// ── 7. AUDIO ──
let audioCtx = null;

function initAudio() {
  if (audioCtx) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    const droneOsc = audioCtx.createOscillator();
    const droneGain = audioCtx.createGain();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(55, audioCtx.currentTime);
    droneGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    droneOsc.connect(droneGain);
    droneGain.connect(audioCtx.destination);
    droneOsc.start();
  } catch (e) {
    console.warn(e);
  }
}

function playSoundChime(freq1 = 440, freq2 = 880) {
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq1, now);
    osc.frequency.exponentialRampToValueAtTime(freq2, now + 0.4);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  } catch (err) {}
}

function playPortalActivationSound() {
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 1.5);
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 3.0);
  } catch (err) {}
}

// ── 8. HUD & INTERACTION DOM ELEMENTS ──
const startScreen = document.getElementById('start-screen');
const hud = document.getElementById('hud');
const interactPrompt = document.getElementById('interact-prompt');
const interactText = document.getElementById('interact-text');
const portalBanner = document.getElementById('portal-banner');
const bannerTitle = document.getElementById('banner-title');
const bannerSub = document.getElementById('banner-sub');
const flashOverlay = document.getElementById('flash-overlay');
const viewIndicator = document.getElementById('view-indicator');
const runesHud = document.getElementById('runes-hud');
const crystalsHud = document.getElementById('crystals-hud');
const compassTarget = document.getElementById('compass-target');
const notificationToast = document.getElementById('notification-toast');
const backBtn = document.getElementById('back-btn');

let toastTimeout = null;
function showNotification(msg) {
  if (!notificationToast) return;
  notificationToast.textContent = msg;
  notificationToast.classList.remove('hidden');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    notificationToast.classList.add('hidden');
  }, 2400);
}

const startBtn = document.querySelector('.start-btn');

function startGame(e) {
  if (e) e.stopPropagation();
  if (startScreen) {
    startScreen.classList.add('hidden');
    startScreen.style.display = 'none';
  }
  if (hud) hud.classList.remove('hidden');
  initAudio();
  controls.lockPointer();
}

if (startScreen) startScreen.addEventListener('click', startGame);
if (startBtn) startBtn.addEventListener('click', startGame);

canvas.addEventListener('click', () => {
  if (startScreen.classList.contains('hidden') && !controls.isLocked() && !minimap.isOpen()) {
    if (settingsModal.style.display !== 'flex' &&
        inventoryModal.style.display !== 'flex' &&
        questModal.style.display !== 'flex' &&
        !dialogue.isOpen()) {
      controls.lockPointer();
    }
  }
});

if (backBtn) {
  backBtn.addEventListener('click', () => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage('ECONOMY_MAZE_BACK_TO_PORTAL', '*');
    }
  });
}

// ── 9. MAIN GAME LOOP ──
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsedTime = clock.getElapsedTime();

  // Controls & Physics
  const ctrlState = controls.update(delta, physics);
  const { interacted, isFirstPerson } = ctrlState;

  if (viewIndicator) {
    viewIndicator.textContent = isFirstPerson
      ? 'Góc nhìn: [V] Thứ nhất (FPS)'
      : 'Góc nhìn: [V] Thứ ba (TPS)';
  }

  // World updates
  terrain.update(elapsedTime);
  temple.update(elapsedTime);
  grass.update(elapsedTime);
  portal.update(elapsedTime, delta);

  const charPos = character.getPosition();
  explorationWorld.update(elapsedTime, delta, charPos);
  farmingVillage.update();
  tradeTown.update(elapsedTime, delta);
  npcSystem.update(delta, charPos, elapsedTime);

  // Kiểm tra bước vào khu vực mới
  const enteredZone = explorationWorld.checkZoneEntry(charPos);
  if (enteredZone) {
    quests.notifyProgress('visit_zones', { count: 1 });
  }

  // Update Minimap & Full-screen Map
  minimap.update(delta, charPos, controls.getYaw());

  // Update HUD Counts
  const activeRunes = explorationWorld.getActiveRuneCount();
  const collectedCrystals = explorationWorld.getCrystalCount();
  const totalCrystals = explorationWorld.getTotalCrystals();

  if (runesHud) {
    runesHud.textContent = `🔷 Phong ấn Cổ ngữ: ${activeRunes}/3`;
    runesHud.style.color = activeRunes === 3 ? '#5effdb' : '#7ef5db';
  }
  if (crystalsHud) {
    crystalsHud.textContent = `💎 Tinh thể: ${collectedCrystals}/${totalCrystals}`;
  }

  // Compass pointing to nearest unactivated Rune Stone
  let nearestRune = null;
  let nearestDist = Infinity;
  for (const r of explorationWorld.runes) {
    if (!r.isActivated()) {
      const d = charPos.distanceTo(r.pos);
      if (d < nearestDist) {
        nearestDist = d;
        nearestRune = r;
      }
    }
  }

  if (compassTarget) {
    if (nearestRune) {
      compassTarget.textContent = `🧭 Đá Cổ Ngữ gần nhất: ${nearestRune.name} (${Math.round(nearestDist)}m)`;
    } else {
      compassTarget.textContent = `✨ Đã mở đủ 3 phong ấn! Hãy về Đền Kích Hoạt Cổng!`;
      compassTarget.style.color = '#5effdb';
    }
  }

  // ── INTERACTION LOGIC ──
  let promptShown = false;

  // 1. Kiểm tra nói chuyện với NPC gần nhất
  const nearbyNPC = npcSystem.getNearbyNPC(charPos);
  if (nearbyNPC && !dialogue.isOpen()) {
    promptShown = true;
    interactPrompt.classList.remove('hidden');
    interactText.textContent = `Nói chuyện với: ${nearbyNPC.displayName}`;

    if (interacted) {
      dialogue.open(nearbyNPC);
      controls.unlockPointer();
    }
  }

  // 2. Kiểm tra ô ruộng Làng Nông Trại
  if (!promptShown) {
    for (const plot of farmingVillage.plots) {
      if (charPos.distanceTo(plot.pos) < 3.2) {
        const state = plot.getState();
        promptShown = true;
        interactPrompt.classList.remove('hidden');

        if (state === 'idle') {
          interactText.textContent = `Gieo hạt trồng cây`;
        } else if (state === 'growing') {
          interactText.textContent = `Cây đang lớn...`;
        } else if (state === 'harvestable') {
          interactText.textContent = `Thu hoạch cây trồng!`;
        }

        if (interacted) {
          const res = plot.interact();
          if (res) {
            showNotification(res);
            if (state === 'harvestable') {
              const cType = plot.getCropType();
              economy.addItem(`crop_${cType}`, 1);
              quests.notifyProgress('harvest_crop', { crop: cType, count: 1 });
            }
          }
        }
        break;
      }
    }
  }

  // 3. Kiểm tra Trụ Dịch Chuyển Nhanh
  if (!promptShown) {
    const nearPillar = explorationWorld.getFastTravelPillarNear(charPos);
    if (nearPillar) {
      promptShown = true;
      interactPrompt.classList.remove('hidden');
      interactText.textContent = `Trụ Dịch Chuyển: ${nearPillar.zoneName} (Nhấn E để về Đền)`;

      if (interacted) {
        // Dịch chuyển về Đền trung tâm
        charPos.set(0, 0, 16);
        showNotification(`✦ Đã dịch chuyển về Đền Trung Tâm!`);
        playSoundChime(440, 880);
      }
    }
  }

  // 4. Kiểm tra 3 Đá Cổ Ngữ
  if (!promptShown) {
    for (const r of explorationWorld.runes) {
      const d = charPos.distanceTo(r.pos);
      if (d < 4.2 && !r.isActivated()) {
        promptShown = true;
        interactPrompt.classList.remove('hidden');
        interactText.textContent = `Kích hoạt Đá Cổ Ngữ: ${r.name}`;

        if (interacted) {
          const activated = r.activate();
          if (activated) {
            playSoundChime(330, 660);
            showNotification(`Đã kích hoạt Đá Cổ Ngữ: ${r.name}! (${explorationWorld.getActiveRuneCount()}/3)`);

            if (explorationWorld.allRunesActive()) {
              showNotification(`TẤT CẢ 3 PHONG ẤN ĐÃ MỞ — CỔNG THIÊN CẦU ĐÃ SẴN SÀNG!`);
              playSoundChime(440, 880);
            }
          }
        }
        break;
      }
    }
  }

  // 5. Kiểm tra Cổng Thiên Cầu ở đền
  const portalPos = portal.getPosition();
  const distToPortal = charPos.distanceTo(portalPos);

  if (distToPortal < 3.5 && !promptShown) {
    if (!portal.isActivated()) {
      promptShown = true;
      interactPrompt.classList.remove('hidden');

      if (!explorationWorld.allRunesActive()) {
        const remain = 3 - explorationWorld.getActiveRuneCount();
        interactText.textContent = `Cổng Thiên Cầu còn thiếu ${remain} phong ấn Cổ ngữ!`;
        interactPrompt.style.borderColor = '#ffaa44';
      } else {
        interactText.textContent = `Kích hoạt Cổng Thiên Cầu`;
        interactPrompt.style.borderColor = '#00f7ff';

        if (interacted) {
          const activated = portal.activate();
          if (activated) {
            flashOverlay.classList.remove('flash-active');
            void flashOverlay.offsetWidth;
            flashOverlay.classList.add('flash-active');

            playPortalActivationSound();

            portalBanner.classList.remove('hidden');
            bannerTitle.textContent = `✨ CỔNG THIÊN CẦU ĐÃ ĐƯỢC KÍCH HOẠT ✨`;
            bannerSub.textContent = `Nguồn năng lượng viễn cổ bừng sáng, không gian bắt đầu cộng hưởng huyền bí...`;
            setTimeout(() => {
              portalBanner.classList.add('banner-fade');
            }, 6000);
          }
        }
      }
    }
  }

  if (!promptShown) {
    interactPrompt.classList.add('hidden');
  }

  // ── RENDER SEQUENCE ──
  // Pass 1: World Scene + Post-processing Bloom & Color Grading
  effects.render();

  // Pass 2: Viewmodel Hands rendered on top in First-Person with clearDepth()
  if (isFirstPerson) {
    viewmodel.render(renderer);
  }
}

// ── 10. WINDOW RESIZE HANDLER ──
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.renderer.pixelRatioLimit));
  effects.setSize(w, h);
  viewmodel.setSize(w, h);
});

animate();
