<template>
  <div class="presets-decks">
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

    <!-- 系统预组卡组 -->
    <div v-else class="decks-list">
      <template v-if="filteredDecks.length > 0">
        <PresetDeckComp
          v-for="deck in filteredDecks"
          :key="deck.id"
          :deck="deck"
          :showAdd="true"
          :showEdit="false"
          :showDel="false"
          @add="handleAddDeckToMy"
          @view="handleViewDeck"
        />
      </template>
      <div
        v-else-if="presetsDecks.length > 0 && filteredDecks.length === 0"
        class="search-no-results"
      >
        <p>没有匹配的卡组</p>
        <img src="" alt="空卡组提示" />
      </div>
      <div v-else-if="presetsDecks.length == 0" class="empty-state">
        <p>暂无系统预组卡组</p>
        <img src="" alt="空卡组提示" />
      </div>
    </div>

    <!-- 底部按钮 -->
    <van-button
      class="return-btn"
      type="primary"
      round
      icon="arrow-left"
      @click="returnHome"
    >
      返回首页
    </van-button>
  </div>
</template>
<script lang="ts" setup name="Presets">
import { ref, onMounted } from "vue";
import { showToast } from "vant";

import { useRoute, useRouter } from "vue-router";

import SearchBar from "@/components/SearchBar.vue";
import type { CardType } from "@/types";
import type { PresetDeck, DeckType } from "@/types/deck";
import PresetDeckComp from "@/components/Deck.vue";
import {
  getPresetsDecksApi,
  addPresetDeckToMyDecksApi,
} from "@/api/presetsDecksApi";

const router = useRouter();
// 搜索关键词
const keyword = ref("");
const searchMode = ref<"name" | "all">("name");
const searchOptions = [
  { text: "仅名称", value: "name" as const },
  { text: "全部字段", value: "all" as const },
];
const loading = ref(true);
const presetsDecks = ref<PresetDeck[]>([]); //
const filteredDecks = ref<PresetDeck[]>([]); // 搜索过滤后的卡组

// ------------------ 方法 ------------------
// 获取卡组
// const fetchDecks = async () => {
//   const res = await getPresetsDecksApi();
//   presetsDecks.value = res.data;
//   filterDecks();
// };

// 搜索过滤
const filterDecks = () => {
  const kw = (keyword.value || "").trim().toLowerCase();

  if (!kw) {
    // 没输入时，显示所有卡组
    filteredDecks.value = presetsDecks.value;
    return;
  }

  if (searchMode.value === "name") {
    // 仅匹配名称
    filteredDecks.value = presetsDecks.value.filter((deck) =>
      deck.name.toLowerCase().includes(kw)
    );
  } else {
    // 全局搜索（名称 + 描述）
    filteredDecks.value = presetsDecks.value.filter(
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
  filterDecks();
};

// 返回上一个页面
const returnHome = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/"); // 或者首页路径
  }
};

// 添加到我的卡组
const handleAddDeckToMy = async (deck: PresetDeck) => {
  console.log("准备添加预设卡组：", deck);

  try {
    const res = await addPresetDeckToMyDecksApi(deck);

    if (res.success) {
      showToast("已添加到我的卡组");
      // 这里如果需要的话，可以刷新我的卡组列表
      // await fetchMyDecks();
    } else {
      showToast(res.error || "添加失败");
    }
  } catch (err) {
    console.error("添加预设卡组出错：", err);
    showToast("添加失败，请稍后再试");
  }
};

// 查看卡组详情
const handleViewDeck = (deck: DeckType) => {
  if (!deck) {
    console.error("无效的卡组：", deck);
    return;
  }
  console.log("查看卡组详情：", deck);
  router.push({ name: "PresetsDeckDetail", params: { id: deck.id } });
};

onMounted(async () => {
  loading.value = true;
  try {
    const res = await getPresetsDecksApi();
    presetsDecks.value = res.data;
    filteredDecks.value = res.data;
  } catch (err) {
  } finally {
    loading.value = false;
  }
});
</script>
<style scoped lang="scss">
.presets-decks {
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
  .decks-list {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding-bottom: var(--van-tabbar-height);

    @media (min-width: 768px) {
      grid-template-columns: repeat(4, 1fr);
      padding-bottom: 12px;
    }
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

  .return-btn {
    position: fixed;
    bottom: 10px;
    left: 16px;
    z-index: 42;
  }
}
</style>
