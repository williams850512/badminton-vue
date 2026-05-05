<script setup>
/**
 * 首頁 — 熱賣商品
 * 4 張商品 Card（商品圖 + 名稱 + 價格 + 加入購物車按鈕）
 */
import { ref } from 'vue'

const products = ref([
  {
    id: 1,
    name: 'Yonex ASTROX 88D PRO',
    category: '球拍',
    price: 6800,
    originalPrice: 7500,
    image: 'https://images.unsplash.com/photo-1617883861744-13b534e1a5eb?q=80&w=400&auto=format&fit=crop',
    badge: '熱銷',
  },
  {
    id: 2,
    name: 'Victor 羽球鞋 A950',
    category: '球鞋',
    price: 3200,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop',
    badge: null,
  },
  {
    id: 3,
    name: 'Li-Ning 羽球 A+600',
    category: '羽球',
    price: 450,
    originalPrice: 580,
    image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=400&auto=format&fit=crop',
    badge: '特價',
  },
  {
    id: 4,
    name: '運動毛巾吸汗組',
    category: '配件',
    price: 280,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop',
    badge: '新品',
  },
])

const formatPrice = (price) => {
  return `NT$ ${price.toLocaleString()}`
}
</script>

<template>
  <section class="mb-5">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h2 class="section-title mb-0">熱賣商品</h2>
      <RouterLink to="/products" class="text-decoration-none fw-bold" style="color: var(--brand-sky); font-size: 0.875rem;">
        逛逛商城 <i class="bi bi-arrow-right"></i>
      </RouterLink>
    </div>

    <div class="row g-4">
      <div v-for="product in products" :key="product.id" class="col-6 col-lg-3">
        <div class="card card-rounded shadow-sm border-0 h-100 hover-lift overflow-hidden">
          <!-- 商品圖片 -->
          <div class="position-relative img-zoom" style="height: 200px;">
            <img :src="product.image" :alt="product.name" class="card-img-top w-100 h-100" style="object-fit: cover;" />
            <!-- 標籤 Badge -->
            <span
              v-if="product.badge"
              class="position-absolute top-0 start-0 m-3 badge rounded-pill"
              :class="{
                'bg-danger': product.badge === '熱銷',
                'bg-warning text-dark': product.badge === '特價',
                'bg-info': product.badge === '新品',
              }"
              style="font-size: 0.7rem;"
            >
              {{ product.badge }}
            </span>
          </div>

          <div class="card-body p-3 d-flex flex-column">
            <!-- 分類 -->
            <small class="text-secondary tracking-wider mb-1" style="font-size: 0.7rem;">{{ product.category }}</small>

            <!-- 名稱 -->
            <h6 class="card-title fw-bold mb-2 line-clamp-2" style="font-size: 0.9rem;">{{ product.name }}</h6>

            <!-- 價格 -->
            <div class="mt-auto d-flex align-items-center gap-2 mb-3">
              <span class="fw-bold" style="color: var(--brand-teal); font-size: 1.1rem;">{{ formatPrice(product.price) }}</span>
              <span v-if="product.originalPrice" class="text-decoration-line-through text-secondary" style="font-size: 0.8rem;">
                {{ formatPrice(product.originalPrice) }}
              </span>
            </div>

            <!-- 加入購物車 -->
            <button class="btn btn-brand btn-sm w-100">
              <i class="bi bi-cart-plus me-1"></i>加入購物車
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
