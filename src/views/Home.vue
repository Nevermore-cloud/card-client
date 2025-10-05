<template>
  <div class="home">
    <!-- 顶部标题 -->
    <div class="home-header">
      <h1 class="home-title">知卡</h1>
      <p class="home-subtitle">像收集卡牌一样收集知识</p>
    </div>

    <!-- 核心功能入口 -->
    <div class="main-section">
      <!-- <p class="section-title">核心功能</p> -->
      <van-grid :column-num="2" clickable class="main-grid">
        <van-grid-item
          v-for="item in mainItems"
          :key="item.path"
          :icon="item.icon"
          :text="item.text"
          class="main-item"
          @click="goTo(item.path)"
        />
      </van-grid>
    </div>

    <!-- 辅助功能入口 -->
    <div class="sub-section">
      <p class="sub-title">更多功能</p>
      <van-grid :column-num="2" clickable>
        <van-grid-item
          v-for="item in subItems"
          :key="item.path"
          :icon="item.icon"
          :text="item.text"
          class="sub-item"
          @click="goTo(item.path)"
        />
      </van-grid>
    </div>
  </div>
</template>

<script setup lang="ts" name="Home">
import { useRouter } from "vue-router";
import { onMounted } from "vue";

// ------------------ 状态 ------------------
// ------------------ 这段代码是后端没接才加上的 ------------------
import { getMyDecksApi } from "@/api/decksApi";
onMounted(async () => {
  console.log("首页获取卡组...");
  try {
    await getMyDecksApi();
    // myDecks.value.splice(0, myDecks.value.length, ...res.data);
  } catch (error) {
    console.error("获取卡组失败：", error);
  } finally {
  }
});
// ------------------ 状态 ------------------

const router = useRouter();
const mainItems = [
  { icon: "cluster", text: "我的卡组", path: "my-decks" },
  { icon: "notes-o", text: "我的卡牌库", path: "cards" },
];
const subItems = [
  { icon: "apps-o", text: "预设卡组", path: "presets" },
  { icon: "contact", text: "个人中心", path: "mine" },
  // { icon: "setting-o", text: "设置", path: "settings" },
];

const goTo = (path: string) => {
  router.push(`/${path}`);
};
</script>

<style scoped lang="scss">
.home {
  text-align: center;
  padding: 16px;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc, #eef3f9);

  .home-header {
    margin: 24px 0;

    .home-title {
      font-size: 22px;
      font-weight: bold;
      color: #333;
    }

    .home-subtitle {
      font-size: 14px;
      color: #888;
      margin-top: 4px;
    }
  }

  /* 核心功能入口 */
  .main-section {
    .main-grid {
      .main-item {
        border-radius: 16px !important;
        background: linear-gradient(135deg, #ffffff, #f3f6fb) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        &:active {
          transform: scale(0.96);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          // background-color: #3333 !important;
        }

        span {
          margin-top: 6px;
          font-weight: 500;
          color: #555;
        }
      }
    }
  }

  /* 辅助功能区 */
  .sub-section {
    margin-top: 24px;
    text-align: left;

    .sub-title {
      font-size: 14px;
      font-weight: bold;
      color: #666;
      margin: 8px 0 12px 4px;
    }

    .sub-item {
      border-radius: 12px !important;
      background: #fff !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      opacity: 0.75; // 视觉弱化
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:active {
        transform: scale(0.96);
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
      }

      span {
        margin-top: 4px;
        color: #888;
      }
    }
  }
}
</style>
