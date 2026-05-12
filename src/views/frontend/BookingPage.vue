<script setup>
import { ref, onMounted, computed } from 'vue'
import { venueApi } from '@/api/venue'
import { courtApi } from '@/api/court'
import { bookingApi } from '@/api/booking'

const currentStep = ref(1) // 目前步驟 (1/2/3)

// 步驟定義
const steps = [
  { number: 1, title: '選擇場館' },
  { number: 2, title: '選擇時段' },
  { number: 3, title: '確認預約' },
]

// === Step 1：場館相關 ===
const venues = ref([])
const selectedVenue = ref(null)

// 場館圖片（後端沒有圖片欄位，先 hardcode）
const venueImages = {
  1: 'https://images.unsplash.com/photo-1626224580194-ff9601fe0674?w=600',
  2: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600',
  3: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be2?w=600',
}

function getVenueImage(venueId) {
  return (
    venueImages[venueId] || 'https://images.unsplash.com/photo-1626224580194-ff9601fe0674?w=600'
  )
}

// 選擇場館 → 前進到 Step 2
function selectVenue(venue) {
  selectedVenue.value = venue
  currentStep.value = 2
}

// === Step 2：球場 + 日期 + 時段 ===
const allCourts = ref([]) // 所有球場資料
const selectedCourt = ref(null) // 選中的球場
const selectedDate = ref('') // 選擇的日期
const bookedSlots = ref([]) // 已被預約的時段（從 API 取得）
const selectedSlots = ref([]) // 使用者選中的時段

// 今天日期（限制日期選擇器不能選過去）
const today = computed(() => new Date().toISOString().slice(0, 10))

// 所有可選時段（10:00 ~ 21:00，每格代表 1 小時）
const timeSlots = [
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
]

// 篩選出「選中場館」底下的 ACTIVE 球場
const filteredCourts = computed(() => {
  if (!selectedVenue.value) return []
  return allCourts.value.filter(
    (c) => c.venue?.venueId === selectedVenue.value.venueId && c.status === 'ACTIVE',
  )
})

// 當球場或日期變更時，查詢該球場該天已被預約的時段
async function loadBookedSlots() {
  // 球場和日期都選了才查
  if (!selectedCourt.value || !selectedDate.value) return

  const bookings = await bookingApi.findByCourtAndDate(
    selectedCourt.value.courtId,
    selectedDate.value,
  )

  // 把已預約的時間範圍展開成一格一格
  // 例如一筆預約 14:00~16:00 → 展開成 ['14:00', '15:00']
  bookedSlots.value = []
  bookings.forEach((b) => {
    const startH = parseInt(b.startTime)
    const endH = parseInt(b.endTime)
    for (let h = startH; h < endH; h++) {
      bookedSlots.value.push(h.toString().padStart(2, '0') + ':00')
    }
  })

  // 清空使用者之前選的時段（因為換了球場或日期）
  selectedSlots.value = []
}

// 點擊時段格子：切換選取/取消
function toggleSlot(slot) {
  if (bookedSlots.value.includes(slot)) return // 已預約的不能選
  const idx = selectedSlots.value.indexOf(slot)
  if (idx >= 0) {
    selectedSlots.value.splice(idx, 1) // 已選 → 取消
  } else {
    selectedSlots.value.push(slot) // 未選 → 選取
  }
  selectedSlots.value.sort() // 保持時間順序
}

// 選擇球場
function selectCourt(court) {
  selectedCourt.value = court
  loadBookedSlots()
}

// 頁面載入時，從 API 取得場館列表
onMounted(async () => {
  const all = await venueApi.findAll()
  venues.value = all.filter((v) => v.status === 'ACTIVE')
  allCourts.value = await courtApi.findAll() // ← 加這行
})
</script>

