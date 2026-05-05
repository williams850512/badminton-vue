<script setup>
/**
 * 首頁 — 近期揪團活動
 * 展示可報名的揪團卡片（日期/地點/人數/報名按鈕）
 */
import { ref } from 'vue'

const pickupGames = ref([
  {
    id: 1,
    title: '週末友誼賽',
    venue: '羽過天晴 A 館',
    date: '2024/05/25（六）',
    time: '14:00 - 17:00',
    level: '中級',
    current: 6,
    max: 8,
    organizer: '小陳',
    avatar: 'https://i.pravatar.cc/100?img=15',
  },
  {
    id: 2,
    title: '新手練習場',
    venue: '羽過天晴 B 館',
    date: '2024/05/26（日）',
    time: '09:00 - 12:00',
    level: '初級',
    current: 3,
    max: 6,
    organizer: '阿美',
    avatar: 'https://i.pravatar.cc/100?img=20',
  },
  {
    id: 3,
    title: '高手切磋夜',
    venue: '羽過天晴 A 館',
    date: '2024/05/27（一）',
    time: '19:00 - 21:30',
    level: '高級',
    current: 7,
    max: 8,
    organizer: '老王',
    avatar: 'https://i.pravatar.cc/100?img=33',
  },
])

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
  <section class="mb-5">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h2 class="section-title mb-0">近期揪團活動</h2>
      <RouterLink to="/pickup" class="text-decoration-none fw-bold" style="color: var(--brand-sky); font-size: 0.875rem;">
        查看全部 <i class="bi bi-arrow-right"></i>
      </RouterLink>
    </div>

    <div class="row g-4">
      <div v-for="game in pickupGames" :key="game.id" class="col-md-6 col-lg-4">
        <div class="card card-rounded shadow-sm border-0 h-100 hover-lift">
          <div class="card-body p-4">
            <!-- 標題 + 等級 -->
            <div class="d-flex align-items-start justify-content-between mb-3">
              <h5 class="card-title fw-bold mb-0">{{ game.title }}</h5>
              <span class="badge rounded-pill" :class="levelBadgeClass(game.level)" style="font-size: 0.7rem;">
                {{ game.level }}
              </span>
            </div>

            <!-- 資訊 -->
            <div class="d-flex flex-column gap-2 mb-4" style="font-size: 0.85rem; color: #64748B;">
              <div><i class="bi bi-geo-alt me-2 text-info"></i>{{ game.venue }}</div>
              <div><i class="bi bi-calendar-event me-2 text-info"></i>{{ game.date }}</div>
              <div><i class="bi bi-clock me-2 text-info"></i>{{ game.time }}</div>
            </div>

            <!-- 人數進度條 -->
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1" style="font-size: 0.75rem; color: #94A3B8;">
                <span>報名人數</span>
                <span class="fw-bold">{{ game.current }} / {{ game.max }}</span>
              </div>
              <div class="progress" style="height: 6px; border-radius: 3px;">
                <div
                  class="progress-bar"
                  role="progressbar"
                  :style="{ width: (game.current / game.max * 100) + '%', backgroundColor: 'var(--brand-teal)' }"
                ></div>
              </div>
            </div>

            <!-- 發起人 + 報名按鈕 -->
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <img :src="game.avatar" :alt="game.organizer" class="avatar-sm" />
                <span style="font-size: 0.8rem; color: #64748B;">{{ game.organizer }}</span>
              </div>
              <button class="btn btn-brand btn-sm" :disabled="game.current >= game.max">
                {{ game.current >= game.max ? '已額滿' : '我要報名' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
