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
// 🌟 2. 整合式徽章設計 (程度 + 性別)
const integratedBadge = computed(() => {
  const lvl = displayLevel.value
  const g = props.game.requiredGender || props.game.genderLimit || 'ALL'
  
  if (g === 'FEMALE') {
    return { 
      label: `限女 · ${lvl}`, 
      icon: 'bi-gender-female', 
      class: 'badge-integrated-female' 
    }
  } else if (g === 'MALE') {
    return { 
      label: `限男 · ${lvl}`, 
      icon: 'bi-gender-male', 
      class: 'badge-integrated-male' 
    }
  } else {
    return { 
      label: lvl, 
      icon: null, 
      class: 'badge-integrated-all' 
    }
  }
})

// 🌟 4. 日期處理小工具
const getDayOfWeek = (dateStr) => {
  if (!dateStr) return ''
  const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']
  return days[new Date(dateStr).getDay()]
}
const isToday = (dateStr) => {
  if (!dateStr) return false
  const d = new Date()
  // 修正時區問題，使用本機日期
  const todayStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  return dateStr === todayStr
}
const isTomorrow = (dateStr) => {
  if (!dateStr) return false
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const tomorrowStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  return dateStr === tomorrowStr
}
</script>
<template>
  <div class="card border-0 rounded-4 shadow-sm mb-4 game-card-hover col-12 col-lg-10 col-xl-8 mx-auto" 
       @click="$emit('open-quick-view', game)">
    <div class="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
      
      <!-- 左側區域 -->
      <div class="d-flex flex-column gap-3">
        <!-- 頂部資訊 -->
        <div>
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="fs-5 fw-bold text-dark">📅 {{ game.gameDate }} ({{ getDayOfWeek(game.gameDate) }})</span>
            <span v-if="isToday(game.gameDate)" class="badge bg-danger rounded-pill px-2 py-1 shadow-sm">🔥 今天</span>
            <span v-else-if="isTomorrow(game.gameDate)" class="badge bg-warning text-dark rounded-pill px-2 py-1 shadow-sm">🌟 明天</span>
          </div>
          <div class="d-flex flex-wrap align-items-center gap-3 text-secondary small">
            <span><i class="bi bi-clock me-1 text-sky-blue"></i> {{ game.startTime }} - {{ game.endTime }}</span>
            <span>
              <i class="bi bi-geo-alt me-1 text-sky-blue"></i> 
              <template v-if="game.court">
                {{ game.court.venue?.venueName || '未指定場館' }} - {{ game.court.courtName || '未指定場地' }}
              </template>
              <template v-else>未指定場館</template>
            </span>
          </div>
          <!-- 🌟 新增：簡略備註或提供球種 -->
          <div class="mt-2 text-secondary small">
            <i class="bi bi-card-text me-1 opacity-75"></i> {{ game.description || '無特別備註' }}
          </div>
        </div>

        <!-- 底部主揪資訊 -->
        <div class="d-flex align-items-center mt-3">
          <img :src="game.host?.photoUrl || `https://i.pravatar.cc/150?u=${game.host?.memberId}`"
               class="rounded-circle border me-2 shadow-sm" width="48" height="48" alt="avatar">
          <div class="d-flex flex-column">
            <span class="text-secondary" style="font-size: 0.75rem; letter-spacing: 0.5px;">主揪人</span>
            <span class="fw-bold text-dark fs-6">{{ game.host?.fullName || '揪團主' }}</span>
          </div>
        </div>
      </div>

      <!-- 右側區域 -->
      <div class="d-flex flex-row flex-md-column align-items-center align-items-md-end justify-content-between mt-3 mt-md-0 pt-3 pt-md-0 border-top-md-none w-md-25">
        <!-- 🌟 包裝右側資訊區塊 (bg-light, rounded-3, p-3) -->
        <div class="bg-light rounded-3 p-3 w-100 d-flex flex-column align-items-md-end border">
          <!-- 整合標籤區塊 -->
          <div class="text-md-end d-flex align-items-center mb-3">
            <span class="badge rounded-pill px-4 py-2 fs-6 fw-bold shadow-sm d-flex align-items-center gap-1" :class="integratedBadge.class">
              <i v-if="integratedBadge.icon" class="bi fs-5" :class="integratedBadge.icon"></i> 
              {{ integratedBadge.label }}
            </span>
          </div>
          <!-- 報名人數 -->
          <div class="d-flex flex-column align-items-md-end w-100">
            <div class="d-flex justify-content-between align-items-center w-100 mb-1">
              <span class="text-secondary fw-medium" style="font-size: 0.85rem;">報名進度</span>
              <span v-if="game.currentPlayers >= game.maxPlayers" class="badge bg-danger-subtle text-danger rounded-pill">已滿團</span>
              <span v-else class="badge bg-success-subtle text-success rounded-pill">報名中</span>
            </div>
            <div class="d-flex align-items-baseline gap-1 mt-1">
              <span class="fs-3 fw-bold" :class="game.currentPlayers >= game.maxPlayers ? 'text-danger' : 'text-dark'">
                {{ game.currentPlayers }}
              </span>
              <span class="text-muted small">/ {{ game.maxPlayers }} 人</span>
            </div>
          </div>
        </div>
      </div>

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
.game-card-hover {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid transparent !important;
}
.game-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(14, 165, 233, 0.15) !important;
  border-color: rgba(14, 165, 233, 0.3) !important;
}
.border-top-md-none {
  border-top: 1px solid #eaeaea;
}
@media (min-width: 768px) {
  .border-top-md-none {
    border-top: none !important;
  }
}
/* 🌟 整合式徽章專屬樣式 */
.badge-integrated-male {
  background-color: #E3F2FD !important;
  color: #1976D2 !important;
  border: 1px solid #90CAF9 !important;
}
.badge-integrated-female {
  background-color: #FCE4EC !important;
  color: #D81B60 !important;
  border: 1px solid #F48FB1 !important;
}
.badge-integrated-all {
  background-color: #f8f9fa !important;
  color: #6c757d !important;
  border: 1px solid #dee2e6 !important;
}
</style>
