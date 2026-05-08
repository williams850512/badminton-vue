<script setup>
/**
 * 前台會員忘記密碼 / 重設密碼頁
 * 流程：輸入帳號 + Email + 生日 → 驗證通過 → 設定新密碼 → 完成
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { memberApi } from '@/api/member'

const router = useRouter()

// 步驟：1=身份驗證, 2=設定新密碼, 3=完成
const step = ref(1)
const isLoading = ref(false)
const errorMsg = ref('')

const username = ref('')
const email = ref('')
const birthday = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

// Step 1 → Step 2：驗證完成後直接跳到設定密碼
// 由於後端 API 是一次完成（驗證 + 改密碼），前端分兩步做 UX 會更好
// 但為了安全性，我們在 Step 2 提交時才一次打 API

async function handleSubmit() {
  errorMsg.value = ''

  if (!newPassword.value || !confirmPassword.value) {
    errorMsg.value = '請輸入新密碼'
    return
  }
  if (newPassword.value.length < 6) {
    errorMsg.value = '新密碼至少需要 6 個字元'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = '兩次密碼輸入不一致'
    return
  }

  isLoading.value = true

  try {
    await memberApi.resetPassword({
      username: username.value.trim(),
      email: email.value.trim(),
      birthday: birthday.value,
      newPassword: newPassword.value,
    })
    step.value = 3
  } catch (err) {
    const msg = err.response?.data?.message
    errorMsg.value = msg || '重設失敗，請檢查輸入內容'
  } finally {
    isLoading.value = false
  }
}

function goToStep2() {
  errorMsg.value = ''
  if (!username.value.trim()) { errorMsg.value = '請輸入帳號'; return }
  if (!email.value.trim()) { errorMsg.value = '請輸入 Email'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { errorMsg.value = 'Email 格式錯誤'; return }
  if (!birthday.value) { errorMsg.value = '請選擇生日'; return }
  step.value = 2
}
</script>

<template>
  <div class="reset-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-5 col-lg-4">

          <div class="reset-card card-rounded shadow-sm p-4">
            <!-- Header -->
            <div class="text-center mb-4">
              <div class="brand-icon-circle mx-auto mb-3">
                <i class="bi" :class="step === 3 ? 'bi-check-lg' : 'bi-key'"></i>
              </div>
              <h2 class="fw-bold text-gradient mb-1">
                {{ step === 3 ? '重設成功' : '忘記密碼' }}
              </h2>
              <p class="text-muted small tracking-wider mb-0">
                {{ step === 1 ? '請驗證您的身份' : step === 2 ? '請設定新密碼' : '密碼已更新' }}
              </p>
            </div>

            <!-- 步驟指示 -->
            <div v-if="step !== 3" class="step-bar mb-4">
              <div class="step-item" :class="{ active: step >= 1 }">1. 驗證身份</div>
              <div class="step-divider"></div>
              <div class="step-item" :class="{ active: step >= 2 }">2. 設定密碼</div>
            </div>

            <!-- Error -->
            <div v-if="errorMsg" class="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <span class="small">{{ errorMsg }}</span>
            </div>

            <!-- Step 1: 身份驗證 -->
            <form v-if="step === 1" @submit.prevent="goToStep2">
              <div class="mb-3">
                <label class="form-label fw-semibold small text-secondary">
                  <i class="bi bi-person me-1"></i>帳號
                </label>
                <input v-model="username" type="text" class="form-control rounded-3"
                       placeholder="請輸入您的帳號" autocomplete="off" autofocus />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold small text-secondary">
                  <i class="bi bi-envelope me-1"></i>電子信箱
                </label>
                <input v-model="email" type="email" class="form-control rounded-3"
                       placeholder="請輸入註冊時的 Email" />
              </div>
              <div class="mb-4">
                <label class="form-label fw-semibold small text-secondary">
                  <i class="bi bi-calendar-event me-1"></i>生日
                </label>
                <input v-model="birthday" type="date" class="form-control rounded-3" />
              </div>
              <button type="submit" class="btn btn-brand w-100 py-3 fw-bold">
                <i class="bi bi-arrow-right me-2"></i>下一步
              </button>
            </form>

            <!-- Step 2: 設定新密碼 -->
            <form v-if="step === 2" @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label fw-semibold small text-secondary">
                  <i class="bi bi-lock me-1"></i>新密碼
                </label>
                <div class="position-relative">
                  <input v-model="newPassword" :type="showPassword ? 'text' : 'password'"
                         class="form-control rounded-3" placeholder="請輸入新密碼（至少 6 位）"
                         style="padding-right: 48px;" autofocus />
                  <button type="button"
                          class="btn btn-link position-absolute end-0 top-50 translate-middle-y text-secondary pe-3"
                          @click="showPassword = !showPassword" tabindex="-1">
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>
              <div class="mb-4">
                <label class="form-label fw-semibold small text-secondary">
                  <i class="bi bi-lock-fill me-1"></i>確認新密碼
                </label>
                <input v-model="confirmPassword" type="password" class="form-control rounded-3"
                       placeholder="請再次輸入新密碼" />
              </div>
              <div class="d-flex gap-3">
                <button type="submit" class="btn btn-brand flex-fill py-3 fw-bold" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <span v-if="isLoading">處理中...</span>
                  <span v-else><i class="bi bi-check-lg me-2"></i>確認重設</span>
                </button>
                <button type="button" class="btn btn-outline-secondary flex-fill py-3 fw-bold rounded-3"
                        @click="step = 1; errorMsg = ''">
                  <i class="bi bi-arrow-left me-2"></i>上一步
                </button>
              </div>
            </form>

            <!-- Step 3: 完成 -->
            <div v-if="step === 3" class="text-center">
              <div class="success-icon mx-auto mb-3">
                <i class="bi bi-check-circle-fill"></i>
              </div>
              <p class="text-muted mb-4">您的密碼已重設成功，請使用新密碼登入。</p>
              <RouterLink to="/login" class="btn btn-brand w-100 py-3 fw-bold">
                <i class="bi bi-box-arrow-in-right me-2"></i>前往登入
              </RouterLink>
            </div>

            <!-- Footer -->
            <div class="text-center mt-4 pt-3 border-top">
              <RouterLink to="/login" class="text-muted small text-decoration-none">
                <i class="bi bi-arrow-left me-1"></i>返回登入頁
              </RouterLink>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset-page {
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
}

.reset-card {
  background: white;
  animation: fadeUp 0.4s ease;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.brand-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 1rem;
  background: linear-gradient(135deg, var(--brand-sky), var(--brand-teal));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

/* 步驟指示 */
.step-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.step-item {
  font-size: 0.75rem;
  font-weight: 700;
  color: #CBD5E1;
  transition: color 0.3s;
}

.step-item.active {
  color: var(--brand-teal);
}

.step-divider {
  width: 2rem;
  height: 2px;
  background: #E2E8F0;
  border-radius: 1px;
}

.form-control:focus {
  border-color: var(--brand-teal);
  box-shadow: 0 0 0 0.2rem rgba(0, 180, 180, 0.15);
}

.alert-danger {
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

.success-icon {
  font-size: 3rem;
  color: #22C55E;
}
</style>
