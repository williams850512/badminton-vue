<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { memberApi } from '@/api/member'

const router = useRouter()
const cart = useCartStore()

const SHIPPING_THRESHOLD = 1000
const SHIPPING_FEE = 100

function shippingFee() {
  return cart.total >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
}

function grandTotal() {
  return cart.total + shippingFee()
}

function atStockMax(item) {
  return Number.isFinite(item.stock) && item.qty >= item.stock
}

// ===================== 登入檢查 + 彈跳登入視窗 =====================
const showLoginModal = ref(false)
const loginUsername = ref('')
const loginPassword = ref('')
const loginError = ref('')
const loginLoading = ref(false)
const showPassword = ref(false)

function isLoggedIn() {
  return !!localStorage.getItem('memberToken')
}

// 「前往結帳」：已登入直接結帳，未登入先彈登入視窗
function goCheckout() {
  if (isLoggedIn()) {
    router.push('/checkout')
  } else {
    loginError.value = ''
    showLoginModal.value = true
  }
}

function closeLoginModal() {
  showLoginModal.value = false
}

function fillTestAccount() {
  loginUsername.value = 'chen.weijie'
  loginPassword.value = 'pass123'
}

// 視窗內登入：寫入與 MemberLogin 相同的 localStorage key，成功後自動接著去結帳
async function submitLogin() {
  if (!loginUsername.value.trim() || !loginPassword.value.trim()) {
    loginError.value = '請輸入帳號和密碼'
    return
  }
  loginLoading.value = true
  loginError.value = ''
  try {
    const res = await memberApi.login(loginUsername.value.trim(), loginPassword.value)
    localStorage.setItem('memberToken', res.token)
    localStorage.setItem('memberInfo', JSON.stringify(res.member))
    showLoginModal.value = false
    router.push('/checkout')
  } catch (err) {
    if (err.response?.status === 401) {
      loginError.value = '帳號或密碼錯誤，請重新輸入'
    } else {
      loginError.value = '系統連線異常，請稍後再試'
    }
  } finally {
    loginLoading.value = false
  }
}
</script>

