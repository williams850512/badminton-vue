<script setup>
/**
 * 管理員登入頁面
 * - 呼叫 adminApi.login() 進行登入
 * - 登入成功後跳轉到會員管理頁
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminApi } from '@/api/admin'

const router = useRouter()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

// 進入登入頁時清除舊的 Token（等同於登出）
localStorage.removeItem('adminToken')
localStorage.removeItem('adminInfo')

async function handleLogin() {
  // 前端驗證
  if (!username.value.trim() || !password.value.trim()) {
    errorMsg.value = '請輸入帳號和密碼'
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    const res = await adminApi.login(username.value.trim(), password.value)
    // 儲存 JWT Token 和管理員資訊到 localStorage
    localStorage.setItem('adminToken', res.token)
    localStorage.setItem('adminInfo', JSON.stringify(res.admin))
    router.push('/admin/members')
  } catch (err) {
    if (err.response?.status === 401) {
      errorMsg.value = '帳號或密碼錯誤，請重新輸入'
    } else {
      errorMsg.value = '無法連線到伺服器，請確認後端是否已啟動'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- 背景裝飾 -->
    <div class="login-bg">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <div class="login-container">
      <!-- 左側品牌區 -->
      <div class="login-brand">
        <div class="brand-content">
          <div class="brand-icon-lg">
            <i class="bi bi-feather"></i>
          </div>
          <h1 class="brand-title">羽過天晴</h1>
          <p class="brand-subtitle">羽球場地預約管理系統</p>
          <div class="brand-features">
            <div class="feature-item">
              <i class="bi bi-shield-check"></i>
              <span>安全的管理介面</span>
            </div>
            <div class="feature-item">
              <i class="bi bi-speedometer2"></i>
              <span>即時數據監控</span>
            </div>
            <div class="feature-item">
              <i class="bi bi-people"></i>
              <span>完整會員管理</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右側登入表單 -->
      <div class="login-form-area">
        <div class="login-form-wrapper">
          <div class="form-header">
            <h2>管理員登入</h2>
            <p>請輸入您的帳號密碼以進入管理後台</p>
          </div>

          <!-- 錯誤提示 -->
          <div v-if="errorMsg" class="alert-error">
            <i class="bi bi-exclamation-circle"></i>
            <span>{{ errorMsg }}</span>
          </div>

          <form @submit.prevent="handleLogin">
            <!-- 帳號 -->
            <div class="form-group">
              <label for="login-username">
                <i class="bi bi-person"></i> 帳號
              </label>
              <div class="input-wrapper">
                <input
                  id="login-username"
                  v-model="username"
                  type="text"
                  placeholder="請輸入管理員帳號"
                  autocomplete="username"
                  :disabled="isLoading"
                  @keydown.enter="$refs.pwdInput?.focus()"
                />
              </div>
            </div>

            <!-- 密碼 -->
            <div class="form-group">
              <label for="login-password">
                <i class="bi bi-lock"></i> 密碼
              </label>
              <div class="input-wrapper">
                <input
                  id="login-password"
                  ref="pwdInput"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="請輸入密碼"
                  autocomplete="current-password"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  class="toggle-pwd"
                  @click="showPassword = !showPassword"
                  tabindex="-1"
                >
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>

            <!-- 登入按鈕 -->
            <button type="submit" class="btn-login" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>
                <i class="bi bi-box-arrow-in-right me-1"></i>
                登入
              </span>
            </button>
          </form>

          <!-- 底部連結 -->
          <div class="form-footer">
            <RouterLink to="/" class="back-link">
              <i class="bi bi-arrow-left"></i> 回到前台首頁
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================
   登入頁面 — 全屏佈局
   ============================================ */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F0F9FF 0%, #F8FAFC 50%, #F0FDFA 100%);
  position: relative;
  overflow: hidden;
  padding: 1rem;
}

/* ----- 背景裝飾圓球 ----- */
.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
}

.bg-circle-1 {
  width: 600px;
  height: 600px;
  background: var(--brand-sky);
  top: -200px;
  right: -150px;
  animation: float1 20s ease-in-out infinite;
}

.bg-circle-2 {
  width: 400px;
  height: 400px;
  background: var(--brand-teal);
  bottom: -100px;
  left: -100px;
  animation: float2 25s ease-in-out infinite;
}

.bg-circle-3 {
  width: 250px;
  height: 250px;
  background: var(--brand-sky);
  top: 50%;
  left: 50%;
  animation: float3 18s ease-in-out infinite;
}

@keyframes float1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-40px, 30px) scale(1.05); }
}
@keyframes float2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -40px) scale(1.08); }
}
@keyframes float3 {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.15); }
}

/* ----- 登入容器 ----- */
.login-container {
  display: flex;
  width: 100%;
  max-width: 960px;
  min-height: 580px;
  border-radius: 1.75rem;
  overflow: hidden;
  box-shadow:
    0 25px 60px rgba(14, 165, 233, 0.08),
    0 4px 20px rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 1;
}

/* ----- 左側品牌區 ----- */
.login-brand {
  flex: 1;
  background: linear-gradient(160deg, #0EA5E9, #0D9488);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  position: relative;
  overflow: hidden;
}

.login-brand::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  top: -80px;
  right: -80px;
}

.login-brand::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  bottom: -40px;
  left: -40px;
}

.brand-content {
  text-align: center;
  color: white;
  position: relative;
  z-index: 1;
}

.brand-icon-lg {
  width: 80px;
  height: 80px;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.brand-title {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
}

.brand-subtitle {
  font-size: 0.95rem;
  opacity: 0.85;
  margin-bottom: 2.5rem;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1.25rem;
  border-radius: 1rem;
  backdrop-filter: blur(5px);
}

.feature-item i {
  font-size: 1rem;
}

/* ----- 右側表單區 ----- */
.login-form-area {
  flex: 1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.login-form-wrapper {
  width: 100%;
  max-width: 360px;
}

.form-header {
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--brand-dark);
  margin-bottom: 0.35rem;
}

.form-header p {
  font-size: 0.9rem;
  color: #94A3B8;
}

/* ----- 錯誤提示 ----- */
.alert-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: #FEF2F2;
  color: #EF4444;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  border: 1px solid #FEE2E2;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

/* ----- 表單欄位 ----- */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.4rem;
}

.form-group label i {
  font-size: 0.9rem;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  color: var(--brand-dark);
  background: #F8FAFC;
  transition: all 0.2s ease;
  outline: none;
}

.input-wrapper input::placeholder {
  color: #CBD5E1;
}

.input-wrapper input:focus {
  border-color: var(--brand-sky);
  background: white;
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.08);
}

.input-wrapper input:disabled {
  opacity: 0.6;
}

.toggle-pwd {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: #94A3B8;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.toggle-pwd:hover {
  color: var(--brand-sky);
}

/* ----- 登入按鈕 ----- */
.btn-login {
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--brand-sky), var(--brand-teal));
  color: white;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  position: relative;
  overflow: hidden;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(14, 165, 233, 0.3);
}

.btn-login:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ----- Loading Spinner ----- */
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ----- 底部連結 ----- */
.form-footer {
  text-align: center;
  margin-top: 2rem;
}

.back-link {
  color: #94A3B8;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--brand-sky);
}

/* ----- 響應式 ----- */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    max-width: 420px;
    min-height: auto;
  }

  .login-brand {
    padding: 2rem;
    min-height: auto;
  }

  .brand-icon-lg {
    width: 56px;
    height: 56px;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .brand-title {
    font-size: 1.75rem;
  }

  .brand-features {
    display: none;
  }

  .login-form-area {
    padding: 2rem;
  }
}
</style>
