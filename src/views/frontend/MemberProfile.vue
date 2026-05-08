<script setup>
/**
 * 前台會員個人中心
 * 使用 Vue 前台設計系統：Bootstrap + 品牌色彩
 * - 上方：歡迎區 + 帳號 / 等級概覽
 * - 下方：個人資料表單（姓名、性別不可改）
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { memberApi } from '@/api/member'

const router = useRouter()

const member = ref(null)
const isLoading = ref(true)
const isSaving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const form = ref({
  fullName: '',
  gender: '',
  birthday: '',
  phone: '',
  email: '',
})

// 電話格式化
function formatPhone() {
  let v = form.value.phone.replace(/\D/g, '')
  if (v.length > 10) v = v.substring(0, 10)
  let f = ''
  if (v.length > 0) f = v.substring(0, 4)
  if (v.length > 4) f += '-' + v.substring(4, 7)
  if (v.length > 7) f += '-' + v.substring(7, 10)
  form.value.phone = f
}

// 載入個人資料
onMounted(async () => {
  const token = localStorage.getItem('memberToken')
  if (!token) {
    router.replace('/login')
    return
  }

  try {
    const data = await memberApi.getProfile()
    member.value = data
    form.value = {
      fullName: data.fullName || '',
      gender: data.gender || '',
      birthday: data.birthday || '',
      phone: data.phone || '',
      email: data.email || '',
    }
  } catch (err) {
    if (err.response?.status === 401) {
      localStorage.removeItem('memberToken')
      localStorage.removeItem('memberInfo')
      router.replace('/login')
    }
  } finally {
    isLoading.value = false
  }
})

// 儲存變更
async function handleSave() {
  successMsg.value = ''
  errorMsg.value = ''

  const d = form.value
  if (!d.phone || !d.email) {
    errorMsg.value = '電話和 Email 為必填'
    return
  }
  const phoneDigits = d.phone.replace(/\D/g, '')
  if (phoneDigits.length !== 10 || !phoneDigits.startsWith('09')) {
    errorMsg.value = '電話格式錯誤！必須為 09 開頭的 10 位數字'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
    errorMsg.value = 'Email 格式錯誤！'
    return
  }

  isSaving.value = true
  try {
    await memberApi.updateProfile(d)
    successMsg.value = '個人資料已更新成功！'
    // 同步 localStorage
    const info = JSON.parse(localStorage.getItem('memberInfo') || '{}')
    Object.assign(info, d)
    localStorage.setItem('memberInfo', JSON.stringify(info))
  } catch (err) {
    errorMsg.value = '更新失敗，請檢查輸入內容'
  } finally {
    isSaving.value = false
  }
}

// 登出
function handleLogout() {
  localStorage.removeItem('memberToken')
  localStorage.removeItem('memberInfo')
  router.push('/login')
}

function getLevelBadge(level) {
  return level === 'VIP'
    ? { label: 'VIP 會員', cls: 'badge-vip' }
    : { label: '一般會員', cls: 'badge-normal' }
}
</script>

<template>
  <div class="profile-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">

          <!-- Loading -->
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted mt-3">載入中...</p>
          </div>

          <template v-else-if="member">
            <!-- 統一卡片 -->
            <div class="profile-card card-rounded shadow-sm overflow-hidden">
              <!-- 歡迎 Header -->
              <div class="welcome-header p-4 text-white">
                <h3 class="fw-bold mb-1">歡迎回來，{{ member.fullName }}</h3>
                <p class="mb-0 opacity-75 small">您可以在此查看與修改您的帳戶資訊</p>
              </div>

              <!-- 資訊概覽 -->
              <div class="info-grid p-4">
                <div class="info-item">
                  <div class="info-label">帳號 USERNAME</div>
                  <div class="info-value">{{ member.username }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">會員等級 LEVEL</div>
                  <div class="info-value">
                    <span class="level-badge" :class="getLevelBadge(member.membershipLevel).cls">
                      {{ getLevelBadge(member.membershipLevel).label }}
                    </span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">加入日期 SINCE</div>
                  <div class="info-value small">{{ member.createdAt || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">帳號狀態 STATUS</div>
                  <div class="info-value">
                    <span class="status-dot" :class="member.status === 'ACTIVE' ? 'dot-active' : 'dot-inactive'"></span>
                    {{ member.status === 'ACTIVE' ? '正常' : '停權' }}
                  </div>
                </div>
              </div>

              <!-- 修改資料表單 -->
              <div class="form-section p-4 pt-0">
                <h4 class="section-title">修改個人資料</h4>

                <div v-if="successMsg" class="alert alert-success d-flex align-items-center gap-2 py-2 px-3 rounded-3 small">
                  <i class="bi bi-check-circle-fill"></i> {{ successMsg }}
                </div>
                <div v-if="errorMsg" class="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 small">
                  <i class="bi bi-exclamation-triangle-fill"></i> {{ errorMsg }}
                </div>

                <form @submit.prevent="handleSave">
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold small text-secondary">姓名</label>
                      <input v-model="form.fullName" type="text" class="form-control rounded-3" disabled />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold small text-secondary">性別</label>
                      <div class="d-flex gap-3 pt-1">
                        <label class="form-check-label d-flex align-items-center gap-1">
                          <input v-model="form.gender" type="radio" value="男" class="form-check-input" disabled /> 男
                        </label>
                        <label class="form-check-label d-flex align-items-center gap-1">
                          <input v-model="form.gender" type="radio" value="女" class="form-check-input" disabled /> 女
                        </label>
                      </div>
                    </div>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold small text-secondary">生日</label>
                      <input v-model="form.birthday" type="date" class="form-control rounded-3" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold small text-secondary">電話</label>
                      <input v-model="form.phone" type="text" class="form-control rounded-3"
                             placeholder="09xx-xxx-xxx" maxlength="12" @input="formatPhone" />
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label fw-semibold small text-secondary">電子信箱</label>
                    <input v-model="form.email" type="email" class="form-control rounded-3"
                           placeholder="example@mail.com" />
                  </div>

                  <div class="d-flex gap-3">
                    <button type="submit" class="btn btn-brand flex-fill py-3 fw-bold" :disabled="isSaving">
                      <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                      <span v-if="isSaving">儲存中...</span>
                      <span v-else><i class="bi bi-check-lg me-2"></i>儲存變更</span>
                    </button>
                    <RouterLink to="/" class="btn btn-outline-secondary flex-fill py-3 fw-bold rounded-3">
                      <i class="bi bi-arrow-left me-2"></i>返回首頁
                    </RouterLink>
                  </div>
                </form>
              </div>
            </div>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: calc(100vh - 160px);
}

.profile-card {
  background: white;
  animation: fadeUp 0.4s ease;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-header {
  background: linear-gradient(135deg, var(--brand-sky), var(--brand-teal));
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  background: #FCFDFE;
  border-top: 1px solid #F1F5F9;
}

.info-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--brand-dark);
}

.level-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.badge-vip {
  background: #FEF9C3;
  color: #CA8A04;
  border: 1px solid #FDE68A;
}
.badge-normal {
  background: #F1F5F9;
  color: #64748B;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}
.dot-active { background: #22C55E; }
.dot-inactive { background: #EF4444; }

.form-control:focus {
  border-color: var(--brand-teal);
  box-shadow: 0 0 0 0.2rem rgba(0, 180, 180, 0.15);
}

.form-control:disabled {
  background-color: #F8FAFC;
  opacity: 0.6;
}

.form-check-input:disabled {
  opacity: 0.5;
}

.alert-success {
  background-color: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #16A34A;
}

.alert-danger {
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
}

@media (max-width: 576px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
