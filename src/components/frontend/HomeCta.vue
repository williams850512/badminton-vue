<script setup>
/**
 * 首頁 — CTA 加入會員
 * 全幅漸層背景 + 「立即加入」按鈕，吸引訪客註冊
 */
</script>

<template>
  <section class="mb-5">
    <div class="card-gradient p-5 text-center">
      <div class="position-relative" style="z-index: 2;">
        <i class="bi bi-people-fill d-block mb-3" style="font-size: 2.5rem; opacity: 0.9;"></i>
        <h2 class="fw-bold mb-3 display-6">加入羽過天晴大家庭</h2>
        <p class="mb-4 mx-auto" style="max-width: 500px; color: rgba(240, 249, 255, 0.8); line-height: 1.7;">
          成為會員即可享受場地預約、揪團配對、商城優惠等專屬服務。<br />
          現在註冊，開啟你的羽球新生活！
        </p>
        <div class="d-flex gap-3 justify-content-center flex-wrap">
          <RouterLink to="/login" class="btn btn-light fw-bold px-5 py-3" style="border-radius: 1rem; color: var(--brand-teal-dark);">
            <i class="bi bi-person-plus me-2"></i>免費註冊
          </RouterLink>
          <RouterLink to="/booking" class="btn btn-outline-light fw-bold px-5 py-3" style="border-radius: 1rem;">
            <i class="bi bi-calendar-check me-2"></i>先逛逛場地
          </RouterLink>
        </div>
      </div>
      <i class="bi bi-feather card-gradient-icon"></i>
    </div>
  </section>
</template>
