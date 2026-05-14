<script setup>
import { ref, onMounted, computed } from 'vue'
import * as bootstrap from 'bootstrap'
// 🌟 直接引入你寫好的神級 API
import { usePickupGameApi } from '@/composables/usePickupGameApi'
const emit = defineEmits(['refresh-list'])

// 判斷主揪性別 (防止男生開純女團)
const memberInfo = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('memberInfo')) || {}
  } catch {
    return {}
  }
})
const isHostMale = computed(() => memberInfo.value.gender === 'MALE' || memberInfo.value.gender === '男')

// 🌟 把需要用到的東西解構出來 (formData 直接用 API 裡的 newGame)
const { newGame, courts, fetchCourts, createPickupGame } = usePickupGameApi()
const minDate = new Date().toISOString().split('T')[0]
// 產生時間選單 (06:00 ~ 23:00)
const timeOptions = Array.from({ length: 18 }, (_, i) => {
  const hour = (i + 6).toString().padStart(2, '0')
  return `${hour}:00`
})
// 邏輯驗證：結束時間必須晚於開始時間
const isValidTime = computed(() => {
  if (!newGame.value.startTime || !newGame.value.endTime) return false
  const start = parseInt(newGame.value.startTime.replace(':', ''))
  const end = parseInt(newGame.value.endTime.replace(':', ''))
  return end > start
})
const modalRef = ref(null)
let modalInstance = null
onMounted(() => {
  fetchCourts()
  modalInstance = new bootstrap.Modal(modalRef.value)

  // 幫 newGame 塞入前台預設值
  newGame.value.gameDate = minDate
  newGame.value.startTime = '19:00'
  newGame.value.endTime = '21:00'
  newGame.value.maxPlayers = 6
  newGame.value.skillLevel = 'ALL'
  newGame.value.requiredGender = 'ALL'
})
const showModal = () => modalInstance.show()
defineExpose({ showModal })
// 送出表單
const submitForm = async () => {
  // 🌟 核心差異：前台自己發起揪團，所以把登入者 ID 偷偷塞進去
  newGame.value.host.memberId = memberInfo.value.memberId || 1
  // 直接呼叫後台寫好的新增邏輯！
  await createPickupGame()

  modalInstance.hide()
  emit('refresh-list')
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

            <div class="mb-4">
              <label class="form-label fw-bold text-secondary small mb-1">打球地點</label>
              <div class="input-group">
                <span class="input-group-text bg-white text-muted border-end-0"><i class="bi bi-geo-alt"></i></span>
                <select class="form-select border-start-0 ps-0 shadow-none" v-model="newGame.court.courtId" required>
                  <option value="" disabled>請選擇場館與場地...</option>
                  <option v-for="court in courts" :key="court.courtId" :value="court.courtId">
                    {{ court.venue.venueName }} - {{ court.courtName }}
                  </option>
                </select>
              </div>
            </div>
            <div class="mb-4">
              <label class="form-label fw-bold text-secondary small mb-1">揪團日期</label>
              <div class="input-group">
                <span class="input-group-text bg-white text-muted border-end-0"><i class="bi bi-calendar-event"></i></span>
                <input type="date" class="form-control border-start-0 ps-0 shadow-none" v-model="newGame.gameDate" :min="minDate" required>
              </div>
            </div>
            <div class="row mb-4">
              <div class="col-6">
                <label class="form-label fw-bold text-secondary small mb-1">開始時間</label>
                <select class="form-select shadow-none" v-model="newGame.startTime">
                  <option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div class="col-6">
                <label class="form-label fw-bold text-secondary small mb-1">結束時間</label>
                <select class="form-select shadow-none" v-model="newGame.endTime" :class="{'is-invalid': !isValidTime}">
                  <option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</option>
                </select>
                <div class="invalid-feedback fw-bold" style="font-size: 0.75rem;">結束需晚於開始</div>
              </div>
            </div>
            <div class="row mb-4">
              <div class="col-6">
                <label class="form-label fw-bold text-secondary small mb-1">程度要求</label>
                <div class="input-group">
                  <span class="input-group-text bg-white text-muted border-end-0"><i class="bi bi-bar-chart"></i></span>
                  <select class="form-select border-start-0 ps-0 shadow-none" v-model="newGame.skillLevel">
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
                  <select class="form-select border-start-0 ps-0 shadow-none" v-model.number="newGame.maxPlayers">
                    <option v-for="n in 11" :key="n" :value="n + 1">{{ n + 1 }} 人</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- 🌟 性別限制 (防呆檢查) -->
            <div class="mb-4">
              <label class="form-label fw-bold text-secondary small mb-1">性別限制</label>
              <div class="input-group">
                <span class="input-group-text bg-white text-muted border-end-0"><i class="bi bi-gender-ambiguous"></i></span>
                <select class="form-select border-start-0 ps-0 shadow-none" v-model="newGame.requiredGender">
                  <option value="ALL">不限男女</option>
                  <option value="MALE">限男性</option>
                  <option value="FEMALE" :disabled="isHostMale">
                    限女性 {{ isHostMale ? '(您為男性，無法發起純女團)' : '' }}
                  </option>
                </select>
              </div>
            </div>

            <button type="submit" class="btn w-100 rounded-pill fw-bold text-white py-2 shadow-sm btn-sky-blue" :disabled="!isValidTime">
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
.btn-sky-blue:hover { background-color: #0284c7; transform: translateY(-1px); }
.form-control:focus, .form-select:focus { border-color: #0ea5e9; box-shadow: 0 0 0 0.2rem rgba(14, 165, 233, 0.25); }
</style>