<template>
  <div class="cart-page">

    <!-- ====== 麵包屑 ====== -->
    <div class="breadcrumb-bar">
      <div class="breadcrumb-inner">
        <span class="bc-item bc-link" @click="router.push('/')">首頁</span>
        <i class="bi bi-chevron-right bc-sep"></i>
        <span class="bc-item bc-link" @click="router.push('/products')">商品</span>
        <i class="bi bi-chevron-right bc-sep"></i>
        <span class="bc-item bc-active">購物車</span>
      </div>
    </div>

    <!-- ====== 主體 ====== -->
    <div class="cart-container">
      <h2 class="cart-page-title">
        <i class="bi bi-cart3 me-2"></i>購物車
        <span class="cart-count-chip">{{ cart.count }} 件</span>
      </h2>

      <!-- 空購物車 -->
      <div v-if="cart.items.length === 0" class="empty-state">
        <i class="bi bi-cart-x empty-icon"></i>
        <p class="empty-text">購物車還沒有商品</p>
        <button class="btn-go-shop" @click="router.push('/products')">
          <i class="bi bi-bag me-2"></i>前往選購
        </button>
      </div>

      <!-- 有商品 -->
      <div v-else class="cart-layout">

        <!-- 左欄：商品清單 -->
        <div class="cart-items-col">
          <div class="cart-items-card">

            <!-- 表頭 -->
            <div class="items-header">
              <span>商品</span>
              <span>單價</span>
              <span>數量</span>
              <span>小計</span>
              <span></span>
            </div>

            <!-- 商品列 -->
            <div v-for="item in cart.items" :key="item.id" class="item-row">
              <!-- 圖片 + 名稱 -->
              <div class="item-product">
                <div class="item-img">
                  <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
                  <i v-else class="bi bi-image"></i>
                </div>
                <p class="item-name">{{ item.name }}</p>
              </div>

              <!-- 單價 -->
              <p class="item-unit-price">${{ item.price.toLocaleString() }}</p>

              <!-- 數量 -->
              <div class="qty-control">
                <button class="qty-btn" @click="cart.decrease(item.id)">
                  <i class="bi bi-dash"></i>
                </button>
                <span class="qty-num">{{ item.qty }}</span>
                <button class="qty-btn" :disabled="atStockMax(item)" @click="cart.increase(item.id)">
                  <i class="bi bi-plus"></i>
                </button>
              </div>

              <!-- 小計 -->
              <p class="item-subtotal">${{ (item.price * item.qty).toLocaleString() }}</p>

              <!-- 刪除 -->
              <button class="item-remove" @click="cart.remove(item.id)">
                <i class="bi bi-trash3"></i>
              </button>
            </div>

          </div>

          <!-- 清空購物車 -->
          <div class="clear-bar">
            <button class="clear-btn" @click="cart.clear()">
              <i class="bi bi-trash3 me-1"></i>清空購物車
            </button>
          </div>
        </div>

        <!-- 右欄：訂單摘要 -->
        <div class="summary-col">
          <div class="summary-card">
            <h5 class="summary-title">訂單摘要</h5>

            <div class="summary-row">
              <span>商品小計</span>
              <span>${{ cart.total.toLocaleString() }}</span>
            </div>

            <div class="summary-row">
              <span>
                運費
                <span v-if="cart.total < SHIPPING_THRESHOLD" class="shipping-hint">
                  （滿 ${{ SHIPPING_THRESHOLD.toLocaleString() }} 免運）
                </span>
                <span v-else class="shipping-free">免運！</span>
              </span>
              <span :class="shippingFee() === 0 ? 'text-success fw-semibold' : ''">
                {{ shippingFee() === 0 ? '免費' : `$${SHIPPING_FEE}` }}
              </span>
            </div>

            <!-- 免運進度條 -->
            <div v-if="cart.total < SHIPPING_THRESHOLD" class="shipping-progress-wrap">
              <div class="shipping-progress-bar">
                <div
                  class="shipping-progress-fill"
                  :style="{ width: Math.min((cart.total / SHIPPING_THRESHOLD) * 100, 100) + '%' }"
                ></div>
              </div>
              <p class="shipping-progress-hint">
                再購買 ${{ (SHIPPING_THRESHOLD - cart.total).toLocaleString() }} 即可免運
              </p>
            </div>

            <hr class="summary-divider" />

            <div class="summary-total-row">
              <span>合計</span>
              <span class="summary-total-price">${{ grandTotal().toLocaleString() }}</span>
            </div>

            <button class="checkout-btn" @click="goCheckout">
              <i class="bi bi-credit-card me-2"></i>前往結帳
            </button>

            <button class="continue-btn" @click="router.push('/products')">
              <i class="bi bi-arrow-left me-1"></i>繼續購物
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ====== 信任卡片 ====== -->
    <div class="trust-bar">
      <div class="trust-card">
        <i class="bi bi-shop-window trust-icon"></i>
        <p class="trust-title">球館自取</p>
        <p class="trust-desc">打球順便取貨</p>
      </div>
      <div class="trust-card">
        <i class="bi bi-shield-check trust-icon"></i>
        <p class="trust-title">品質保證</p>
        <p class="trust-desc">原廠授權商品</p>
      </div>
      <div class="trust-card">
        <i class="bi bi-arrow-repeat trust-icon"></i>
        <p class="trust-title">七天鑑賞</p>
        <p class="trust-desc">不滿意七天內隨時退換</p>
      </div>
    </div>

    <!-- ====== 登入彈窗（未登入按「前往結帳」時出現） ====== -->
    <div v-if="showLoginModal" class="login-modal-overlay" @click.self="closeLoginModal">
      <div class="login-modal">
        <button class="login-modal-close" @click="closeLoginModal" aria-label="關閉">
          <i class="bi bi-x-lg"></i>
        </button>

        <div class="login-modal-header">
          <div class="login-modal-icon">
            <i class="bi bi-feather"></i>
          </div>
          <h3 class="login-modal-title">登入後即可結帳</h3>
          <p class="login-modal-sub">登入會員帳號以繼續完成訂單</p>
        </div>

        <div v-if="loginError" class="login-modal-error">
          <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ loginError }}
        </div>

        <form @submit.prevent="submitLogin">
          <div class="login-field">
            <label class="login-label">帳號</label>
            <input
              v-model="loginUsername"
              type="text"
              class="login-input"
              placeholder="請輸入您的帳號"
              autocomplete="off"
            />
          </div>
          <div class="login-field">
            <label class="login-label">密碼</label>
            <div class="login-pwd-wrap">
              <input
                v-model="loginPassword"
                :type="showPassword ? 'text' : 'password'"
                class="login-input"
                placeholder="請輸入您的密碼"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="login-pwd-toggle"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="login-submit-btn" :disabled="loginLoading">
            <span v-if="loginLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loginLoading ? '登入中...' : '登入並繼續結帳' }}
          </button>
          <button type="button" class="login-test-btn" @click="fillTestAccount">
            <i class="bi bi-lightning-fill me-1"></i>帶入測試帳號
          </button>
        </form>

        <div class="login-modal-footer">
          還不是會員？
          <a href="#" class="login-register-link" @click.prevent="router.push('/register')">立即註冊</a>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ===== 整體 ===== */
