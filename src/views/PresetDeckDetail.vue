<template>
  <div class="presets-deck-card">
    <!-- 搜索栏 -->
    <SearchBar
      v-model="keyword"
      v-model:searchMode="searchMode"
      :options="searchOptions"
      @search="handleSearch"
    />

    <!-- 加载动画 -->
    <div v-if="loading" class="loading-state">
      <van-loading type="spinner" size="24px">加载中...</van-loading>
    </div>

    <!-- 卡组卡牌列表 -->
    <div v-else class="cards-list">
      <template v-if="filteredCards.length > 0">
        <Card
          v-for="(card, index) in filteredCards"
          :key="card.id + index"
          :idx="index"
          :card="card"
          :showDelete="false"
          @view="handleViewCard"
        />
      </template>
      <div
        v-else-if="deckCards.length > 0 && filteredCards.length === 0"
        class="search-no-results"
      >
        <p>没有匹配的卡牌</p>
        <img src="" alt="空卡组提示" />
      </div>
      <div v-else-if="deckCards.length == 0" class="empty-state">
        <p>您还没有卡牌，快去添加吧！</p>
        <img src="" alt="空卡组提示" />
      </div>
    </div>

    <!-- 工具栏按钮 -->
    <div class="all-tool-btn">
      <!-- 返回我的卡组 -->
      <div class="return-my-decks">
        <van-button
          class="return-btn"
          type="primary"
          round
          icon="arrow-left"
          @click="handleReturnMyDecks"
        >
          返回卡组
        </van-button>
      </div>
    </div>

    <!-- 卡牌详情弹窗 -->
    <CardDetailDialog
      v-model:show="showDetailDialog"
      :cards="filteredCards"
      :initialIndex="currentCardIndex"
    />
  </div>
</template>
<script lang="ts" setup name="MyDeckDetail">
import { ref, onMounted } from "vue";
//  showConfirmDialog
import { showToast } from "vant";
import { useRoute, useRouter } from "vue-router";

import SearchBar from "@/components/SearchBar.vue";
import Card from "@/components/Card.vue";
import type { CardType } from "@/types";

import { getCardsByDeckIdApi } from "@/api/systemCardsApi";
import { removeCardFromMyDecksApi, addCardsToMyDecksApi } from "@/api/decksApi";
import CardDetailDialog from "@/components/CardDetailDialog.vue";

const route = useRoute();
const router = useRouter();
const deckId = ref<number>(-1);
// 搜索关键词
const keyword = ref("");
const searchMode = ref<"name" | "all">("name");
const searchOptions = [
  { text: "仅名称", value: "name" as const },
  { text: "全部字段", value: "all" as const },
];
const loading = ref(true);
const deckCards = ref<CardType[]>([]); //卡组卡牌
const filteredCards = ref<CardType[]>([]); // 搜索过滤后的卡牌
// 详情弹窗部分
const showDetailDialog = ref(false);
const currentCardIndex = ref(0);

// ------------------ 方法 ------------------
// 获取卡组卡牌
const fetchDeckCards = async () => {
  deckId.value = Number(route.params.id); // 这里拿到 URL 里的 id
  const res = await getCardsByDeckIdApi(deckId.value);
  deckCards.value = res.data;
  filterCards();
};

const filterCards = () => {
  const kw = (keyword.value || "").trim().toLowerCase();
  if (!kw) {
    // 没输入时，显示所有卡牌
    filteredCards.value = deckCards.value;
    return;
  }
  if (searchMode.value === "name") {
    // 仅匹配名称
    filteredCards.value = deckCards.value.filter((deck) =>
      deck.name.toLowerCase().includes(kw)
    );
  } else {
    // 全局搜索（名称 + 描述）
    filteredCards.value = deckCards.value.filter(
      (d) =>
        d.name.toLowerCase().includes(kw) ||
        (d.description || "").toLowerCase().includes(kw)
    );
  }
};
// 搜索关键词变化
const handleSearch = (val: string) => {
  console.log("搜索关键词：", val);
  keyword.value = val;
  filterCards();
};

// 回到我的卡组
const handleReturnMyDecks = () => {
  console.log("返回我的卡组");
  router.back();
};

// 查看卡牌详情
const handleViewCard = async (card: CardType, idx?: number) => {
  // console.log("序号", idx);
  // console.log("查看卡牌详情", card);
  // console.log(filteredCards.value);
  currentCardIndex.value = idx ?? 0;
  currentCardIndex.value = filteredCards.value.findIndex(
    (c) => c.id === card.id
  );
  if (currentCardIndex.value === -1) currentCardIndex.value = 0;
  showDetailDialog.value = true;
};

onMounted(async () => {
  loading.value = true;
  deckId.value = Number(route.params.id); // 👈 这里拿到 URL 里的 id
  console.log("当前卡组 ID:", deckId.value);
  try {
    const res = await getCardsByDeckIdApi(deckId.value);
    deckCards.value = res.data;
    filteredCards.value.splice(0, deckCards.value.length, ...res.data);
    // filteredCards.value = res.data;
    console.log(deckCards.value);
  } catch (error) {
    // console.error("获取卡组失败：", error);
  } finally {
    loading.value = false;
  }
});
</script>
<style scoped lang="scss">
.presets-deck-card {
  padding: 20px;
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;

  .loading-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .cards-list {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding-bottom: var(--van-tabbar-height);

    @media (min-width: 768px) {
      grid-template-columns: repeat(4, 1fr);
      padding-bottom: 12px;
    }
    .search-no-results,
    .empty-state {
      text-align: center;
      color: #999;
      font-size: 14px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .add-btn {
      position: fixed;
      bottom: 80px;
      right: 16px;
      z-index: 100;
    }
  }

  .all-tool-btn {
    position: fixed;
    z-index: 42;
    bottom: 10px;
    left: 0;
    width: 100%;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    // background-color: #999;
    box-sizing: border-box;
  }
}
</style>
