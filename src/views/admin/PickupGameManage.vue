<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
// 引入 SweetAlert2：取代原生醜醜的 alert()，變成漂亮的彈跳視窗
import Swal from 'sweetalert2'

// ============================
// ✏️ 即時編輯（Inline Edit）
// ============================
// 記錄「正在編輯的是哪一格」，格式：{ gameId: 4, field: 'maxPlayers' }
const inlineEdit = ref(null)
// 點擊格子 → 進入編輯模式
const startInlineEdit = (gameId, field) => {
  inlineEdit.value = { gameId, field }
}
// 按 Enter 或失去焦點 → 儲存並退出編輯模式
const saveInlineEdit = async (game) => {
  try {
    await axios.put(`/api/pickup-games/${game.gameId}`, game)
    inlineEdit.value = null
    fetchGames()
  } catch (err) {
    Swal.fire({ icon: 'error', title: '更新失敗' })
  }
}
// ============================
// 📋 表格列表用的資料
// ============================
const pickupGames = ref([])
const statusMap = {
  OPEN: '開放中',
  FULL: '已額滿',
  CLOSED: '已結束',
  CANCELLED: '已取消',
}
const skillMap = {
  ALL: '不限',
  BEGINNER: '初級',
  INTERMEDIATE: '中級',
  ADVANCED: '高級',
}
// ============================
// 📝 新增揪團表單用的資料
// ============================
const courts = ref([])
const memberKeyword = ref('')
const memberResults = ref([])
const selectedMember = ref(null)
const today = new Date().toISOString().split('T')[0]
const newGame = ref({
  host: { memberId: null },
  court: { courtId: null },
  gameDate: '',
  startTime: '',
  endTime: '',
  maxPlayers: 4,
  skillLevel: 'ALL',
})
// ============================
// 👥 查看報名相關的資料
// ============================
// 記錄「目前展開的是哪一場揪團」，null 代表全部收合
const expandedGameId = ref(null)
// 用物件來儲存每場揪團的報名名單，key 是 gameId，value 是報名陣列
// 例如：{ 4: [{signupId:1, member:{...}, ...}, ...], 3: [...] }
const signupsMap = ref({})
// 報名區的會員搜尋（跟上面新增揪團的搜尋是分開的）
const signupKeyword = ref('')
const signupSearchResults = ref([])
const selectedSignupMember = ref(null)
// ============================
// ⏰ 時間下拉選單的邏輯
// 🔧 加上判斷：如果選的日期是「今天」，就過濾掉已經過去的時間
const startTimeOptions = computed(() => {
  const options = []
  for (let hour = 10; hour <= 21; hour++) {
    options.push(`${String(hour).padStart(2, '0')}:00`)
  }
  // 如果選的日期是今天，只保留「現在這個小時之後」的時段
  if (newGame.value.gameDate === today) {
    const currentHour = new Date().getHours()
    // filter：只留下「小時數 > 目前小時數」的選項
    // 例如現在 14:35，currentHour=14，只保留 15:00 之後的
    return options.filter((t) => parseInt(t.split(':')[0]) > currentHour)
  }
  return options
})
// 結束時間選項：根據開始時間動態計算
const endTimeOptions = computed(() => {
  if (!newGame.value.startTime) return []
  const options = []
  const startHour = parseInt(newGame.value.startTime.split(':')[0])
  for (let hour = startHour + 1; hour <= 22; hour++) {
    options.push(`${String(hour).padStart(2, '0')}:00`)
  }
  return options
})
watch(
  () => newGame.value.startTime,
  () => {
    newGame.value.endTime = ''
  },
)
// ============================================================
// 搜尋 + 狀態篩選 + 分頁 邏輯
// ============================================================

// 搜尋關鍵字
const searchQuery = ref('')
// 狀態篩選
const statusFilter = ref('ALL')
// 日期區間篩選
const dateFrom = ref('') // 開始日期
const dateTo = ref('') // 結束日期
// 分頁相關
const currentPage = ref(1)
const pageSize = ref(10)
// ============================
// ☑️ 批次操作
// ============================
// 儲存被勾選的 gameId 陣列
const selectedIds = ref([])
// 全選/取消全選（只針對目前這一頁的資料）
const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedIds.value = paginatedGames.value.map((g) => g.gameId)
  } else {
    selectedIds.value = []
  }
}
// 批次取消揪團
const batchCancel = async () => {
  if (!selectedIds.value.length) return
  const result = await Swal.fire({
    icon: 'warning',
    title: `確定要批次取消 ${selectedIds.value.length} 場揪團嗎？`,
    showCancelButton: true,
    confirmButtonText: '確定取消',
    cancelButtonText: '返回',
    confirmButtonColor: '#dc3545',
  })
  if (result.isConfirmed) {
    try {
      // 用 Promise.all 同時送出多個 PUT 請求
      await Promise.all(
        selectedIds.value.map((id) => {
          const game = pickupGames.value.find((g) => g.gameId === id)
          return axios.put(`/api/pickup-games/${id}`, { ...game, status: 'CANCELLED' })
        }),
      )
      Swal.fire({ icon: 'success', title: `已取消 ${selectedIds.value.length} 場揪團` })
      selectedIds.value = []
      fetchGames()
    } catch (err) {
      Swal.fire({ icon: 'error', title: '批次取消失敗' })
    }
  }
}

