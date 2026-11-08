import { CONFIG } from '../config.js';
import { DIALOGUES } from './dialogues.js';

/**
 * Hệ thống Hội Thoại NPC:
 * - Load data từ dialogues.json
 * - UI hộp thoại với tên, chân dung, text, lựa chọn
 * - Nhận nhiệm vụ và theo dõi tiến trình
 */
export function createDialogueSystem(questSystem, economySystem) {
  let currentDialogue = null;
  let currentNPC = null;
  let currentLineIdx = 0;
  let isOpen = false;

  // DOM elements
  const dialogueBox    = document.getElementById('dialogue-box');
  const dialogueName   = document.getElementById('dialogue-name');
  const dialogueText   = document.getElementById('dialogue-text');
  const dialogueNext   = document.getElementById('dialogue-next');
  const dialoguePortrait = document.getElementById('dialogue-portrait');
  const dialogueQuest  = document.getElementById('dialogue-quest-btn');

  if (!dialogueBox) return { isOpen: () => false, open: () => {}, close: () => {}, advance: () => {} };

  function open(npc) {
    if (!npc.dialogueId) return;
    const data = DIALOGUES[npc.dialogueId];
    if (!data) return;

    currentDialogue = data;
    currentNPC = npc;
    currentLineIdx = 0;
    isOpen = true;

    dialogueName.textContent = data.speaker;
    dialogueText.textContent = data.lines[0];

    // Portrait màu theo loại NPC
    _drawPortrait(npc.type);

    // Ẩn/hiện nút nhận quest
    if (data.quest && dialogueQuest) {
      const qId = data.quest.id;
      const alreadyAccepted = questSystem.hasQuest(qId);
      dialogueQuest.style.display = alreadyAccepted ? 'none' : 'block';
      dialogueQuest.textContent = `✦ Nhận nhiệm vụ: ${data.quest.description}`;
    } else if (dialogueQuest) {
      dialogueQuest.style.display = 'none';
    }

    dialogueBox.classList.remove('hidden');
  }

  function advance() {
    if (!currentDialogue) return;
    currentLineIdx++;
    if (currentLineIdx >= currentDialogue.lines.length) {
      close();
    } else {
      dialogueText.textContent = currentDialogue.lines[currentLineIdx];
    }
  }

  function acceptQuest() {
    if (!currentDialogue || !currentDialogue.quest) return;
    questSystem.addQuest(currentDialogue.quest);
    if (dialogueQuest) dialogueQuest.style.display = 'none';
    // Thông báo
    const notify = document.getElementById('notification-toast');
    if (notify) {
      notify.textContent = `📜 Nhận nhiệm vụ: ${currentDialogue.quest.description}`;
      notify.classList.remove('hidden');
      setTimeout(() => notify.classList.add('hidden'), 2500);
    }
  }

  function close() {
    isOpen = false;
    currentDialogue = null;
    currentNPC = null;
    if (dialogueBox) dialogueBox.classList.add('hidden');
  }

  function _drawPortrait(type) {
    if (!dialoguePortrait) return;
    const colors = {
      villager: '#c8945a', farmer: '#c07040', merchant: '#aa6611',
      guard: '#8a7060', scholar: '#334488', hunter: '#336622',
      child: '#ff8844', elder: '#886644'
    };
    const bgColor = colors[type] || '#445566';
    const ctx = dialoguePortrait.getContext('2d');
    ctx.clearRect(0, 0, 60, 60);
    ctx.fillStyle = bgColor;
    ctx.beginPath(); ctx.arc(30, 30, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.ellipse(30, 42, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = bgColor;
    ctx.beginPath(); ctx.arc(30, 24, 11, 0, Math.PI * 2); ctx.fill();
  }

  // Event listeners
  if (dialogueNext) dialogueNext.addEventListener('click', advance);
  if (dialogueQuest) dialogueQuest.addEventListener('click', acceptQuest);
  document.addEventListener('keydown', (e) => {
    if (isOpen && (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space')) {
      e.preventDefault();
      advance();
    }
    if (isOpen && e.code === 'Escape') close();
  });

  return {
    isOpen: () => isOpen,
    open,
    close,
    advance
  };
}

