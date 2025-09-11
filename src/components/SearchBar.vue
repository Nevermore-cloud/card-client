<template>
  <div :class="['top-search-bg', { active: showTopBg }]"></div>

  <div class="search-bar-wrapper">
    <div class="search-bar">
      <!-- 搜索输入框 -->
      <van-search
        v-model.trim="localKeyword"
        placeholder="搜索"
        show-action
        @cancel="onCancel"
      />

      <!-- 搜索模式选择下拉 默认是name，暂时在卡牌库页面有这个 -->
      <van-dropdown-menu v-if="showDropdown">
        <van-dropdown-item
          v-model="localMode"
          :options="options"
          @change="onModeChange"
        />
      </van-dropdown-menu>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import { ref, watch, onMounted, onUnmounted } from "vue";
// 引入响应式和防抖
import { debounce } from "@/utils/debounce";
import throttle from "lodash/throttle"; // 引入 lodash 的节流函数

// 顶部搜索栏背景显示
// 节流滚动事件，避免频繁触发
const showTopBg = ref(false);
const route = useRoute();
const showDropdown = ref(false); // 仅卡牌页显示下拉
// 吸顶滚动监听
const handleScroll = throttle(() => {
  // 当前滚动距离大于 0 显示背景
  showTopBg.value = (window.scrollY || document.documentElement.scrollTop) > 0;
  // console.log("滚动位置", window.scrollY);
}, 60);

// Props：父组件传入 v-model 和搜索选项
const props = defineProps<{
  modelValue: string; // 绑定关键词
  searchMode: "name" | "all"; // 搜索模式
  options: { text: string; value: "name" | "all" }[]; // 下拉选项
}>();

// Emits：向父组件派发事件
const emit = defineEmits<{
  (e: "update:modelValue", val: string): void;
  (e: "update:searchMode", val: "name" | "all"): void;
  (e: "search", val: string): void;
}>();

// 内部响应式，用于防抖处理
// 内部状态，与 props 初始化，这部分是正确的
const localKeyword = ref(props.modelValue ?? "");
const localMode = ref(props.searchMode);

// 【核心修改】监听 localKeyword 的变化
watch(localKeyword, (newKeyword) => {
  // 1. 实时通知父组件更新 v-model绑定的值
  // 这一步是实现 v-model 双向绑定的关键
  emit("update:modelValue", newKeyword);
  // 2. 调用防抖函数，准备触发 search 事件
  emitSearch(newKeyword);
});

// 【修改】这个 watch 仍然有用，用于当父组件从外部修改 keyword 时，同步到子组件
watch(
  () => props.modelValue,
  (newVal) => {
    // 避免不必要地覆盖用户正在输入的内容
    if (newVal !== localKeyword.value) {
      localKeyword.value = newVal;
    }
  }
);

// 监听父组件 mode 更新
watch(
  () => props.searchMode,
  (val) => {
    localMode.value = val;
  }
);

watch(
  () => route.name,
  (currentPageName) => {
    showDropdown.value = currentPageName === "Cards";
  },
  { immediate: true } // 立即执行一次
);

// 防抖回调：延迟派发 search 事件
const emitSearch = debounce((val: string) => {
  // console.log("执行防抖搜索:", val);
  emit("search", val.trim());
}, 300);

// 搜索模式改变事件
const onModeChange = (val: "name" | "all") => {
  emit("update:searchMode", val);
};

const onCancel = () => {
  localKeyword.value = "";
  emit("update:modelValue", "");
  emit("search", "");
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped lang="scss">
.top-search-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 54px;
  background-color: #fff;
  transition: opacity 0.2s ease;
  opacity: 0;
  pointer-events: none;
  z-index: 20;
  border-bottom: 1px solid #eee;
  &.active {
    opacity: 1;
  }
  @media (min-width: 768px) {
    display: none;
  }
}
.search-bar-wrapper {
  position: sticky;
  top: 0;
  z-index: 42;
  padding: 0px 2px 2px;

  .search-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
    width: 100%;

    .van-search {
      flex: 1;
    }
    .van-dropdown-menu {
      width: 120px;
      border-radius: 12px;
    }
  }
}
</style>
