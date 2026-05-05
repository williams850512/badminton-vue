<script setup>
/**
 * 首頁 — 最新公告輪播 + 羽球比賽影片
 * 左側 col-lg-7：Bootstrap Carousel 輪播公告
 * 右側 col-lg-5：嵌入示意影片
 */
import { ref } from 'vue'

const announcements = ref([
  {
    id: 1,
    category: '活動公告',
    title: '夏季羽球聯賽報名正式開始',
    summary: '獎金金額達五萬元，趕快邀請你的最佳球友一起參加這場年度盛事吧！',
    date: '2024/05/20',
    image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be2?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 2,
    category: '場館動態',
    title: '場館二期燈光升級工程完工',
    summary: '為了提供更好的比賽環境，我們已完成全面換裝 LED 專業照明光照明。',
    date: '2024/05/18',
    image: 'https://images.unsplash.com/photo-1626224580194-ff9601fe0674?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 3,
    category: '優惠通知',
    title: '端午連假場地優惠 — 全面 8 折',
    summary: '端午節連假期間預約場地，享有全面 8 折優惠！快來揪團打球吧！',
    date: '2024/05/15',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=400&auto=format&fit=crop',
  },
])
</script>

<template>
  <section class="mb-5">
    <h2 class="section-title">最新公告與精彩影片</h2>

    <div class="row g-4">
      <!-- 左側：公告輪播 -->
      <div class="col-lg-7">
        <div
          id="announcementCarousel"
          class="carousel slide card-rounded-lg shadow-sm overflow-hidden"
          data-bs-ride="carousel"
        >
          <div class="carousel-indicators">
            <button
              v-for="(item, index) in announcements"
              :key="item.id"
              type="button"
              data-bs-target="#announcementCarousel"
              :data-bs-slide-to="index"
              :class="{ active: index === 0 }"
              :aria-label="`Slide ${index + 1}`"
            ></button>
          </div>

          <div class="carousel-inner">
            <div
              v-for="(item, index) in announcements"
              :key="item.id"
              class="carousel-item"
              :class="{ active: index === 0 }"
            >
              <div class="position-relative" style="height: 340px;">
                <img :src="item.image" class="d-block w-100 h-100" style="object-fit: cover;" :alt="item.title" />
                <div class="position-absolute bottom-0 start-0 end-0 p-4" style="background: linear-gradient(to top, rgba(0,0,0,0.75), transparent);">
                  <span class="badge badge-teal mb-2">{{ item.category }}</span>
                  <h5 class="text-white fw-bold mb-1">{{ item.title }}</h5>
                  <p class="text-white-50 mb-1" style="font-size: 0.8rem;">{{ item.summary }}</p>
                  <small class="text-white-50">{{ item.date }}</small>
                </div>
              </div>
            </div>
          </div>

          <button class="carousel-control-prev" type="button" data-bs-target="#announcementCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#announcementCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
          </button>
        </div>
      </div>

      <!-- 右側：影片 -->
      <div class="col-lg-5">
        <div class="card-rounded-lg shadow-sm overflow-hidden bg-dark d-flex align-items-center justify-content-center" style="height: 340px;">
          <video
            class="w-100 h-100"
            style="object-fit: cover;"
            autoplay
            muted
            loop
            playsinline
            poster="https://images.unsplash.com/photo-1626224580194-ff9601fe0674?q=80&w=600&auto=format&fit=crop"
          >
            <!-- 使用 Unsplash 的示意圖作為 poster，因為沒有真實影片檔 -->
            <!-- TODO: 替換為真實羽球比賽影片 -->
            <source src="" type="video/mp4" />
          </video>
          <!-- 無影片時的替代顯示 -->
          <div class="position-absolute text-center text-white p-4">
            <i class="bi bi-play-circle display-1 mb-3 d-block" style="opacity: 0.8;"></i>
            <h5 class="fw-bold">精彩賽事回顧</h5>
            <p class="text-white-50 mb-0" style="font-size: 0.85rem;">觀看羽過天晴最新比賽精華</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
