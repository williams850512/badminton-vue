<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePickupGameApi } from '@/composables/usePickupGameApi'
import SignupPanel from '@/components/frontend/SignupPanel.vue'

const route = useRoute()
const router = useRouter()
const gameId = route.params.id

const { pickupGames, fetchGames, signupsMap, fetchSignups, joinPickupGame } = usePickupGameApi()

const isLoaded = ref(false)
const isJoining = ref(false)
const agreeRules = ref(false) // 報名同意方塊

const skillMap = {
  ALL: '不限',
  BEGINNER: '初級',
  INTERMEDIATE: '中級',
  ADVANCED: '高級',
}

onMounted(async () => {
  await Promise.all([
    fetchGames(),
    fetchSignups(gameId)
  ])
  isLoaded.value = true
})

const game = computed(() => {
  return pickupGames.value.find(g => String(g.gameId) === String(gameId))
})

const signups = computed(() => {
  return signupsMap.value[gameId] || []
})

// ============================
// 🎯 核心商業邏輯：報名權限判定
// ============================
const currentMemberId = 1 // 假資料：目前登入的會員 ID

// 判斷當前使用者是不是主揪
const isCurrentUserHost = computed(() => {
  if (!game.value) return false
  return game.value.host?.memberId === currentMemberId
})

// 計算登入者已經報名了幾次
const mySignupCount = computed(() => {
  if (!signups.value) return 0
  return signups.value.filter(s => s.member?.memberId === currentMemberId).length
})

// 按鈕文字：動態切換
const signupButtonText = computed(() => {
  if (game.value?.currentPlayers >= game.value?.maxPlayers) {
    return '已額滿'
  }
  // 還沒報名過
  if (mySignupCount.value === 0) {
    return '我要報名'
  }
  
  // 已經報名過的情況：判斷身份
  if (isCurrentUserHost.value) {
    return '再幫朋友卡一位 (+1)' // 主揪可以無限卡位
  } else {
    return '您已報名' // 一般會員只能報一次
  }
})

// 按鈕是否禁用
const isButtonDisabled = computed(() => {
  if (!game.value) return true
  // 滿了不能報名
  if (game.value.currentPlayers >= game.value.maxPlayers) return true
  
  // 🎯 核心防呆：如果已經報名過，且「不是」主揪，強制鎖死按鈕
  if (mySignupCount.value > 0 && !isCurrentUserHost.value) {
    return true
  }
  
  return false
})

// ============================
// 🎯 視覺處理：報名名單顯示標籤
// ============================
const displaySignups = computed(() => {
  if (!signups.value || !game.value) return []
  
  const memberCounts = {}

  return signups.value.map((signup) => {
    const mId = signup.member?.memberId
    const isHost = (mId === game.value.host?.memberId)
    
    // 計算出現次數
    if (!memberCounts[mId]) {
      memberCounts[mId] = 1
    } else {
      memberCounts[mId]++
    }
    
    const count = memberCounts[mId]
    let tag = ''

    // 第一筆且為主揪
    if (count === 1 && isHost) {
      tag = '主揪'
    } else if (count > 1) {
      // 重複報名的就標示攜伴
      tag = `攜伴 +${count - 1}`
    }

    return {
      ...signup,
      displayTag: tag
    }
  })
})

const onJoinGame = async () => {
  if (isButtonDisabled.value || !agreeRules.value) return
  
  isJoining.value = true
  await joinPickupGame(gameId, currentMemberId)
  
  await Promise.all([
    fetchGames(),
    fetchSignups(gameId)
  ])
  isJoining.value = false
}

</script>

