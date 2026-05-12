<script setup>
import { computed } from 'vue'
const props = defineProps({
  game: {
    type: Object,
    required: true
  }
})
// 🌟 1. 程度翻譯對照表 (把資料庫的英文轉成中文)
const levelMap = {
  'BEGINNER': '初級',
  'INTERMEDIATE': '中級',
  'ADVANCED': '高級',
  'ALL': '不限'
}
const displayLevel = computed(() => {
  const lvl = props.game.skillLevel || props.game.level
  return levelMap[lvl] || lvl || '不限'
})
// 🌟 2. 根據翻譯好的中文決定標籤顏色
const levelBadgeClass = computed(() => {
  const lvl = displayLevel.value
  switch (lvl) {
    case '初級': return 'text-success bg-success-subtle'
    case '中級': return 'text-sky-blue bg-sky-blue-subtle'
    case '高級': return 'text-danger bg-danger-subtle'
    default: return 'text-secondary bg-secondary-subtle'
  }
})
</script>
<template>
  <!-- 外層變成獨立卡片，左邊加上天藍色粗邊條 -->
  <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 mb-3 bg-white rounded-3 shadow-sm game-row-hover transition-all"
       style="border: 1px solid #eaeaea;">

    <!-- 1. 時間與場館 -->
    <div class="d-flex flex-column mb-3 mb-md-0" style="min-width: 200px;">
      <div class="fw-bold fs-5 text-dark mb-1">{{ game.startTime }} - {{ game.endTime }}</div>
      <div class="text-secondary small">
        <i class="bi bi-geo-alt"></i> {{ game.venue?.venueName || '未指定場館' }}
      </div>
    </div>
    <!-- 2. 主揪資訊 -->
    <div class="d-flex align-items-center mb-3 mb-md-0" style="min-width: 160px;">
      <img :src="game.host?.photoUrl || `https://i.pravatar.cc/150?u=${game.host?.memberId}`"
           class="rounded-circle me-3" width="45" height="45" alt="avatar">
      <div class="d-flex flex-column">
        <span class="fw-bold text-dark">{{ game.host?.fullName || '揪團主' }}</span>
        <span class="text-warning" style="font-size: 0.75rem;">★ 4.9</span>
      </div>
    </div>
    <!-- 3. LEVEL 程度標籤 -->
    <div class="d-flex flex-column mb-3 mb-md-0" style="min-width: 100px;">
      <span class="text-muted fw-bold mb-2" style="font-size: 0.65rem; letter-spacing: 1px;">LEVEL</span>
      <div>
        <span class="badge rounded-pill px-3 py-2 fw-normal" :class="levelBadgeClass">
          {{ displayLevel }}
        </span>
      </div>
    </div>
    <!-- 4. 報名狀況 -->
    <div class="d-flex flex-column mb-3 mb-md-0" style="min-width: 130px;">
      <span class="text-muted fw-bold mb-2" style="font-size: 0.65rem; letter-spacing: 1px;">報名狀況</span>
      <div class="text-dark fw-medium small d-flex align-items-center">
        <i class="bi bi-people-fill text-secondary me-2"></i>
        <span>{{ game.currentPlayers }} / {{ game.maxPlayers }}</span>
        <span v-if="game.currentPlayers >= game.maxPlayers" class="text-secondary ms-2 small">已額滿</span>
      </div>
    </div>
    <!-- 5. 查看詳情按鈕 -->
    <div class="text-md-end mt-2 mt-md-0">
      <button
        class="btn rounded-pill px-4 py-2 d-flex align-items-center justify-content-center gap-2 outline-btn-custom w-100"
        @click="$emit('view-details', game)"
      >
        <span class="fw-bold" style="font-size: 0.9rem;">查看詳情</span>
        <i class="bi bi-arrow-right"></i>
      </button>
    </div>
  </div>
</template>
<style scoped>
:root {
  --sky-blue: #0ea5e9;
  --sky-blue-subtle: #e0f2fe;
}
.text-sky-blue { color: var(--sky-blue); }
.bg-sky-blue { background-color: var(--sky-blue); }
.bg-sky-blue-subtle { background-color: var(--sky-blue-subtle); }
/* 🌟 查看詳情按鈕的專屬樣式 (參考圖的透明底+灰框) */
.outline-btn-custom {
  border: 1.5px solid #d1d5db;
  color: #374151;
  background: transparent;
  transition: all 0.2s;
}
.outline-btn-custom:hover {
  border-color: #0ea5e9;
  color: #0ea5e9;
  background-color: #f0f9ff;
}
/* 🌟 卡片懸浮時的浮起效果 */
.game-row-hover:hover {
  border-color: #0ea5e9 !important;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1) !important;
  transform: translateY(-2px);
  cursor: pointer;
}
.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>