.cart-page {
  min-height: 100vh;
  background: var(--brand-bg);
}

/* ===== Navbar ===== */
.cart-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}
.back-btn {
  background: transparent;
  border: 1.5px solid var(--brand-teal);
  border-radius: 0.6rem;
  color: var(--brand-teal);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.back-btn:hover {
  background: var(--brand-teal);
  color: white;
}

/* ===== 麵包屑 ===== */
.breadcrumb-bar {
  background: white;
  border-bottom: 1px solid #E2E8F0;
}
.breadcrumb-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
}
.bc-item { color: #94A3B8; }
.bc-link { cursor: pointer; transition: color 0.15s; }
.bc-link:hover { color: var(--brand-sky); }
.bc-active { color: var(--brand-dark); font-weight: 600; }
.bc-sep { font-size: 0.65rem; color: #CBD5E1; }

/* ===== 主體容器 ===== */
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}
.cart-page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--brand-dark);
  margin-bottom: 1.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.cart-count-chip {
  font-size: 0.78rem;
  font-weight: 700;
  background: #F1F5F9;
  color: #64748B;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  margin-left: 0.25rem;
}

/* ===== 空狀態 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 1rem;
  gap: 1rem;
}
.empty-icon { font-size: 4rem; color: #CBD5E1; }
.empty-text { font-size: 1rem; color: #94A3B8; margin: 0; }
.btn-go-shop {
  background: linear-gradient(135deg, var(--brand-sky), var(--brand-teal));
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.7rem 1.75rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-go-shop:hover { opacity: 0.88; }

/* ===== 兩欄佈局 ===== */
.cart-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.75rem;
  align-items: start;
}
@media (max-width: 900px) {
  .cart-layout { grid-template-columns: 1fr; }
}

/* ===== 商品清單卡片 ===== */
.cart-items-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
}
.items-header {
  display: grid;
  grid-template-columns: 1fr 100px 130px 100px 40px;
  gap: 1rem;
  padding: 0.85rem 1.5rem;
  background: #1E293B;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}
.item-row {
  display: grid;
  grid-template-columns: 1fr 100px 130px 100px 40px;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #F1F5F9;
  transition: background 0.15s;
}
.item-row:last-child { border-bottom: none; }
.item-row:hover { background: #F8FAFC; }

/* 商品欄 */
.item-product {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}
.item-img {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 0.6rem;
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #CBD5E1;
  overflow: hidden;
}
.item-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}
.item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--brand-dark);
  margin: 0;
  line-height: 1.4;
}
.item-unit-price {
  font-size: 0.88rem;
  color: #64748B;
  margin: 0;
}
.item-subtotal {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--brand-teal-dark);
  margin: 0;
}

/* 數量 */
.qty-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.qty-btn {
  width: 30px;
  height: 30px;
  border: 1.5px solid #E2E8F0;
  border-radius: 0.4rem;
  background: white;
  color: #475569;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.qty-btn:hover {
  border-color: var(--brand-sky);
  color: var(--brand-sky);
  background: #F0F9FF;
}
.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.qty-btn:disabled:hover {
  border-color: #E2E8F0;
  color: #475569;
  background: white;
}
.qty-num {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--brand-dark);
  min-width: 24px;
  text-align: center;
}

/* 刪除 */
.item-remove {
  background: transparent;
  border: none;
  color: #CBD5E1;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}
.item-remove:hover { color: #EF4444; }

/* 清空 */
.clear-bar {
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
}
.clear-btn {
  background: transparent;
  border: none;
  color: #94A3B8;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: color 0.15s;
}
.clear-btn:hover { color: #EF4444; }

/* ===== 訂單摘要 ===== */
.summary-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 1.5rem;
  position: sticky;
  top: 80px;
}
.summary-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--brand-dark);
  margin-bottom: 1.25rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.875rem;
  color: #64748B;
  margin-bottom: 0.85rem;
  gap: 0.5rem;
}
.shipping-hint { font-size: 0.72rem; color: #94A3B8; }
.shipping-free { font-size: 0.72rem; color: #10B981; font-weight: 700; }

/* 免運進度條 */
.shipping-progress-wrap { margin-bottom: 0.85rem; }
.shipping-progress-bar {
  height: 6px;
  background: #F1F5F9;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.4rem;
}
.shipping-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand-sky), var(--brand-teal));
  border-radius: 9999px;
  transition: width 0.4s ease;
}
.shipping-progress-hint {
  font-size: 0.72rem;
  color: #94A3B8;
  margin: 0;
  text-align: right;
}

