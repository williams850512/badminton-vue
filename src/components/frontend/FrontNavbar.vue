<script setup>
/**
 * 前台導覽列
 * - 左側：品牌名「羽過天晴」（漸層文字）
 * - 中間：預約球場 / 臨打揪團與報名 / 天晴商城 / 最新公告
 * - 右側：
 *   - 未登入 → 登入按鈕
 *   - 已登入 → 通知鈴鐺 + 頭像 + 名字 + 下拉選單（會員中心 / 登出）
 */
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

// TODO: 之後接入真實登入狀態 (Pinia store)
const isLoggedIn = ref(false)
const memberName = ref('陳大文')
const memberAvatar = ref('https://i.pravatar.cc/100?img=12')

// 模擬登入切換（開發用）
const toggleLogin = () => {
  isLoggedIn.value = !isLoggedIn.value
}
</script>

<template>
  <nav class="navbar navbar-expand-lg front-navbar sticky-top">
    <div class="container">
      <!-- 品牌名稱 -->
      <RouterLink to="/" class="navbar-brand text-gradient">
        <i class="bi bi-feather me-2"></i>羽過天晴
      </RouterLink>

      <!-- 漢堡選單按鈕 (RWD) -->
      <button
        class="navbar-toggler border-0"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarMain"
        aria-controls="navbarMain"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <i class="bi bi-list fs-4"></i>
      </button>

      <!-- 導覽連結 -->
      <div class="collapse navbar-collapse" id="navbarMain">
        <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink to="/booking" class="nav-link">預約球場</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/pickup" class="nav-link">臨打揪團與報名</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/products" class="nav-link">天晴商城</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/announcements" class="nav-link">最新公告</RouterLink>
          </li>
        </ul>

        <!-- 右側區塊 -->
        <div class="d-flex align-items-center gap-3">
          <!-- 未登入：顯示登入按鈕 -->
          <template v-if="!isLoggedIn">
            <RouterLink to="/login" class="btn btn-brand btn-sm">
              <i class="bi bi-box-arrow-in-right me-1"></i>登入
            </RouterLink>
          </template>

          <!-- 已登入：通知 + 頭像下拉選單 -->
          <template v-else>
            <!-- 通知鈴鐺 -->
            <button class="btn btn-link text-secondary position-relative p-1" type="button">
              <i class="bi bi-bell fs-5"></i>
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.55rem;">
                3
              </span>
            </button>

            <!-- 會員頭像 + 名字 + 下拉選單 -->
            <div class="dropdown">
              <button
                class="btn btn-link text-decoration-none d-flex align-items-center gap-2 p-0 dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img :src="memberAvatar" :alt="memberName" class="avatar-sm" />
                <span class="text-dark fw-semibold d-none d-md-inline" style="font-size: 0.875rem;">
                  {{ memberName }}
                </span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
                <li>
                  <RouterLink to="/profile" class="dropdown-item py-2">
                    <i class="bi bi-person-circle me-2"></i>會員中心
                  </RouterLink>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button class="dropdown-item py-2 text-danger" @click="toggleLogin">
                    <i class="bi bi-box-arrow-right me-2"></i>登出
                  </button>
                </li>
              </ul>
            </div>
          </template>

          <!-- 開發用：切換登入狀態 -->
          <button
            class="btn btn-sm btn-outline-secondary ms-2 d-none d-lg-block"
            @click="toggleLogin"
            style="font-size: 0.7rem;"
            :title="isLoggedIn ? '點擊模擬登出' : '點擊模擬登入'"
          >
            {{ isLoggedIn ? '🔓 DEV:登出' : '🔒 DEV:登入' }}
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.dropdown-toggle::after {
  margin-left: 0.25rem;
  font-size: 0.65rem;
}

.dropdown-menu {
  border-radius: 1rem;
  padding: 0.5rem;
  min-width: 180px;
}

.dropdown-item {
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.dropdown-item:active {
  background-color: var(--brand-teal);
}
</style>
