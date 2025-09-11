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
  </div>
</template>
<script lang="ts" setup name="Presets">
import { ref, onMounted } from "vue";
import { showToast, showConfirmDialog } from "vant";
import { useRoute, useRouter } from "vue-router";

import SearchBar from "@/components/SearchBar.vue";
import Card from "@/components/Card.vue";
import type { CardType } from "@/types";

// 搜索关键词
const keyword = ref("");
const searchMode = ref<"name" | "all">("name");
const searchOptions = [
  { text: "仅名称", value: "name" as const },
  { text: "全部字段", value: "all" as const },
];
const loading = ref(true);

// 搜索关键词变化
const handleSearch = (val: string) => {
  console.log("搜索关键词：", val);
  keyword.value = val;
};

onMounted(async () => {});
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
}
</style>
