<script setup>
/**
 * 前台頁尾
 * 左側：品牌名（漸層）+ 版權聲明
 * 右側：Privacy Policy / Terms / Contact Us / Membership Rules
 */
</script>

<template>
  <footer class="front-footer">
    <div class="container">
      <div class="row align-items-center gy-4">
        <!-- 左側：品牌 + 版權 -->
        <div class="col-md-6">
          <div class="text-gradient fw-bold fs-5 mb-2">
            <i class="bi bi-feather me-1"></i>羽過天晴羽球館
          </div>
          <p class="text-secondary mb-0" style="font-size: 0.8rem;">
            &copy; 2024 Clear Skies Badminton Club. All rights reserved.
          </p>
        </div>

        <!-- 右側：連結 -->
        <div class="col-md-6">
          <div class="d-flex flex-wrap gap-4 justify-content-md-end" style="font-size: 0.85rem;">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Us</a>
            <a href="#">Membership Rules</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