// 第一層過濾：篩選狀態與關鍵字
const filteredGames = computed(() => {
  let result = pickupGames.value
  if (statusFilter.value !== 'ALL') {
    // 🔧 改用 getDisplayStatus 判斷，這樣過期的揪團也會被歸到「已結束」
    result = result.filter((game) => getDisplayStatus(game) === statusFilter.value)
  }
  // 日期區間篩選
  if (dateFrom.value) {
    result = result.filter((game) => game.gameDate >= dateFrom.value)
  }
  if (dateTo.value) {
    result = result.filter((game) => game.gameDate <= dateTo.value)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    result = result.filter((game) => {
      const searchable = [
        game.host?.fullName,
        game.venue?.venueName,
        game.court?.courtName,
        game.gameDate,
        String(game.gameId),
      ]
        .join(' ')
        .toLowerCase()
      return searchable.includes(q)
    })
  }
  return result
})

// 總頁數
const totalPages = computed(() => {
  return Math.ceil(filteredGames.value.length / pageSize.value) || 1
})

// 第二層切割：取出當前頁面資料
const paginatedGames = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredGames.value.slice(start, start + pageSize.value)
})

// 監聽變數改變，自動回第一頁
watch([searchQuery, statusFilter, pageSize, dateFrom, dateTo], () => {
  currentPage.value = 1
})
// ============================
// 🔌 API 呼叫
// ============================
const fetchGames = async () => {
  try {
    const response = await axios.get('/api/pickupgames')
    pickupGames.value = response.data
  } catch (error) {
    console.log('抓取資料失敗', error)
  }
}
const fetchCourts = async () => {
  try {
    const res = await axios.get('/api/courts')
    courts.value = res.data
  } catch (err) {
    console.error('抓取場地失敗', err)
  }
}
// ---------- 新增揪團相關 ----------
const searchMembers = async () => {
  if (!memberKeyword.value.trim()) {
    memberResults.value = []
    return
  }
  try {
    const res = await axios.get('/api/members/search', {
      params: { keyword: memberKeyword.value },
    })
    memberResults.value = res.data
  } catch (err) {
    console.error('搜尋會員失敗', err)
  }
}
const selectMember = (member) => {
  selectedMember.value = member
  newGame.value.host.memberId = member.memberId
  memberKeyword.value = member.fullName
  memberResults.value = []
}
const createPickupGame = async () => {
  try {
    await axios.post('/api/pickup-games', newGame.value)
    // 🔧 用 SweetAlert2 取代原本的 alert()
    Swal.fire({
      icon: 'success', // 顯示綠色打勾圖示
      title: '建立成功！',
      text: '揪團已成功建立',
      confirmButtonText: '太好了',
      confirmButtonColor: '#0d6efd', // Bootstrap 藍色
    })
    fetchGames()
    newGame.value = {
      host: { memberId: null },
      court: { courtId: null },
      gameDate: '',
      startTime: '',
      endTime: '',
      maxPlayers: 4,
      skillLevel: 'ALL',
    }
    selectedMember.value = null
    memberKeyword.value = ''
  } catch (error) {
    console.error('新增失敗：', error)
    Swal.fire({
      icon: 'error',
      title: '新增失敗',
      text: '請檢查資料是否正確',
      confirmButtonText: '我知道了',
    })
  }
}
// ---------- 查看報名相關 ----------
// 展開/收合報名名單
const toggleSignups = async (gameId) => {
  // 如果點的是已經展開的那場 → 收合
  if (expandedGameId.value === gameId) {
    expandedGameId.value = null
    return
  }
  // 否則 → 展開並去後端抓這場的報名資料
  expandedGameId.value = gameId
  await fetchSignups(gameId)
}
// 抓取某場揪團的報名名單
const fetchSignups = async (gameId) => {
  try {
    // 呼叫後端 API：GET /api/pickup-games/{gameId}/signups
    const res = await axios.get(`/api/pickup-games/${gameId}/signups`)
    // 把結果存進 signupsMap，用 gameId 當 key
    signupsMap.value[gameId] = res.data
  } catch (err) {
    console.error('抓取報名名單失敗', err)
  }
}
// 報名區搜尋會員（跟新增揪團的搜尋邏輯一樣，但用不同的變數）
const searchSignupMembers = async () => {
  if (!signupKeyword.value.trim()) {
    signupSearchResults.value = []
    return
  }
  try {
    const res = await axios.get('/api/members/search', {
      params: { keyword: signupKeyword.value },
    })
    signupSearchResults.value = res.data
  } catch (err) {
    console.error('搜尋會員失敗', err)
  }
}
// 在報名區選中會員
const selectSignupMember = (member) => {
  selectedSignupMember.value = member
  signupKeyword.value = member.fullName
  signupSearchResults.value = []
}
// 新增報名
const addSignup = async (gameId) => {
  if (!selectedSignupMember.value) {
    Swal.fire({ icon: 'warning', title: '請先搜尋並選擇一位會員', confirmButtonText: '好的' })
    return
  }
  try {
    // POST /api/pickup-game-signups
    // 後端需要 game 物件（帶 gameId）和 member 物件（帶 memberId）
    await axios.post('/api/pickup-game-signups', {
      game: { gameId: gameId },
      member: { memberId: selectedSignupMember.value.memberId },
    })
    Swal.fire({
      icon: 'success',
      title: '報名成功！',
      text: `${selectedSignupMember.value.fullName} 已加入揪團`,
      confirmButtonText: '太好了',
      confirmButtonColor: '#0d6efd',
    })
    // 重新抓取報名名單和揪團列表（人數會更新）
    await fetchSignups(gameId)
    fetchGames()
    // 清空搜尋
    signupKeyword.value = ''
    selectedSignupMember.value = null
  } catch (error) {
    console.error('報名失敗', error)
    Swal.fire({
      icon: 'error',
      title: '報名失敗',
      text: '該會員可能已經報名過了',
      confirmButtonText: '我知道了',
    })
  }
}
// 移除報名（使用 SweetAlert2 確認視窗）
const removeSignup = async (signupId, gameId, memberName) => {
  // Swal.fire 搭配 showCancelButton 就能做出「確定/取消」的雙按鈕確認框
  const result = await Swal.fire({
    icon: 'warning', // 黃色警告三角形
    title: '確定移除報名嗎？',
    text: `即將移除「${memberName}」的報名`,
    showCancelButton: true, // 顯示取消按鈕
    confirmButtonText: '確定移除',
    cancelButtonText: '取消',
    confirmButtonColor: '#dc3545', // 紅色（代表危險操作）
    cancelButtonColor: '#6c757d', // 灰色
  })
  // result.isConfirmed 只有在使用者按下「確定移除」時才是 true
  if (result.isConfirmed) {
    try {
      // DELETE /api/pickup-game-signups/{signupId}
      await axios.delete(`/api/pickup-game-signups/${signupId}`)
      Swal.fire({
        icon: 'success',
        title: '已移除',
        text: `${memberName} 的報名已被移除`,
        confirmButtonText: '好的',
        confirmButtonColor: '#0d6efd',
      })
      // 重新抓取
      await fetchSignups(gameId)
      fetchGames()
    } catch (err) {
      console.error('移除失敗', err)
      Swal.fire({ icon: 'error', title: '移除失敗', confirmButtonText: '我知道了' })
    }
  }
}
// ✏️ 編輯揪團相關
// 儲存正在編輯的揪團資料（點鉛筆時會把該場資料複製進來）
const editGame = ref(null)
// 編輯表單裡「主揪」的顯示文字
const editMemberKeyword = ref('')
// 點擊鉛筆按鈕時：把該場揪團的資料複製一份放進 editGame，然後打開 Modal
const openEditModal = (game) => {
  // JSON.parse + JSON.stringify 是「深拷貝」技巧
  // 避免直接修改原始資料（還沒按儲存就改到表格上的值）
  editGame.value = JSON.parse(JSON.stringify(game))
  // 把主揪名字顯示在輸入框上
  editMemberKeyword.value = game.host?.fullName || ''
}
// 按下「儲存」時：送出 PUT 請求更新資料庫
const updatePickupGame = async () => {
  try {
    // PUT /api/pickup-games/{gameId}
    await axios.put(`/api/pickup-games/${editGame.value.gameId}`, editGame.value)
    Swal.fire({
      icon: 'success',
      title: '修改成功！',
      confirmButtonText: '太好了',
      confirmButtonColor: '#0d6efd',
    })
    fetchGames() // 重新抓列表更新畫面
  } catch (error) {
    console.error('修改失敗', error)
    Swal.fire({
      icon: 'error',
      title: '修改失敗',
      text: '請檢查資料',
      confirmButtonText: '我知道了',
    })
  }
}
// 🗑️ 取消揪團（軟刪除：不是真的刪，只是把狀態改成 CANCELLED）
const cancelPickupGame = async (game) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: '確定要取消這場揪團嗎？',
    text: `${game.host?.fullName} 在 ${game.gameDate} 的揪團將被標記為「已取消」`,
    showCancelButton: true,
    confirmButtonText: '確定取消',
    cancelButtonText: '返回',
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
  })
  if (result.isConfirmed) {
    try {
      // 用 PUT 更新狀態，而不是 DELETE 刪除資料
      // 把整個 game 物件複製一份，只改 status 欄位
      await axios.put(`/api/pickup-games/${game.gameId}`, {
        ...game,
        status: 'CANCELLED',
      })
      Swal.fire({
        icon: 'success',
        title: '已取消',
        text: '該揪團已標記為已取消',
        confirmButtonText: '好的',
        confirmButtonColor: '#0d6efd',
      })
      fetchGames()
    } catch (err) {
      console.error('取消失敗', err)
      Swal.fire({ icon: 'error', title: '取消失敗', confirmButtonText: '我知道了' })
    }
  }
}
// 判斷揪團是否已過期（日期+結束時間已經過了）
const getDisplayStatus = (game) => {
  // 如果後端已經標記取消了，就直接用取消
  if (game.status === 'CANCELLED') return 'CANCELLED'
  // 把 gameDate + endTime 組成完整的時間來比較
  const endDateTime = new Date(`${game.gameDate}T${game.endTime}`)
  const now = new Date()
  // 如果結束時間已經過了 → 強制顯示「已結束」
  if (endDateTime < now) return 'CLOSED'
  // 否則就用後端回傳的原始狀態
  return game.status
}

