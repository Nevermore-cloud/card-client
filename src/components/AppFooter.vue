<template>
  <van-tabbar v-model="active">
    <van-tabbar-item icon="home-o" @click="goTo('')">首页</van-tabbar-item>
    <van-tabbar-item icon="cluster-o" @click="goTo('my-decks')"
      >卡组</van-tabbar-item
    >
    <van-tabbar-item icon="notes-o" @click="goTo('cards')"
      >卡牌库</van-tabbar-item
    >
    <van-tabbar-item icon="setting-o" @click="goTo('settings')"
      >设置</van-tabbar-item
    >
  </van-tabbar>
</template>

<script setup lang="ts">
// import { ref } from 'vue'
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
// 路由路径 → tab 索引
const routeToIndex: Record<string, number> = {
  "/": 0,
  "/my-decks": 1,
  "/cards": 2,
  "/settings": 3,
};

const active = computed({
  get: () => routeToIndex[route.path] ?? 0,
  set: (val) => {
    const path = Object.keys(routeToIndex).find(
      (key) => routeToIndex[key] === val
    );
    if (path) router.push(path); // 修改 active 会跳转路由
  },
});

const goTo = (path: string) => {
  // 跳转到对应路由
  router.push(`/${path}`);
};
</script>

<style scoped>
/* 可以在这里加背景色或者固定底部 */
</style>
