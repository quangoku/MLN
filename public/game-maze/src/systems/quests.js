import { CONFIG } from '../config.js';

/**
 * Hệ thống Quản Lý Nhiệm Vụ (Quest System):
 * - Theo dõi danh sách nhiệm vụ đã nhận và đã hoàn thành
 * - Tự động cập nhật tiến độ (thu hoạch, nhặt tinh thể, ghé thăm khu vực)
 * - Trao thưởng tiền vàng & vật phẩm khi hoàn thành
 * - Lưu tiến độ vào localStorage
 */

export function createQuestSystem(economySystem) {
  let quests = [];
  try {
    const raw = localStorage.getItem(CONFIG.gameplay.questKey);
    if (raw) quests = JSON.parse(raw);
  } catch (e) {
    quests = [];
  }

  function save() {
    localStorage.setItem(CONFIG.gameplay.questKey, JSON.stringify(quests));
  }

  function hasQuest(questId) {
    return quests.some(q => q.id === questId);
  }

  function addQuest(questData) {
    if (hasQuest(questData.id)) return false;
    quests.push({
      id: questData.id,
      description: questData.description,
      objective: questData.objective,
      reward: questData.reward,
      progress: 0,
      completed: false
    });
    save();
    return true;
  }

  function getQuests() {
    return quests;
  }

  function notifyProgress(type, data = {}) {
    let changed = false;
    for (const q of quests) {
      if (q.completed) continue;

      if (q.objective.type === type) {
        if (type === 'harvest_crop') {
          if (!q.objective.crop || q.objective.crop === data.crop) {
            q.progress += (data.count || 1);
            changed = true;
          }
        } else if (type === 'collect_crystals') {
          q.progress = data.count || (q.progress + 1);
          changed = true;
        } else if (type === 'visit_zones') {
          q.progress = data.count || (q.progress + 1);
          changed = true;
        }

        // Kiểm tra hoàn thành
        if (q.progress >= q.objective.count) {
          q.completed = true;
          changed = true;

          // Trao thưởng
          if (q.reward) {
            if (q.reward.gold) economySystem.addGold(q.reward.gold);
            if (q.reward.item) economySystem.addItem(q.reward.item, 1);
          }

          // Hiển thị thông báo hoàn thành
          const toast = document.getElementById('notification-toast');
          if (toast) {
            toast.textContent = `🎉 Hoàn thành nhiệm vụ: ${q.description}! (+${q.reward.gold || 0} Vàng)`;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3500);
          }
        }
      }
    }

    if (changed) save();
  }

  return {
    hasQuest,
    addQuest,
    getQuests,
    notifyProgress,
    save
  };
}

