<script setup>
import { ref, onMounted, computed } from 'vue'
import * as bootstrap from 'bootstrap'
import axios from 'axios'
import Swal from 'sweetalert2'

const emit = defineEmits(['refresh-list'])

// ============================
// 📋 響應式資料
// ============================
const myBookings = ref([])          // 自己的預約清單
const selectedBookingId = ref('')   // 選中的預約 ID
const skillLevel = ref('ALL')
const maxPlayers = ref(6)
const description = ref('')
const isSubmitting = ref(false)

// 從 localStorage 取得登入者資訊
const getMemberId = () => {
  const info = JSON.parse(localStorage.getItem('memberInfo') || '{}')
  return info.memberId || null
}

// ============================
// 🔌 API：取得自己未來的預約
// ============================
const fetchMyBookings = async () => {
  try {
    const res = await axios.get('/api/bookings/my-bookings')
    myBookings.value = res.data
  } catch (err) {
    console.error('取得預約清單失敗', err)
  }
}

// 選中的預約物件（方便取值）
const selectedBooking = computed(() => {
  if (!selectedBookingId.value) return null
  return myBookings.value.find(b => b.bookingId === Number(selectedBookingId.value))
})

// ============================
// 🔘 Modal 控制
// ============================
const modalRef = ref(null)
let modalInstance = null

onMounted(() => {
  modalInstance = new bootstrap.Modal(modalRef.value)
})

const showModal = () => {
  // 每次打開都重新抓最新的預約資料
  fetchMyBookings()
  selectedBookingId.value = ''
  skillLevel.value = 'ALL'
  maxPlayers.value = 6
  description.value = ''
  modalInstance.show()
}
defineExpose({ showModal })

// ============================
// 🚀 送出表單
// ============================
const submitForm = async () => {
  if (!selectedBooking.value) {
    Swal.fire({ icon: 'warning', title: '請先選擇一筆預約', confirmButtonText: '好的' })
    return
  }

  const memberId = getMemberId()
  if (!memberId) {
    Swal.fire({ icon: 'error', title: '請先登入', confirmButtonText: '好的' })
    return
  }

  isSubmitting.value = true
  try {
    const b = selectedBooking.value
    await axios.post('/api/pickup-games', {
      host: { memberId: memberId },
      court: { courtId: b.court.courtId },
      gameDate: b.bookingDate,
      startTime: b.startTime,
      endTime: b.endTime,
      maxPlayers: maxPlayers.value,
      skillLevel: skillLevel.value,
      description: description.value || null,
    })
    
    Swal.fire({
      icon: 'success',
      title: '揪團建立成功！',
      text: '等待球友加入中～',
      confirmButtonText: '太好了',
      confirmButtonColor: '#0ea5e9',
    })
    modalInstance.hide()
    emit('refresh-list')
  } catch (error) {
    console.error('建立揪團失敗', error)
    Swal.fire({
      icon: 'error',
      title: '建立失敗',
      text: error.response?.data?.message || '請檢查資料是否正確',
      confirmButtonText: '我知道了',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="modal fade" ref="modalRef" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg rounded-4">
        
        <div class="modal-header border-bottom-0 bg-light rounded-top-4 pb-2 pt-3 px-4">
          <h5 class="modal-title fw-bold text-dark d-flex align-items-center">
            <i class="bi bi-plus-circle-fill text-sky-blue me-2 fs-4"></i> 發起揪團
          </h5>
          <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body px-4 pt-3 pb-4">
          <form @submit.prevent="submitForm">
            
            <!-- 🌟 從自己的預約中選擇 -->
            <div class="mb-4">
              <label class="form-label fw-bold text-secondary small mb-1">選擇已預約的場地</label>
              <div class="input-group">
                <span class="input-group-text bg-white text-muted border-end-0"><i class="bi bi-bookmark-check"></i></span>
                <select class="form-select border-start-0 ps-0 shadow-none" v-model="selectedBookingId" required>
                  <option value="" disabled>請選擇一筆預約...</option>
                  <option v-for="b in myBookings" :key="b.bookingId" :value="b.bookingId">
                    {{ b.bookingDate }} {{ b.startTime }}-{{ b.endTime }} ｜ {{ b.court?.venue?.venueName }} - {{ b.court?.courtName }}
                  </option>
                </select>
              </div>
              <div v-if="myBookings.length === 0" class="text-muted small mt-2">
                <i class="bi bi-info-circle me-1"></i>目前沒有可用的預約，請先<RouterLink to="/booking" class="text-decoration-none fw-bold">預約場地</RouterLink>
              </div>
            </div>

            <!-- 自動帶入的預約資訊預覽 -->
            <div v-if="selectedBooking" class="booking-preview mb-4 p-3 rounded-3">
              <div class="d-flex align-items-center mb-2">
                <i class="bi bi-geo-alt-fill text-sky-blue me-2"></i>
                <span class="fw-bold">{{ selectedBooking.court?.venue?.venueName }} - {{ selectedBooking.court?.courtName }}</span>
              </div>
              <div class="d-flex gap-4 text-secondary small">
                <span><i class="bi bi-calendar3 me-1"></i>{{ selectedBooking.bookingDate }}</span>
                <span><i class="bi bi-clock me-1"></i>{{ selectedBooking.startTime }} - {{ selectedBooking.endTime }}</span>
              </div>
            </div>

            <div class="row mb-4">
              <div class="col-6">
                <label class="form-label fw-bold text-secondary small mb-1">程度要求</label>
                <div class="input-group">
                  <span class="input-group-text bg-white text-muted border-end-0"><i class="bi bi-bar-chart"></i></span>
                  <select class="form-select border-start-0 ps-0 shadow-none" v-model="skillLevel">
                    <option value="ALL">不限</option>
                    <option value="BEGINNER">初級</option>
                    <option value="INTERMEDIATE">中級</option>
                    <option value="ADVANCED">高級</option>
                  </select>
                </div>
              </div>
              <div class="col-6">
                <label class="form-label fw-bold text-secondary small mb-1">徵求人數</label>
                <div class="input-group">
                  <span class="input-group-text bg-white text-muted border-end-0"><i class="bi bi-people"></i></span>
                  <select class="form-select border-start-0 ps-0 shadow-none" v-model.number="maxPlayers">
                    <option v-for="n in 11" :key="n" :value="n + 1">{{ n + 1 }} 人</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 備註 -->
            <div class="mb-4">
              <label class="form-label fw-bold text-secondary small mb-1">揪團說明（選填）</label>
              <textarea class="form-control shadow-none" v-model="description" rows="2" 
                        placeholder="例如：歡迎新手、自備羽球、請準時到場" 
                        maxlength="300"></textarea>
            </div>

            <button type="submit" class="btn w-100 rounded-pill fw-bold text-white py-2 shadow-sm btn-sky-blue" :disabled="isSubmitting || !selectedBookingId">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              確認發佈揪團
            </button>
            
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-sky-blue { color: #0ea5e9; }
.btn-sky-blue { background-color: #0ea5e9; border: none; transition: all 0.2s; }
.btn-sky-blue:hover:not(:disabled) { background-color: #0284c7; transform: translateY(-1px); }
.btn-sky-blue:disabled { background-color: #94a3b8; cursor: not-allowed; }
.form-control:focus, .form-select:focus { border-color: #0ea5e9; box-shadow: 0 0 0 0.2rem rgba(14, 165, 233, 0.25); }

.booking-preview {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 1px solid #bae6fd;
}
</style>
