<script setup>
/**
 * 首頁 — 場館環境介紹
 * 大圖展示場館環境 + 3~4 個設施特色圖文並列
 */
const features = [
  {
    icon: 'bi-trophy',
    title: '專業比賽場地',
    desc: '符合國際標準的 PU 地板，提供最佳打球體驗',
  },
  {
    icon: 'bi-snow2',
    title: '全場冷氣開放',
    desc: '恆溫空調系統，夏天也能舒適暢打',
  },
  {
    icon: 'bi-p-circle',
    title: '免費停車場',
    desc: '地下停車場提供 50 個免費車位',
  },
  {
    icon: 'bi-droplet',
    title: '淋浴更衣室',
    desc: '獨立淋浴間與置物櫃，打完球清爽回家',
  },
]
</script>

<template>
  <section class="mb-5">
    <h2 class="section-title">場館環境</h2>

    <div class="row g-4 align-items-center">
      <!-- 左側：大圖 -->
      <div class="col-lg-6">
        <div class="card-rounded-lg shadow-sm overflow-hidden img-zoom">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop"
            alt="場館環境"
            class="w-100"
            style="height: 400px; object-fit: cover;"
          />
        </div>
      </div>

      <!-- 右側：設施特色 -->
      <div class="col-lg-6">
        <div class="row g-3">
          <div v-for="feature in features" :key="feature.title" class="col-6">
            <div class="card card-rounded shadow-sm border-0 p-4 h-100 hover-lift text-center">
              <div class="quick-action-icon mx-auto mb-3">
                <i :class="['bi', feature.icon]" style="font-size: 1.25rem;"></i>
              </div>
              <h6 class="fw-bold mb-2" style="font-size: 0.9rem;">{{ feature.title }}</h6>
              <p class="text-secondary mb-0" style="font-size: 0.75rem; line-height: 1.5;">{{ feature.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
