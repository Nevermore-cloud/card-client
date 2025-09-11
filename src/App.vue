<template>
  <div id="app">
    <!-- 加载遮罩,后续可以换成更生动的加载动画（如纯 CSS Spinner 或轻量级 SVG 动画） -->
    <div v-if="loading" class="loading-mask">
      <div class="loading-text">Loading...</div>
    </div>
    <!-- 骨架屏 (Skeleton Screen) -->
    <!-- <AppSkeleton v-if="loading" /> -->

    <template v-if="!loading">
      <AppHeader v-if="showHeader" />
      <main class="main-container">
        <router-view />
      </main>
      <AppFooter v-if="showFooter" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
// 引入 useRoute 和 useRouter
import { useRoute, useRouter } from "vue-router";

const route = useRoute(); //获取当前路由信息
const router = useRouter(); // 获取 router 实例

const isMobile = ref(window.innerWidth < 768);
// loading 初始值为 true，阻止应用在路由就绪前渲染
const loading = ref(true);

// 监听屏幕尺寸变化
const updateDevice = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  window.addEventListener("resize", updateDevice);

  // 关键：等待路由完全准备就绪
  router.isReady().then(() => {
    // 当路由解析完第一个有效路由后，这个回调会执行
    // 此时 route.meta 中已经包含了正确的信息
    loading.value = false;
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateDevice);
});

// 这部分计算属性不需要修改，因为它们现在会在 loading.value 为 false 后才执行
const showFooter = computed(
  () => isMobile.value && route.meta.showFooter !== false
);
const showHeader = computed(
  () => !isMobile.value && route.meta.showHeader !== false
);
</script>

<style lang="scss">
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  .loading-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    .loading-text {
      font-size: 18px;
      color: #333;
      font-weight: bold;
    }
  }

  /* 主体内容 */
  .main-container {
    position: relative;
    flex: 1;
    // padding: 10px;

    // background: #f9f9f9;
    // background: linear-gradient(135deg, #f9fafc 0%, #eef3f8 100%);
    background: linear-gradient(135deg, #f9fafc 0%, #eef3f8 100%);

    /* PC端优化：内容居中，限制最大宽度 */
    @media (min-width: 768px) {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }
  }

  /* 底部导航：仅在移动端显示 */
  .mobile-footer {
    @media (min-width: 768px) {
      display: none;
    }
  }
}
</style>
