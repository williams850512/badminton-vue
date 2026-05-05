<script setup>
/**
 * 首頁 — 熱門場館
 * 3~4 張場館 Card（場館圖片 + 名稱 + 地址 + 評分星星）
 */
import { ref } from 'vue'

const venues = ref([
  {
    id: 1,
    name: '羽過天晴 A 館',
    address: '台北市信義區信義路五段 7 號',
    courts: 8,
    rating: 4.8,
    reviews: 126,
    image: 'https://images.unsplash.com/photo-1626224580194-ff9601fe0674?q=80&w=600&auto=format&fit=crop',
    tags: ['冷氣開放', '停車場'],
  },
  {
    id: 2,
    name: '羽過天晴 B 館',
    address: '台北市大安區忠孝東路四段 100 號',
    courts: 6,
    rating: 4.6,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=600&auto=format&fit=crop',
    tags: ['新裝潢', 'LED 照明'],
  },
  {
    id: 3,
    name: '羽過天晴 C 館',
    address: '新北市板橋區文化路一段 200 號',
    courts: 10,
    rating: 4.9,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be2?q=80&w=600&auto=format&fit=crop',
    tags: ['比賽場地', '更衣室'],
  },
])

const renderStars = (rating) => {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return { full, half, empty }
}
</script>

<template>
  <section class="mb-5">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h2 class="section-title mb-0">熱門場館</h2>
      <RouterLink to="/booking" class="text-decoration-none fw-bold" style="color: var(--brand-sky); font-size: 0.875rem;">
        查看全部 <i class="bi bi-arrow-right"></i>
      </RouterLink>
    </div>

    <div class="row g-4">
      <div v-for="venue in venues" :key="venue.id" class="col-md-6 col-lg-4">
        <div class="card card-rounded shadow-sm border-0 h-100 hover-lift overflow-hidden">
          <!-- 場館圖片 -->
          <div class="img-zoom" style="height: 200px;">
            <img :src="venue.image" :alt="venue.name" class="card-img-top w-100 h-100" style="object-fit: cover;" />
          </div>

          <div class="card-body p-4">
            <!-- 標籤 -->
            <div class="d-flex gap-2 mb-2">
              <span
                v-for="tag in venue.tags"
                :key="tag"
                class="badge bg-info-subtle text-info"
                style="font-size: 0.65rem; font-weight: 600;"
              >
                {{ tag }}
              </span>
            </div>

            <!-- 名稱 -->
            <h5 class="card-title fw-bold mb-2">{{ venue.name }}</h5>

            <!-- 地址 -->
            <p class="text-secondary mb-2" style="font-size: 0.8rem;">
              <i class="bi bi-geo-alt me-1"></i>{{ venue.address }}
            </p>

            <!-- 場地數 -->
            <p class="text-secondary mb-3" style="font-size: 0.8rem;">
              <i class="bi bi-columns-gap me-1"></i>{{ venue.courts }} 面場地
            </p>

            <!-- 評分 + 預約按鈕 -->
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-1">
                <template v-for="n in renderStars(venue.rating).full" :key="'f'+n">
                  <i class="bi bi-star-fill text-warning" style="font-size: 0.8rem;"></i>
                </template>
                <template v-for="n in renderStars(venue.rating).half" :key="'h'+n">
                  <i class="bi bi-star-half text-warning" style="font-size: 0.8rem;"></i>
                </template>
                <template v-for="n in renderStars(venue.rating).empty" :key="'e'+n">
                  <i class="bi bi-star text-warning" style="font-size: 0.8rem;"></i>
                </template>
                <span class="ms-1 text-secondary" style="font-size: 0.75rem;">({{ venue.reviews }})</span>
              </div>
              <RouterLink to="/booking" class="btn btn-brand btn-sm">預約</RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