// ============================
// 🚀 頁面載入
// ============================
onMounted(() => {
  fetchGames()
  fetchCourts()
})
</script>
<template>
  <!-- ============ 編輯揪團 Modal ============ -->
  <!-- v-if="editGame" 確保 editGame 有值時才渲染，避免一開始就報錯 -->
  <div class="modal fade" id="editGameModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <template v-if="editGame">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-pencil-square me-2 text-primary"></i>編輯揪團
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form class="row g-3">
              <!-- 主揪（顯示目前的主揪，不可修改） -->
              <div class="col-12">
                <label class="form-label fw-bold">主揪 <span class="text-danger">*</span></label>
                <input type="text" class="form-control" :value="editMemberKeyword" disabled />
                <small class="text-success">
                  ✔ {{ editGame.host?.fullName }} (ID: {{ editGame.host?.memberId }})
                </small>
              </div>
              <!-- 場地 -->
              <div class="col-12">
                <label class="form-label fw-bold">場地 <span class="text-danger">*</span></label>
                <select class="form-select" v-model="editGame.court.courtId">
                  <option v-for="c in courts" :key="c.courtId" :value="c.courtId">
                    {{ c.venue?.venueName }} / {{ c.courtName }}
                  </option>
                </select>
              </div>
              <!-- 日期 -->
              <div class="col-12">
                <label class="form-label fw-bold">日期 <span class="text-danger">*</span></label>
                <input type="date" class="form-control" v-model="editGame.gameDate" :min="today" />
              </div>
              <!-- 開始時間 -->
              <div class="col-md-6">
                <label class="form-label fw-bold"
                  >開始時間 <span class="text-danger">*</span></label
                >
                <select class="form-select" v-model="editGame.startTime">
                  <option v-for="t in startTimeOptions" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <!-- 結束時間 -->
              <div class="col-md-6">
                <label class="form-label fw-bold"
                  >結束時間 <span class="text-danger">*</span></label
                >
                <select class="form-select" v-model="editGame.endTime">
                  <!-- 編輯時根據編輯中的開始時間動態產生選項 -->
                  <option
                    v-for="hour in (() => {
                      const s = parseInt(editGame.startTime?.split(':')[0] || 10)
                      return Array.from(
                        { length: 22 - s },
                        (_, i) => `${String(s + i + 1).padStart(2, '0')}:00`,
                      )
                    })()"
                    :key="hour"
                    :value="hour"
                  >
                    {{ hour }}
                  </option>
                </select>
              </div>
              <!-- 最大人數 -->
              <div class="col-md-6">
                <label class="form-label fw-bold"
                  >最大人數 <span class="text-danger">*</span></label
                >
                <select class="form-select" v-model="editGame.maxPlayers">
                  <option
                    v-for="n in Array.from({ length: 11 }, (_, i) => i + 2)"
                    :key="n"
                    :value="n"
                  >
                    {{ n }} 人
                  </option>
                </select>
              </div>
              <!-- 程度要求 -->
              <div class="col-md-6">
                <label class="form-label fw-bold">程度要求</label>
                <select class="form-select" v-model="editGame.skillLevel">
                  <option value="ALL">不限</option>
                  <option value="BEGINNER">初級</option>
                  <option value="INTERMEDIATE">中級</option>
                  <option value="ADVANCED">高級</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-lg me-1"></i> 取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="updatePickupGame"
              data-bs-dismiss="modal"
            >
              <i class="bi bi-check-lg me-1"></i> 儲存
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
  <div class="pickup-games-container p-4 bg-white rounded shadow-sm">
    <!-- ============ 頂部工具列 ============ -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0"><i class="bi bi-people-fill me-2"></i>臨打揪團管理</h4>
      <div class="d-flex gap-2">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            placeholder="搜尋主揪、場地、日期..."
            v-model="searchQuery"
          />
          <!-- ✕ 按鈕：清空搜尋 -->
          <button class="btn btn-outline-danger" type="button" @click="searchQuery = ''">✕</button>
        </div>
        <button
          class="btn btn-primary text-nowrap"
          data-bs-toggle="modal"
          data-bs-target="#addGameModal"
        >
          <i class="bi bi-plus-circle-fill me-1"></i> 新增揪團
        </button>
      </div>
    </div>
    <!-- 狀態快速篩選按鈕列 -->
    <!-- 日期區間篩選（用原生 date input，不裝套件） -->
    <div class="d-flex gap-2 mb-3 align-items-center">
      <label class="form-label mb-0 small text-muted">日期範圍</label>
      <input
        type="date"
        class="form-control form-control-sm"
        style="width: 160px"
        v-model="dateFrom"
      />
      <span class="text-muted">~</span>
      <input
        type="date"
        class="form-control form-control-sm"
        style="width: 160px"
        v-model="dateTo"
      />
      <button
        class="btn btn-outline-secondary btn-sm"
        @click="dateFrom = ''; dateTo = ''"
      >
        清除
      </button>
    </div>
    <div class="d-flex gap-2 mb-3 flex-wrap">
      <!-- 每個按鈕用 @click 設定 statusFilter 的值
       :class 根據目前選中的狀態切換「實心/空心」樣式 -->

      <button
        class="btn btn-sm"
        :class="statusFilter === 'ALL' ? 'btn-dark' : 'btn-outline-dark'"
        @click="statusFilter = 'ALL'"
      >
        全部 ({{ pickupGames.length }})
      </button>
      <button
        class="btn btn-sm"
        :class="statusFilter === 'OPEN' ? 'btn-success' : 'btn-outline-success'"
        @click="statusFilter = 'OPEN'"
      >
        🟢 開放中 ({{ pickupGames.filter((g) => getDisplayStatus(g) === 'OPEN').length }})
      </button>
      <button
        class="btn btn-sm"
        :class="statusFilter === 'FULL' ? 'btn-full' : 'btn-outline-full'"
        @click="statusFilter = 'FULL'"
      >
        🟡 已額滿 ({{ pickupGames.filter((g) => getDisplayStatus(g) === 'FULL').length }})
      </button>
      <button
        class="btn btn-sm"
        :class="statusFilter === 'CLOSED' ? 'btn-secondary' : 'btn-outline-secondary'"
        @click="statusFilter = 'CLOSED'"
      >
        ⚫ 已結束 ({{ pickupGames.filter((g) => getDisplayStatus(g) === 'CLOSED').length }})
      </button>
      <button
        class="btn btn-sm"
        :class="statusFilter === 'CANCELLED' ? 'btn-secondary' : 'btn-outline-secondary'"
        @click="statusFilter = 'CANCELLED'"
      >
        ⚪ 已取消 ({{ pickupGames.filter((g) => getDisplayStatus(g) === 'CANCELLED').length }})
      </button>
    </div>
    <!-- 批次操作列：只有勾選了至少一個時才顯示 -->
    <div v-if="selectedIds.length" class="d-flex gap-2 mb-3 align-items-center">
      <span class="text-muted small">已選 {{ selectedIds.length }} 筆</span>
      <button class="btn btn-outline-danger btn-sm" @click="batchCancel">
        <i class="bi bi-x-circle me-1"></i>批次取消
      </button>
    </div>
    <!-- ============ 表格 ============ -->
    <div class="table-responsive">
      <table class="table table-hover align-middle text-center">
        <thead class="table-dark">
          <tr>
            <th style="width: 40px">
              <input type="checkbox" @change="toggleSelectAll" />
            </th>
            <th>ID</th>
            <th>主揪</th>
            <th>場地</th>
            <th>日期</th>
            <th>時間</th>
            <th>人數</th>
            <th>程度</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <!-- 🔧 用 <template> 包住每場揪團的「資料列 + 展開列」
               這樣 v-for 才能一次產生兩個 <tr>（資料列 + 隱藏的報名列） -->
          <!-- 🔧 從 pickupGames 改成 paginatedGames -->
          <template v-for="game in paginatedGames" :key="game.gameId">
            <!-- 第一列：揪團資料 -->
            <tr>
              <td>
                <input type="checkbox" :value="game.gameId" v-model="selectedIds" />
              </td>
              <td>{{ game.gameId }}</td>
              <td>
                <div class="fw-bold">{{ game.host?.fullName }}</div>
                <div class="text-muted" style="font-size: 0.85em">
                  (ID: {{ game.host?.memberId }})
                </div>
              </td>
              <td>
                <div>{{ game.venue?.venueName }}</div>
                <div class="fw-bold">{{ game.court?.courtName }}</div>
              </td>
              <td class="fw-bold">{{ game.gameDate }}</td>
              <td>
                {{ game.startTime }} ~ <br />
                {{ game.endTime }}
              </td>
              <td>
                <span
                  class="badge rounded-pill px-3 py-2"
                  :class="
                    game.currentPlayers >= game.maxPlayers
                      ? 'bg-danger text-white'
                      : 'bg-info text-dark'
                  "
                >
                  {{ game.currentPlayers }} / {{ game.maxPlayers }}
                </span>
              </td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'bg-secondary': game.skillLevel === 'ALL',
                    'bg-success': game.skillLevel === 'BEGINNER',
                    'bg-primary': game.skillLevel === 'INTERMEDIATE',
                    'bg-danger': game.skillLevel === 'ADVANCED',
                  }"
                >
                  {{ skillMap[game.skillLevel] }}
                </span>
              </td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'bg-success': getDisplayStatus(game) === 'OPEN',
                    'badge-full': game.status === 'FULL',
                    'bg-dark': getDisplayStatus(game) === 'CLOSED',
                    'bg-secondary': getDisplayStatus(game) === 'CANCELLED',
                  }"
                >
                  {{ statusMap[getDisplayStatus(game)] }}
                </span>
              </td>
              <td>
                <div class="d-flex justify-content-center gap-2">
                  <!-- 查看/收合報名按鈕
                       @click 觸發 toggleSignups
                       按鈕文字和 icon 會根據「是否展開」動態切換 -->
                  <button
                    class="btn btn-sm"
                    :class="
                      expandedGameId === game.gameId ? 'btn-info text-white' : 'btn-outline-info'
                    "
                    @click="toggleSignups(game.gameId)"
                  >
                    <!-- 展開時：向下箭頭 + 收合報名 / 未展開時：播放鍵 + 查看報名 -->
                    <i
                      :class="
                        expandedGameId === game.gameId
                          ? 'bi bi-caret-down-fill'
                          : 'bi bi-caret-right-fill'
                      "
                      class="me-1"
                    ></i>
                    {{ expandedGameId === game.gameId ? '收合報名' : '查看報名' }}
                  </button>

                  <!-- ✏️ 鉛筆按鈕：加上 @click 填資料 + data-bs 開啟編輯 Modal -->
                  <button
                    class="btn btn-outline-primary btn-sm btn-action"
                    @click="openEditModal(game)"
                    data-bs-toggle="modal"
                    data-bs-target="#editGameModal"
                  >
                    <i class="bi bi-pencil-fill"></i>
                  </button>

                  <!-- 軟刪除cancelPickupGame -->
                  <button
                    class="btn btn-outline-danger btn-sm btn-action"
                    @click="cancelPickupGame(game)"
                  >
                    <i class="bi bi-x-circle-fill"></i>
                  </button>
                </div>
              </td>
            </tr>
            <!-- 第二列：報名名單（只有展開時才顯示）
                 v-if 判斷：這場揪團的 gameId 等於目前展開的 ID 時才渲染
                 colspan="10" 讓這一格橫跨整個表格的 10 個直欄 -->
            <tr v-if="expandedGameId === game.gameId">
              <td colspan="10" class="p-0 border-0">
                <div class="bg-light p-4 mx-2 mb-2 rounded-3">
                  <h6 class="fw-bold mb-3"><i class="bi bi-person-lines-fill me-2"></i>報名名單</h6>
                  <!-- 報名名單表格 -->
                  <table class="table table-sm table-bordered bg-white mb-3">
                    <thead class="table-secondary">
                      <tr>
                        <th>會員</th>
                        <th>狀態</th>
                        <th>報名時間</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- 從 signupsMap 中用 gameId 取出這場的報名資料
                           如果還沒抓到或是空的，就不會顯示任何列 -->
                      <tr v-for="s in signupsMap[game.gameId]" :key="s.signupId">
                        <td>{{ s.member?.fullName }}</td>
                        <td>
                          <span class="badge bg-success">{{
                            s.status === 'JOINED' ? '已加入' : s.status
                          }}</span>
                        </td>
                        <td>{{ s.signedUpAt }}</td>
                        <td>
                          <!-- 移除按鈕：點擊時用 SweetAlert2 跳出確認視窗 -->
                          <button
                            class="btn btn-outline-danger btn-sm"
                            @click="removeSignup(s.signupId, game.gameId, s.member?.fullName)"
                          >
                            <i class="bi bi-person-dash-fill"></i>
                          </button>
                        </td>
                      </tr>
                      <!-- 如果沒有報名資料，顯示提示文字 -->
                      <tr v-if="!signupsMap[game.gameId]?.length">
                        <td colspan="4" class="text-muted py-3">目前沒有報名紀錄</td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- 新增報名區 -->
                  <div class="d-flex gap-2 align-items-end" style="position: relative">
                    <div class="flex-grow-1" style="position: relative">
                      <input
                        type="text"
                        class="form-control"
                        v-model="signupKeyword"
                        @input="searchSignupMembers"
                        placeholder="輸入姓名或手機搜尋會員"
                      />
                      <!-- 搜尋結果下拉 -->
                      <ul
                        v-if="signupSearchResults.length"
                        class="list-group mt-1"
                        style="position: absolute; z-index: 1050; width: 100%"
                      >
                        <li
                          v-for="m in signupSearchResults"
                          :key="m.memberId"
                          class="list-group-item list-group-item-action"
                          style="cursor: pointer"
                          @click="selectSignupMember(m)"
                        >
                          {{ m.fullName }} ({{ m.username }}) - {{ m.phone }}
                        </li>
                      </ul>
                    </div>
                    <button class="btn btn-success text-nowrap" @click="addSignup(game.gameId)">
                      <i class="bi bi-person-plus-fill me-1"></i> 新增報名
                    </button>
                  </div>
                  <!-- 已選擇的會員提示 -->
                  <small v-if="selectedSignupMember" class="text-success d-block mt-1">
                    ✅ 已選擇：{{ selectedSignupMember.fullName }}
                  </small>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <!-- ============ 分頁控制列 ============ -->
    <div class="d-flex justify-content-between align-items-center mt-3">
      <!-- 左邊：顯示筆數資訊 -->
      <div class="text-muted small">
        共 {{ filteredGames.length }} 筆，第 {{ currentPage }} / {{ totalPages }} 頁
      </div>
      <!-- 中間：頁碼按鈕 -->
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <!-- 上一頁 -->
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="currentPage--">«</a>
          </li>
          <!-- 頁碼數字按鈕：v-for 產生 1 到 totalPages -->
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
          </li>
          <!-- 下一頁 -->
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="currentPage++">»</a>
          </li>
        </ul>
      </nav>
      <!-- 右邊：每頁筆數選擇 -->
      <div class="d-flex align-items-center gap-2">
        <label class="form-label mb-0 small text-muted">每頁</label>
        <select class="form-select form-select-sm" style="width: 80px" v-model.number="pageSize">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="30">30</option>
        </select>
        <span class="small text-muted">筆</span>
      </div>
    </div>
    <!-- ============ 新增揪團 Modal ============ -->
    <div class="modal fade" id="addGameModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-plus-circle-fill me-2 text-primary"></i>新增揪團
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form class="row g-3">
              <!-- 主揪搜尋：加上 icon-box -->
              <div class="col-12" style="position: relative">
                <div class="d-flex align-items-center mb-2">
                  <div class="icon-box me-2" style="background-color: rgba(13, 110, 253, 0.1)">
                    <i class="bi bi-person-fill text-primary"></i>
                  </div>
                  <label class="form-label fw-bold mb-0"
                    >主揪 <span class="text-danger">*</span></label
                  >
                </div>
                <input
                  type="text"
                  class="form-control"
                  v-model="memberKeyword"
                  @input="searchMembers"
                  placeholder="輸入姓名或手機搜尋會員"
                />
                <ul
                  v-if="memberResults.length"
                  class="list-group mt-1"
                  style="position: absolute; z-index: 1050; width: 100%"
                >
                  <li
                    v-for="m in memberResults"
                    :key="m.memberId"
                    class="list-group-item list-group-item-action"
                    style="cursor: pointer"
                    @click="selectMember(m)"
                  >
                    {{ m.fullName }} ({{ m.username }}) - {{ m.phone }}
                  </li>
                </ul>
                <small v-if="selectedMember" class="text-success d-block mt-1">
                  ✅ 已選擇：{{ selectedMember.fullName }} (ID: {{ selectedMember.memberId }})
                </small>
              </div>
              <!-- 場地 -->
              <div class="col-12">
                <div class="d-flex align-items-center mb-2">
                  <div class="icon-box me-2" style="background-color: rgba(25, 135, 84, 0.1)">
                    <i class="bi bi-geo-alt-fill text-success"></i>
                  </div>
                  <label class="form-label fw-bold mb-0"
                    >場地 <span class="text-danger">*</span></label
                  >
                </div>
                <select class="form-select" v-model="newGame.court.courtId">
                  <option :value="null" disabled>請選擇場地</option>
                  <option v-for="c in courts" :key="c.courtId" :value="c.courtId">
                    {{ c.venue?.venueName }} / {{ c.courtName }}
                  </option>
                </select>
              </div>
              <!-- 日期 -->
              <div class="col-12">
                <div class="d-flex align-items-center mb-2">
                  <div class="icon-box me-2" style="background-color: rgba(255, 193, 7, 0.15)">
                    <i class="bi bi-calendar-event-fill text-warning"></i>
                  </div>
                  <label class="form-label fw-bold mb-0"
                    >日期 <span class="text-danger">*</span></label
                  >
                </div>
                <input type="date" class="form-control" v-model="newGame.gameDate" :min="today" />
              </div>
              <!-- 開始時間 -->
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-2">
                  <div class="icon-box me-2" style="background-color: rgba(13, 202, 240, 0.15)">
                    <i class="bi bi-clock-fill text-info"></i>
                  </div>
                  <label class="form-label fw-bold mb-0"
                    >開始時間 <span class="text-danger">*</span></label
                  >
                </div>
                <select class="form-select" v-model="newGame.startTime">
                  <option value="" disabled>請選擇</option>
                  <option v-for="t in startTimeOptions" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <!-- 結束時間 -->
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-2">
                  <div class="icon-box me-2" style="background-color: rgba(13, 202, 240, 0.15)">
                    <i class="bi bi-clock-history text-info"></i>
                  </div>
                  <label class="form-label fw-bold mb-0"
                    >結束時間 <span class="text-danger">*</span></label
                  >
                </div>
                <select
                  class="form-select"
                  v-model="newGame.endTime"
                  :disabled="!newGame.startTime"
                >
                  <option value="" disabled v-if="!newGame.startTime">請先選擇開始時間</option>
                  <option value="" disabled v-else>請選擇結束時間</option>
                  <option v-for="t in endTimeOptions" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <!-- 最大人數 -->
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-2">
                  <div class="icon-box me-2" style="background-color: rgba(111, 66, 193, 0.1)">
                    <i class="bi bi-people-fill" style="color: #6f42c1"></i>
                  </div>
                  <label class="form-label fw-bold mb-0"
                    >最大人數 <span class="text-danger">*</span></label
                  >
                </div>
                <select class="form-select" v-model="newGame.maxPlayers">
                  <option
                    v-for="n in Array.from({ length: 11 }, (_, i) => i + 2)"
                    :key="n"
                    :value="n"
                  >
                    {{ n }} 人
                  </option>
                </select>
              </div>
              <!-- 程度要求 -->
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-2">
                  <div class="icon-box me-2" style="background-color: rgba(255, 193, 7, 0.15)">
                    <i class="bi bi-bar-chart-fill text-warning"></i>
                  </div>
                  <label class="form-label fw-bold mb-0">程度要求</label>
                </div>
                <select class="form-select" v-model="newGame.skillLevel">
                  <option value="ALL">不限</option>
                  <option value="BEGINNER">初級</option>
                  <option value="INTERMEDIATE">中級</option>
                  <option value="ADVANCED">高級</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-lg me-1"></i> 取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="createPickupGame"
              data-bs-dismiss="modal"
            >
              <i class="bi bi-check-lg me-1"></i> 儲存
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<!-- 🔧 加上 scoped 的 CSS，讓 icon-box 樣式只在這個元件內生效 -->
<style scoped>
.badge-full {
  background-color: #e8a317;
  color: #fff;
}
/* 🔧 篩選按鈕 - 已額滿（實心版：選中狀態用） */
.btn-full {
  background-color: #e8a317;
  border-color: #e8a317;
  color: white;
}
.btn-full:hover {
  background-color: #d19214;
  border-color: #d19214;
  color: white;
}
/* 🔧 篩選按鈕 - 已額滿（空心版：未選中狀態用） */
.btn-outline-full {
  color: #e8a317;
  border-color: #e8a317;
}
.btn-outline-full:hover {
  background-color: #e8a317;
  color: white;
}
/* 讓操作欄的按鈕等寬，排列更整齊 */
.btn-action {
  min-width: 36px;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.icon-box {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
