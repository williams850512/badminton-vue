<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api/admin'

const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const form = ref({
  username: '',
  fullName: '',
  gender: '',
  birthday: '',
  phone: '',
  email: '',
  password: '' // 用於變更密碼
})

const todayDate = new Date().toISOString().split('T')[0]

async function loadProfile() {
  isLoading.value = true
  try {
    const res = await adminApi.getProfile()
    const d = res.data || res
    form.value = {
      username: d.username || '',
      fullName: d.fullName || '',
      gender: d.gender || '男',
      birthday: d.birthday || '',
      phone: d.phone || '',
      email: d.email || '',
      password: '' // 預設留空
    }
  } catch (e) {
    errorMsg.value = '無法載入個人資料：' + (e.response?.data || e.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadProfile()
})

function formatPhone() {
  let v = form.value.phone.replace(/\D/g, '')
  if (v.length > 10) v = v.substring(0, 10)
  let f = ''
  if (v.length > 0) f = v.substring(0, 4)
  if (v.length > 4) f += '-' + v.substring(4, 7)
  if (v.length > 7) f += '-' + v.substring(7, 10)
  form.value.phone = f
}

async function handleSave() {
  const d = { ...form.value }
  
  if (!d.fullName || !d.gender || !d.birthday || !d.phone || !d.email) {
    errorMsg.value = '請填寫所有必填欄位'
    successMsg.value = ''
    return
  }
  if (d.birthday > todayDate) {
    errorMsg.value = '生日不可為未來的日期'
    successMsg.value = ''
    return
  }
  const phoneDigits = d.phone.replace(/\D/g, '')
  if (phoneDigits.length !== 10 || !phoneDigits.startsWith('09')) {
    errorMsg.value = '電話格式錯誤！必須為 09 開頭的 10 位數字'
    successMsg.value = ''
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
    errorMsg.value = 'Email 格式錯誤'
    successMsg.value = ''
    return
  }

  // 如果密碼留空，代表不修改
  if (!d.password) {
    delete d.password
  }

  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const res = await adminApi.updateProfile(d)
    successMsg.value = '個人資料更新成功！'
    // 更新 localStorage 裡的 adminInfo 名字
    const info = JSON.parse(localStorage.getItem('adminInfo') || '{}')
    info.fullName = d.fullName
    localStorage.setItem('adminInfo', JSON.stringify(info))
    
    form.value.password = '' // 清空密碼欄位
  } catch (e) {
    errorMsg.value = '更新失敗：' + (e.response?.data || e.message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="admin-profile">
    <div class="page-header">
      <h2><i class="bi bi-person-circle"></i> 個人中心</h2>
    </div>

    <div class="profile-card">
      <div v-if="isLoading && !form.username" class="loading-state">
        <div class="spinner"></div>
        <span>載入中...</span>
      </div>

      <div v-else class="form-container">
        <!-- 狀態訊息 -->
        <div v-if="errorMsg" class="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span class="small">{{ errorMsg }}</span>
        </div>
        <div v-if="successMsg" class="alert alert-success d-flex align-items-center gap-2 mb-4">
          <i class="bi bi-check-circle-fill"></i>
          <span class="small">{{ successMsg }}</span>
        </div>

        <form @submit.prevent="handleSave">
          <div class="row mb-4">
            <div class="col-md-6 mb-3 mb-md-0">
              <label class="form-label fw-bold text-secondary small">
                <i class="bi bi-person me-1"></i>登入帳號 <span class="text-muted fw-normal">(不可修改)</span>
              </label>
              <input type="text" class="form-control form-control-lg bg-light" :value="form.username" disabled />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold text-secondary small">
                <i class="bi bi-lock me-1"></i>變更密碼 <span class="text-muted fw-normal">(若不修改請留空)</span>
              </label>
              <input v-model="form.password" type="password" class="form-control form-control-lg" placeholder="請輸入新密碼" autocomplete="new-password" />
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-md-6 mb-3 mb-md-0">
              <label class="form-label fw-bold text-secondary small">
                <i class="bi bi-person-vcard me-1"></i>真實姓名 <span class="text-danger">*</span>
              </label>
              <input v-model="form.fullName" type="text" class="form-control form-control-lg" placeholder="請輸入姓名" required />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold text-secondary small">
                <i class="bi bi-gender-ambiguous me-1"></i>性別 <span class="text-danger">*</span>
              </label>
              <div class="d-flex gap-4 pt-2">
                <label class="form-check-label d-flex align-items-center gap-2">
                  <input v-model="form.gender" type="radio" value="男" class="form-check-input" /> 男
                </label>
                <label class="form-check-label d-flex align-items-center gap-2">
                  <input v-model="form.gender" type="radio" value="女" class="form-check-input" /> 女
                </label>
              </div>
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-md-4 mb-3 mb-md-0">
              <label class="form-label fw-bold text-secondary small">
                <i class="bi bi-calendar-event me-1"></i>生日 <span class="text-danger">*</span>
              </label>
              <input v-model="form.birthday" type="date" class="form-control form-control-lg" :max="todayDate" required />
            </div>
            <div class="col-md-4 mb-3 mb-md-0">
              <label class="form-label fw-bold text-secondary small">
                <i class="bi bi-telephone me-1"></i>聯絡電話 <span class="text-danger">*</span>
              </label>
              <input v-model="form.phone" type="text" class="form-control form-control-lg" placeholder="09xx-xxx-xxx" maxlength="12" @input="formatPhone" required />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold text-secondary small">
                <i class="bi bi-envelope me-1"></i>電子信箱 <span class="text-danger">*</span>
              </label>
              <input v-model="form.email" type="email" class="form-control form-control-lg" placeholder="example@mail.com" required />
            </div>
          </div>

          <hr class="my-4 text-muted" />

          <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-brand px-5 py-2 fw-bold" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              <span v-if="isLoading">儲存中...</span>
              <span v-else><i class="bi bi-save me-2"></i>儲存變更</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.5rem;
}
.page-header h2 {
  margin: 0; font-size: 1.4rem; font-weight: 700; color: var(--brand-dark);
}
.page-header h2 i { margin-right: 0.4rem; }

.profile-card {
  background: white; border-radius: 1rem; padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #F1F5F9;
  max-width: 900px;
}

.loading-state {
  text-align: center; padding: 3rem; color: #94A3B8;
}
.spinner {
  display: inline-block; width: 24px; height: 24px;
  border: 3px solid #E2E8F0; border-top-color: var(--brand-sky);
  border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 0.5rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

.form-control {
  border: 2px solid #E2E8F0;
  border-radius: 0.75rem;
  transition: all 0.2s;
  background-color: #F8FAFC;
}
.form-control:focus {
  border-color: var(--brand-sky);
  background-color: white;
  box-shadow: none;
}
.form-control:disabled {
  opacity: 0.7;
}

.btn-brand {
  background: linear-gradient(135deg, var(--brand-sky), var(--brand-teal));
  color: white;
  border: none;
  border-radius: 0.75rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-brand:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(14,165,233,0.3);
  color: white;
}

.alert {
  border: none;
  border-radius: 0.75rem;
}
.alert-danger {
  background-color: #FEF2F2;
  color: #DC2626;
}
.alert-success {
  background-color: #ECFDF5;
  color: #059669;
}
</style>
