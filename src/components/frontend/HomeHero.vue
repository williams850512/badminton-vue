<script setup>
/**
 * 首頁 Hero Banner
 * 品牌名「羽過天晴」+ 副標語 + CTA 按鈕 + 背景圖
 */
</script>

<template>
  <section class="hero-section mb-5 shadow-lg">
    <img
      src="https://images.unsplash.com/photo-1626224580194-ff9601fe0674?q=80&w=2670&auto=format&fit=crop"
      alt="羽球場地"
      class="hero-bg"
    />
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <span class="badge-glass mb-3">
        <i class="bi bi-star-fill me-1"></i>羽過天晴羽球館
      </span>
      <h1 class="display-4 fw-bold mb-3">揮灑汗水，盡享羽球樂趣</h1>
      <p class="hero-subtitle mb-4">
        專業場地、優質設備、熱情球友，讓每一次揮拍都成為美好回憶。<br />
        立即預約場地，開始你的羽球之旅！
      </p>
      <div class="d-flex gap-3 flex-wrap">
        <RouterLink to="/booking" class="btn btn-brand btn-lg">
          <i class="bi bi-calendar-check me-2"></i>立即預約
        </RouterLink>
        <RouterLink to="/products" class="btn btn-brand-outline btn-lg">
          <i class="bi bi-shop me-2"></i>瀏覽商城
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.badge-glass {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  color: white;
  width: fit-content;
}

.hero-subtitle {
  color: rgba(240, 249, 255, 0.85);
  max-width: 520px;
  line-height: 1.7;
  font-size: 1rem;
}
</style>
