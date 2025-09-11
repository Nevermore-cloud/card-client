<template>
  <van-dialog>
    <SearchBar
      v-model="keyword"
      v-model:searchMode="searchMode"
      :options="searchOptions"
      @search="handleSearch"
    />
  </van-dialog>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";

import SearchBar from "@/components/SearchBar.vue";
import { getMyAllCardsApi } from "@/api/cardApi";

// 搜索关键词
const keyword = ref("");
const searchMode = ref<"name" | "all">("name");
const searchOptions = [
  { text: "仅名称", value: "name" as const },
  { text: "全部字段", value: "all" as const },
];

// 搜索关键词变化
const handleSearch = (val: string) => {
  console.log("搜索关键词：", val);
  keyword.value = val;
  //   filterCards();
};
</script>
<style lang="scss" scoped></style>
