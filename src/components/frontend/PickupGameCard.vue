<script setup>
// 定義接收外部傳進來的真實揪團資料
const props = defineProps({
  game: {
    type: Object,
    required: true
  }
})
// 根據程度換標籤顏色
const levelBadgeClass = (level) => {
  switch (level) {
    case '初級': return 'bg-success-subtle text-success'
    case '中級': return 'bg-warning-subtle text-warning'
    case '高級': return 'bg-danger-subtle text-danger'
    default: return 'bg-secondary-subtle text-secondary'
  }
}
</script>
<template>
  <div class="card card-rounded shadow-sm border-0 h-100 hover-lift">
    <div class="card-body p-4">
      <!-- 標題 + 等級 -->
      <div class="d-flex align-items-start justify-content-between mb-3">
        <h5 class="card-title fw-bold mb-0">羽球臨打活動</h5>
        <span class="badge rounded-pill" :class="levelBadgeClass(game.skillLevel || game.level)" style="font-size: 0.7rem;">
          {{ game.skillLevel || game.level || '不限' }}
        </span>
      </div>
      <!-- 資訊 (對應真實 API 資料結構) -->
      <div class="d-flex flex-column gap-2 mb-4" style="font-size: 0.85rem; color: #64748B;">
        <div><i class="bi bi-geo-alt me-2 text-info"></i>{{ game.venue?.venueName }} - {{ game.court?.courtName }}</div>
        <div><i class="bi bi-calendar-event me-2 text-info"></i>{{ game.gameDate }}</div>
        <div><i class="bi bi-clock me-2 text-info"></i>{{ game.startTime }} - {{ game.endTime }}</div>
      </div>
      <!-- 人數進度條 -->
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1" style="font-size: 0.75rem; color: #94A3B8;">
          <span>報名人數</span>
          <span class="fw-bold">{{ game.currentPlayers }} / {{ game.maxPlayers }}</span>
        </div>
        <div class="progress" style="height: 6px; border-radius: 3px;">
          <div
            class="progress-bar"
            role="progressbar"
            :style="{ width: (game.currentPlayers / game.maxPlayers * 100) + '%', backgroundColor: 'var(--brand-teal)' }"
          ></div>
        </div>
      </div>
      <!-- 發起人 + 報名按鈕 -->
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <!-- 如果真實會員有大頭貼放這，沒有就用預設 -->
          <img :src="game.host?.avatarUrl || `https://i.pravatar.cc/100?u=${game.host?.memberId}`" alt="avatar" class="avatar-sm" />
          <span style="font-size: 0.8rem; color: #64748B;">{{ game.host?.fullName }}</span>
        </div>
        <!-- 點擊觸發父元件的 join-game 事件 -->
        <button
          class="btn btn-brand btn-sm"
          :disabled="game.currentPlayers >= game.maxPlayers"
          @click="$emit('join-game', game)"
        >
          {{ game.currentPlayers >= game.maxPlayers ? '已額滿' : '我要報名' }}
        </button>
      </div>
    </div>
  </div>
</template>