<template>
  <div class="container py-4">
    <!-- 頁面標題 -->
    <h2 class="section-title">📅 預約球場</h2>

    <!-- Step Indicator -->
    <div class="step-indicator d-flex align-items-center justify-content-center mb-5">
      <template v-for="(step, index) in steps" :key="step.number">
        <!-- 圓圈 + 文字 -->
        <div class="text-center">
          <div
            class="step-circle"
            :class="{
              active: currentStep === step.number,
              completed: currentStep > step.number,
            }"
          >
            <!-- 已完成 → 打勾，否則顯示數字 -->
            <i v-if="currentStep > step.number" class="bi bi-check-lg"></i>
            <span v-else>{{ step.number }}</span>
          </div>
          <div class="step-label mt-2" :class="{ 'fw-bold': currentStep === step.number }">
            {{ step.title }}
          </div>
        </div>
        <!-- 連接線（最後一步之後不需要） -->
        <div
          v-if="index < steps.length - 1"
          class="step-line"
          :class="{ completed: currentStep > step.number }"
        ></div>
      </template>
    </div>
    <!-- Step 1：選擇場館 -->
    <div v-if="currentStep === 1">
      <div class="row g-4">
        <div v-for="venue in venues" :key="venue.venueId" class="col-md-6 col-lg-4">
          <div class="card card-rounded shadow-sm border-0 h-100 hover-lift overflow-hidden">
            <!-- 場館圖片 -->
            <div class="img-zoom" style="height: 200px">
              <img
                :src="getVenueImage(venue.venueId)"
                :alt="venue.venueName"
                class="card-img-top w-100 h-100"
                style="object-fit: cover"
              />
            </div>
            <div class="card-body p-4">
              <!-- 場館名稱 -->
              <h5 class="card-title fw-bold mb-2">{{ venue.venueName }}</h5>

              <!-- 地址 -->
              <p class="text-secondary mb-3" style="font-size: 0.85rem">
                <i class="bi bi-geo-alt me-1"></i>{{ venue.address }}
              </p>

              <!-- 選擇按鈕 -->
              <button class="btn btn-brand w-100" @click="selectVenue(venue)">選擇此場館</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2：選擇時段 -->
    <div v-else-if="currentStep === 2">
      <div class="card card-rounded shadow-sm border-0 p-4">
        <!-- 目前選的場館名稱 -->
        <h5 class="fw-bold mb-4">
          <i class="bi bi-building me-2" style="color: var(--brand-sky)"></i>
          {{ selectedVenue?.venueName }}
        </h5>

        <!-- 球場選擇 -->
        <div class="mb-4">
          <label class="form-label fw-bold">選擇球場</label>
          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="court in filteredCourts"
              :key="court.courtId"
              class="btn"
              :class="
                selectedCourt?.courtId === court.courtId ? 'btn-brand' : 'btn-outline-secondary'
              "
              @click="selectCourt(court)"
            >
              {{ court.courtName }}
            </button>
          </div>
        </div>

        <!-- 日期選擇 -->
        <div class="mb-4">
          <label class="form-label fw-bold">選擇日期</label>
          <input
            type="date"
            class="form-control"
            style="max-width: 250px"
            v-model="selectedDate"
            :min="today"
            @change="loadBookedSlots"
          />
        </div>

        <!-- 時段格子 -->
        <div class="mb-3">
          <label class="form-label fw-bold">選擇時段</label>
          <p class="text-secondary" style="font-size: 0.8rem">
            🟢 可選 / ⬜ 已預約 / 🔵 已選取 ・每小時 NT$300
          </p>
          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="slot in timeSlots"
              :key="slot"
              class="btn slot-btn"
              :class="{
                'slot-booked': bookedSlots.includes(slot),
                'slot-selected': selectedSlots.includes(slot),
                'slot-available': !bookedSlots.includes(slot) && !selectedSlots.includes(slot),
              }"
              :disabled="bookedSlots.includes(slot)"
              @click="toggleSlot(slot)"
            >
              {{ slot }}
            </button>
          </div>
        </div>
        <!-- 已選時段摘要 -->
        <div v-if="selectedSlots.length > 0" class="alert alert-info mt-3">
          已選<strong>{{ selectedSlots.length }}</strong
          >小時， 預估金額：<strong>NT$ {{ selectedSlots.length * 300 }}</strong>
        </div>
      </div>
    </div>
    <!-- Step 3：確認預約 -->
    <div v-else>
      <p class="text-secondary text-center">Step 3 — 確認預約（待實作）</p>
    </div>
    <!-- 臨時測試按鈕（第七步美化時移除） -->
    <div class="d-flex justify-content-center gap-3 mt-4">
      <button
        class="btn btn-outline-secondary"
        :disabled="currentStep === 1"
        @click="currentStep--"
      >
        ← 上一步
      </button>
      <button class="btn btn-brand" :disabled="currentStep === 3" @click="currentStep++">
        下一步 →
      </button>
    </div>
  </div>
</template>

<style scoped>
.step-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  margin: 0 auto;
  border: 2px solid #cbd5e1;
  color: #94a3b8;
  background-color: white;
  transition: all 0.3s ease;
}
.step-circle.active {
  border-color: var(--brand-teal);
  background-color: var(--brand-teal);
  color: white;
}
.step-circle.completed {
  border-color: var(--brand-teal);
  background-color: var(--brand-teal);
  color: white;
}
.step-line {
  width: 80px;
  height: 3px;
  background-color: #cbd5e1;
  margin: 0 0.5rem;
  margin-bottom: 1.75rem; /* 對齊圓圈中心，避開下方文字 */
  border-radius: 2px;
  transition: background-color 0.3s ease;
}
.step-line.completed {
  background-color: var(--brand-teal);
}
.step-label {
  font-size: 0.8rem;
  color: #64748b;
  white-space: nowrap;
}
</style>
