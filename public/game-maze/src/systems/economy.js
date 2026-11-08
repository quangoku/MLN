import { CONFIG } from '../config.js';

/**
 * Hệ thống Kinh Tế & Túi Đồ (Inventory System):
 * - Quản lý tiền vàng (Gold) và 20 ô túi đồ
 * - Các loại vật phẩm: Hạt giống, nông sản, tinh thể, công cụ, trang bị
 * - Mua/Bán với thương nhân, biến động giá nhẹ
 * - Lưu trữ tự động vào localStorage
 */

export const ITEM_DEFINITIONS = {
  // Hạt giống
  seed_carrot:      { id: 'seed_carrot', name: 'Hạt Giống Cà Rốt', type: 'seed', cropKey: 'carrot', buyPrice: 4, sellPrice: 2, icon: '🥕' },
  seed_rice:        { id: 'seed_rice', name: 'Hạt Giống Lúa', type: 'seed', cropKey: 'rice', buyPrice: 6, sellPrice: 3, icon: '🌾' },
  seed_pumpkin:     { id: 'seed_pumpkin', name: 'Hạt Giống Bí Ngô', type: 'seed', cropKey: 'pumpkin', buyPrice: 10, sellPrice: 5, icon: '🎃' },
  seed_cyanFlower:  { id: 'seed_cyanFlower', name: 'Hạt Hoa Thủy Tinh', type: 'seed', cropKey: 'cyanFlower', buyPrice: 15, sellPrice: 8, icon: '🪷' },
  seed_cyanMushroom:{ id: 'seed_cyanMushroom', name: 'Bào Tử Nấm Cyan', type: 'seed', cropKey: 'cyanMushroom', buyPrice: 20, sellPrice: 10, icon: '🍄' },

  // Nông sản thu hoạch
  crop_carrot:      { id: 'crop_carrot', name: 'Cà Rốt Tươi', type: 'crop', sellPrice: 8, icon: '🥕' },
  crop_rice:        { id: 'crop_rice', name: 'Bó Lúa Vàng', type: 'crop', sellPrice: 14, icon: '🌾' },
  crop_pumpkin:     { id: 'crop_pumpkin', name: 'Bí Ngô Lớn', type: 'crop', sellPrice: 25, icon: '🎃' },
  crop_cyanFlower:  { id: 'crop_cyanFlower', name: 'Hoa Thủy Tinh Dạ Quang', type: 'crop', sellPrice: 40, icon: '🪷' },
  crop_cyanMushroom:{ id: 'crop_cyanMushroom', name: 'Nấm Phát Sáng Viễn Cổ', type: 'crop', sellPrice: 55, icon: '🍄' },

  // Tinh thể & Khoáng sản
  crystal_shard:    { id: 'crystal_shard', name: 'Mảnh Tinh Thể Cyan', type: 'material', sellPrice: 30, icon: '💎' },
  ancient_relic:    { id: 'ancient_relic', name: 'Cổ Vật Tàn Tích', type: 'relic', sellPrice: 80, icon: '🏺' },

  // Trang bị nâng cấp
  speed_boots:      { id: 'speed_boots', name: 'Giày Gió Thần Tốc', type: 'equipment', buyPrice: 120, sellPrice: 60, icon: '👟', desc: '+30% tốc độ di chuyển' },
  golden_hoe:       { id: 'golden_hoe', name: 'Cuốc Hoàng Kim', type: 'tool', buyPrice: 90, sellPrice: 45, icon: '⛏️', desc: 'Canh tác nhanh chóng' },
  lantern_bright:   { id: 'lantern_bright', name: 'Đèn Lồng Dạ Quang', type: 'tool', buyPrice: 75, sellPrice: 35, icon: '🏮', desc: 'Mở rộng tầm nhìn đêm' },
  health_potion:    { id: 'health_potion', name: 'Dược Thủy Thần Bí', type: 'potion', buyPrice: 25, sellPrice: 12, icon: '🧪' }
};

export function createEconomySystem() {
  // Load lưu trữ
  let gold = CONFIG.economy.startingGold;
  try {
    const rawGold = localStorage.getItem(CONFIG.gameplay.goldKey);
    if (rawGold !== null) gold = parseInt(rawGold, 10);
  } catch (e) {}

  let inventory = [];
  try {
    const rawInv = localStorage.getItem(CONFIG.gameplay.inventoryKey);
    if (rawInv) inventory = JSON.parse(rawInv);
  } catch (e) {
    inventory = [];
  }

  if (inventory.length === 0) {
    // Khởi đầu cấp cho người chơi vài hạt giống và công cụ
    inventory = [
      { itemId: 'seed_carrot', count: 5 },
      { itemId: 'seed_rice', count: 3 },
      { itemId: 'seed_cyanFlower', count: 2 }
    ];
    save();
  }

  function save() {
    localStorage.setItem(CONFIG.gameplay.goldKey, String(gold));
    localStorage.setItem(CONFIG.gameplay.inventoryKey, JSON.stringify(inventory));
    updateHUD();
  }

  function updateHUD() {
    const goldHud = document.getElementById('gold-hud');
    if (goldHud) {
      goldHud.textContent = `🪙 ${gold} Vàng`;
    }
  }

  function getGold() {
    return gold;
  }

  function addGold(amount) {
    gold += amount;
    save();
  }

  function spendGold(amount) {
    if (gold >= amount) {
      gold -= amount;
      save();
      return true;
    }
    return false;
  }

  function getInventory() {
    return inventory;
  }

  function addItem(itemId, count = 1) {
    const item = inventory.find(i => i.itemId === itemId);
    if (item) {
      item.count += count;
    } else {
      if (inventory.length >= CONFIG.economy.maxInventorySlots) {
        return false; // Túi đầy
      }
      inventory.push({ itemId, count });
    }
    save();
    return true;
  }

  function removeItem(itemId, count = 1) {
    const itemIndex = inventory.findIndex(i => i.itemId === itemId);
    if (itemIndex > -1) {
      if (inventory[itemIndex].count > count) {
        inventory[itemIndex].count -= count;
      } else {
        inventory.splice(itemIndex, 1);
      }
      save();
      return true;
    }
    return false;
  }

  function getItemCount(itemId) {
    const item = inventory.find(i => i.itemId === itemId);
    return item ? item.count : 0;
  }

  function buyItem(itemId, count = 1) {
    const def = ITEM_DEFINITIONS[itemId];
    if (!def || !def.buyPrice) return false;
    const totalCost = def.buyPrice * count;
    if (spendGold(totalCost)) {
      if (!addItem(itemId, count)) {
        // Hoàn tiền nếu túi đầy
        addGold(totalCost);
        return false;
      }
      return true;
    }
    return false;
  }

  function sellItem(itemId, count = 1) {
    const def = ITEM_DEFINITIONS[itemId];
    if (!def || !def.sellPrice) return false;
    if (removeItem(itemId, count)) {
      addGold(def.sellPrice * count);
      return true;
    }
    return false;
  }

  // Khởi tạo HUD
  updateHUD();

  return {
    getGold,
    addGold,
    spendGold,
    getInventory,
    addItem,
    removeItem,
    getItemCount,
    buyItem,
    sellItem,
    updateHUD,
    save
  };
}