<template>
  <div class="container py-5 mt-5">
    
    <!-- 讀取中 -->
    <div v-if="!isLoaded" class="text-center py-5">
      <div class="spinner-border text-sky-blue" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <!-- 找不到資料 -->
    <div v-else-if="!game" class="text-center py-5">
      <i class="bi bi-emoji-frown fs-1 text-secondary"></i>
      <h4 class="mt-3 text-secondary">找不到該筆揪團紀錄</h4>
      <button class="btn btn-outline-secondary mt-3 rounded-pill" @click="router.push('/pickup')">回揪團列表</button>
    </div>
    
    <!-- 詳情內容 (SmashLink Style) -->
    <div v-else class="row g-5">
      
      <!-- ============================ -->
      <!-- 左側：詳細資訊 -->
      <!-- ============================ -->
      <div class="col-lg-8 pe-lg-5">
        
        <!-- Tags -->
        <div class="d-flex gap-2 mb-3">
          <span class="badge rounded-pill bg-sky-blue text-white px-3 py-2 fw-medium">{{ skillMap[game.skillLevel] }}</span>
          <span class="badge rounded-pill bg-light text-secondary px-3 py-2 border fw-medium">報名中</span>
        </div>

        <!-- 標題區 -->
        <h2 class="fw-bold mb-4 text-dark">{{ game.venue?.venueName }} 臨打團</h2>

        <!-- 日期、時間、地點 (直式排列) -->
        <div class="d-flex flex-column gap-3 mb-5">
          <div class="d-flex align-items-center">
            <i class="bi bi-calendar-event fs-5 text-secondary me-3" style="width: 24px; text-align: center;"></i>
            <span class="text-dark">{{ game.gameDate }}</span>
          </div>
          <div class="d-flex align-items-center">
            <i class="bi bi-clock fs-5 text-secondary me-3" style="width: 24px; text-align: center;"></i>
            <span class="text-dark">{{ game.startTime }} - {{ game.endTime }}</span>
          </div>
          <div class="d-flex align-items-center">
            <i class="bi bi-geo-alt fs-5 text-secondary me-3" style="width: 24px; text-align: center;"></i>
            <span class="text-dark">{{ game.venue?.venueName }} - {{ game.court?.courtName }}</span>
          </div>
        </div>

        <!-- 已報名隊友 (水平頭像列表) -->
        <div class="mb-5">
          <h5 class="fw-bold mb-4">已報名隊友 ({{ game.currentPlayers }}/{{ game.maxPlayers }}人)</h5>
          <div class="d-flex flex-wrap gap-4">
            
            <!-- 已經報名的人 -->
            <div v-for="s in displaySignups" :key="s.signupId" class="text-center" style="width: 60px;">
              <div class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mx-auto mb-2 position-relative"
                   :class="s.displayTag === '主揪' ? 'bg-sky-blue' : 'bg-secondary'"
                   style="width: 56px; height: 56px; font-size: 1.2rem;">
                {{ s.member?.fullName.charAt(0) }}
                <!-- 狀態綠點 -->
                <span class="position-absolute bottom-0 end-0 p-1 bg-success border border-light rounded-circle" style="margin-bottom: 2px; margin-right: 2px;"></span>
              </div>
              <div class="small fw-bold text-truncate w-100">{{ s.member?.fullName }}</div>
              <div v-if="s.displayTag" class="small text-muted" style="font-size: 0.7rem;">{{ s.displayTag }}</div>
            </div>

            <!-- 剩下的空位 (虛線框) -->
            <div v-for="i in Math.max(0, game.maxPlayers - game.currentPlayers)" :key="'empty'+i" class="text-center" style="width: 60px;">
              <div class="rounded-circle d-flex align-items-center justify-content-center bg-light border-dashed mx-auto mb-2"
                   style="width: 56px; height: 56px;">
                <i class="bi bi-person-plus text-secondary opacity-50"></i>
              </div>
              <div class="small text-muted">空位</div>
            </div>

          </div>
        </div>

        <!-- 假地圖 (漸層背景取代) -->
        <div class="mb-5 rounded-4 overflow-hidden shadow-sm" style="height: 250px; background: linear-gradient(135deg, #e0f2fe 0%, #f1f5f9 100%); position: relative;">
          <div class="position-absolute top-50 start-50 translate-middle text-center">
            <i class="bi bi-geo-fill fs-1 text-sky-blue"></i><br>
            <span class="fw-bold text-secondary">{{ game.venue?.venueName }}</span>
          </div>
        </div>

        <!-- 活動細則與備註 (Flex Box) -->
        <div class="mb-5">
          <h5 class="fw-bold mb-4">活動細則與備註</h5>
          <div class="row g-3">
            <div class="col-md-4">
              <div class="border rounded-3 p-3 d-flex align-items-center h-100">
                <i class="bi bi-egg text-sky-blue fs-4 me-3"></i>
                <div>
                  <div class="small text-secondary mb-1">提供用球</div>
                  <div class="fw-bold">Yonex AS-50</div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="border rounded-3 p-3 d-flex align-items-center h-100">
                <i class="bi bi-grid-3x3 text-sky-blue fs-4 me-3"></i>
                <div>
                  <div class="small text-secondary mb-1">場地數量</div>
                  <div class="fw-bold">1 面場地</div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="border rounded-3 p-3 d-flex align-items-center h-100">
                <i class="bi bi-people text-sky-blue fs-4 me-3"></i>
                <div>
                  <div class="small text-secondary mb-1">人數上限</div>
                  <div class="fw-bold">{{ game.maxPlayers }} 人</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 主揪資訊 -->
        <div class="mb-5 pb-5">
          <h5 class="fw-bold mb-4">主揪資訊</h5>
          <div class="d-flex align-items-start">
            <div class="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center me-3 flex-shrink-0" style="width: 60px; height: 60px; font-size: 1.5rem;">
              {{ game.host?.fullName.charAt(0) }}
            </div>
            <div>
              <h6 class="fw-bold mb-2">{{ game.host?.fullName }}</h6>
              <p class="text-secondary small mb-0" style="line-height: 1.8;">
                專注於羽球推廣，希望透過優質的場地與比賽，讓更多愛好者能交流球技。本次揪團程度為「{{ skillMap[game.skillLevel] }}」，使用國際比賽級用球，歡迎大家一起來熱血一下！
              </p>
            </div>
          </div>
        </div>

      </div>

      <!-- ============================ -->
      <!-- 右側：固定報名卡片 (SignupPanel 元件) -->
      <!-- ============================ -->
      <div class="col-lg-4">
        <SignupPanel 
          :game="game"
          :is-joining="isJoining"
          :button-text="signupButtonText"
          :is-disabled-by-logic="isButtonDisabled"
          @submit-signup="onJoinGame"
        />
      </div>

    </div>
  </div>
</template>

<style scoped>
.text-sky-blue { color: #0ea5e9; }
.bg-sky-blue { background-color: #0ea5e9; }

.border-dashed {
  border: 2px dashed #cbd5e1 !important;
}

.level-radio:hover {
  background-color: #f8fafc;
  border-color: #0ea5e9 !important;
}

.level-radio input:checked {
  background-color: #0ea5e9;
  border-color: #0ea5e9;
}
</style>
