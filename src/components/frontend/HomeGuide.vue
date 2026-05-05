<script setup>
/**
 * 首頁 — 新手指南
 * 3 步驟圖文教學：註冊會員 → 選擇場地時段 → 開始打球！
 */
const steps = [
  {
    number: '01',
    icon: 'bi-person-plus',
    title: '註冊會員',
    desc: '免費註冊帳號，快速完成會員認證，解鎖所有功能',
    color: '#0EA5E9',
    bg: '#F0F9FF',
  },
  {
    number: '02',
    icon: 'bi-calendar2-check',
    title: '選擇場地時段',
    desc: '瀏覽可用場地，挑選合適的日期與時段，輕鬆完成預約',
    color: '#00B4B4',
    bg: '#F0FDFA',
  },
  {
    number: '03',
    icon: 'bi-emoji-laughing',
    title: '開始打球！',
    desc: '準時到場，享受揮拍樂趣，還能揪團認識更多球友',
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
]
</script>

<template>
  <section class="mb-5">
    <div class="text-center mb-5">
      <h2 class="fw-bold mb-2" style="font-size: 1.75rem;">如何開始？</h2>
      <p class="text-secondary">只要三個步驟，馬上開始你的羽球之旅</p>
    </div>

    <div class="row g-4 justify-content-center">
      <div v-for="(step, index) in steps" :key="step.number" class="col-md-4">
        <div class="card card-rounded shadow-sm border-0 p-4 text-center h-100 hover-lift position-relative">
          <!-- 步驟編號 -->
          <div
            class="fw-black mb-3 mx-auto"
            style="font-size: 3rem; line-height: 1; opacity: 0.08;"
          >
            {{ step.number }}
          </div>

          <!-- 圖標 -->
          <div
            class="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            :style="{ width: '64px', height: '64px', backgroundColor: step.bg, color: step.color }"
          >
            <i :class="['bi', step.icon]" style="font-size: 1.5rem;"></i>
          </div>

          <!-- 標題 + 說明 -->
          <h5 class="fw-bold mb-2">{{ step.title }}</h5>
          <p class="text-secondary mb-0" style="font-size: 0.85rem; line-height: 1.6;">{{ step.desc }}</p>

          <!-- 箭頭連接線（非最後一步） -->
          <div
            v-if="index < steps.length - 1"
            class="d-none d-md-block position-absolute"
            style="right: -2rem; top: 50%; transform: translateY(-50%); z-index: 2;"
          >
            <i class="bi bi-arrow-right text-secondary" style="font-size: 1.5rem; opacity: 0.3;"></i>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
