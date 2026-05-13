<script setup>
import { ref } from 'vue'

const copied = ref(false)

function copyEmail() {
  navigator.clipboard.writeText('ygtq.badminton@gmail.com')
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <footer class="front-footer">
    <div class="container-fluid px-lg-4">
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

        <!-- 右側：客服信箱 -->
        <div class="col-md-6">
          <div class="d-flex justify-content-md-end align-items-center">
            <button class="btn btn-outline-secondary btn-sm rounded-pill px-3" @click="copyEmail">
              <i class="bi me-1" :class="copied ? 'bi-check-lg text-success' : 'bi-envelope'"></i>
              {{ copied ? '已複製！' : '客服信箱' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
