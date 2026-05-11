<script setup>
import { onMounted, computed } from 'vue'
// 引入剛剛建好的卡片元件
import PickupGameCard from '@/components/frontend/PickupGameCard.vue'
// 💡 直接拿後台寫好的 API 邏輯來用！
import { usePickupGameApi } from '@/composables/usePickupGameApi'
// 如果你想加篩選，也可以把 useGameFilter 拿進來
const { pickupGames, fetchGames } = usePickupGameApi()
// 前台只要顯示「開放中」和「已額滿」的場次（過濾掉已取消或已結束的）
const availableGames = computed(() => {
  return pickupGames.value.filter(game => game.status !== 'CANCELLED' && game.status !== 'CLOSED')
})
// 點擊卡片報名按鈕時觸發
const handleJoinGame = (game) => {
  // 這裡之後可以串接「我要報名」的邏輯（檢查登入、呼叫 addSignup 等）
  console.log('準備報名這場：', game)
  alert(`即將報名 ${game.gameDate} 的場次！功能開發中...`)
}
// 進來頁面就去撈資料
onMounted(() => {
  fetchGames()
})
</script>
<template>
  <div class="container py-5 mt-5">
    <!-- 標題區 -->
    <div class="text-center mb-5">
      <h2 class="fw-bold" style="color: var(--brand-sky);">尋找你的羽球好夥伴</h2>
      <p class="text-muted">瀏覽所有揪團活動，隨時加入一場熱血的比賽！</p>
    </div>
    <!-- 篩選列（你可以留給自己練習加上日期跟關鍵字篩選） -->
    <div class="row mb-4">
      <div class="col-md-4">
        <input type="text" class="form-control" placeholder="搜尋場館、程度...">
      </div>
    </div>
    <!-- 揪團卡片列表 (網格) -->
    <div class="row g-4">
      <div
        v-for="game in availableGames"
        :key="game.gameId"
        class="col-md-6 col-lg-4"
      >
        <!-- 呼叫元件，傳入資料，並監聽事件 -->
        <PickupGameCard
          :game="game"
          @join-game="handleJoinGame"
        />
      </div>
      <!-- 如果沒有資料時的顯示 -->
      <div v-if="availableGames.length === 0" class="col-12 text-center text-muted py-5">
        <i class="bi bi-emoji-frown fs-1 mb-3 d-block"></i>
        目前還沒有人開團，要不要自己發起一場？
      </div>
    </div>
  </div>
</template>