.summary-divider { border-color: #F1F5F9; margin: 1rem 0; }
.summary-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  color: var(--brand-dark);
  font-size: 0.95rem;
  margin-bottom: 1.25rem;
}
.summary-total-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--brand-teal-dark);
}

.checkout-btn {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(135deg, var(--brand-sky), var(--brand-teal));
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-bottom: 0.75rem;
}
.checkout-btn:hover { opacity: 0.88; }

.continue-btn {
  width: 100%;
  padding: 0.75rem;
  background: white;
  border: 1.5px solid #E2E8F0;
  border-radius: 0.75rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}
.continue-btn:hover {
  border-color: var(--brand-dark);
  color: var(--brand-dark);
}

/* ===== 信任卡片 ===== */
.trust-bar {
  max-width: 1200px;
  margin: 0 auto 3rem;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.trust-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 1.5rem 1rem;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.trust-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}
.trust-icon {
  font-size: 1.8rem;
  background: linear-gradient(135deg, var(--brand-sky), var(--brand-teal));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
  margin-bottom: 0.6rem;
}
.trust-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--brand-dark);
  margin: 0 0 0.25rem;
}
.trust-desc {
  font-size: 0.78rem;
  color: #94A3B8;
  margin: 0;
}
@media (max-width: 600px) {
  .trust-bar { grid-template-columns: 1fr; }
}

/* ===== 手機版 ===== */
@media (max-width: 767px) {
  .items-header { display: none; }
  .item-row {
    grid-template-columns: 1fr;
    gap: 0.6rem;
    padding: 1rem;
  }
  .item-product { flex-direction: column; align-items: flex-start; }
  .item-unit-price::before { content: '單價：'; color: #94A3B8; font-size: 0.75rem; }
  .item-subtotal::before { content: '小計：'; color: #94A3B8; font-size: 0.75rem; }
  .item-remove { justify-self: end; }
}

/* ===== 登入彈窗 ===== */
.login-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.login-modal {
  position: relative;
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 400px;
  padding: 2rem 1.75rem 1.75rem;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
  animation: loginFadeUp 0.25s ease;
}
@keyframes loginFadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.login-modal-close {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  background: transparent;
  border: none;
  color: #94A3B8;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color 0.15s;
}
.login-modal-close:hover { color: var(--brand-dark); }
.login-modal-header { text-align: center; margin-bottom: 1.25rem; }
.login-modal-icon {
  width: 52px;
  height: 52px;
  border-radius: 1rem;
  background: linear-gradient(135deg, var(--brand-sky), var(--brand-teal));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  margin: 0 auto 0.75rem;
}
.login-modal-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--brand-dark);
  margin: 0 0 0.25rem;
}
.login-modal-sub {
  font-size: 0.82rem;
  color: #94A3B8;
  margin: 0;
}
.login-modal-error {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
  font-size: 0.82rem;
  padding: 0.6rem 0.85rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
.login-field { margin-bottom: 0.85rem; }
.login-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748B;
  margin-bottom: 0.35rem;
}
.login-input {
  width: 100%;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  padding: 0.6rem 0.85rem;
  font-size: 0.9rem;
  color: var(--brand-dark);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.login-input:focus {
  border-color: var(--brand-teal);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}
.login-pwd-wrap { position: relative; }
.login-pwd-wrap .login-input { padding-right: 42px; }
.login-pwd-toggle {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  padding: 0.35rem;
  line-height: 1;
}
.login-submit-btn {
  width: 100%;
  margin-top: 0.4rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--brand-sky), var(--brand-teal));
  color: white;
  border: none;
  border-radius: 0.6rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.login-submit-btn:hover:not(:disabled) { opacity: 0.9; }
.login-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.login-test-btn {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.55rem;
  background: white;
  border: 2px dashed #E2E8F0;
  border-radius: 0.6rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}
.login-test-btn:hover { border-color: var(--brand-teal); color: var(--brand-teal); }
.login-modal-footer {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.82rem;
  color: #94A3B8;
}
.login-register-link {
  color: var(--brand-teal);
  font-weight: 700;
  text-decoration: none;
  margin-left: 0.25rem;
}
.login-register-link:hover { text-decoration: underline; }
</style>
