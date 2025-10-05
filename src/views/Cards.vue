<template>
  <div class="card-library">
    <!-- 顶部搜索栏背景 -->
    <div :class="['top-search-bg', { active: showTopBg }]"></div>

    <!-- 搜索栏 -->
    <div class="search-bar-wrapper">
      <div class="search-bar">
        <van-search
          v-model.trim="keyword"
          placeholder="搜索我的卡牌"
          show-action
          @input="handleSearch"
        />

        <!-- 搜索模式选择 -->
        <van-dropdown-menu>
          <van-dropdown-item v-model="searchMode" :options="searchOptions" />
        </van-dropdown-menu>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <van-loading type="spinner" size="24px">加载中...</van-loading>
    </div>

    <!-- 空状态 -->
    <div v-else-if="myCards.length === 0" class="empty-state-tip">
      <p>您还没有卡牌，快去添加吧！</p>
      <img src="" alt="空卡牌提示" />
    </div>

    <!-- 卡牌展示区 -->
    <div v-else class="card-grid">
      <Card
        v-for="card in filteredCards"
        :key="card.id"
        :card="card"
        :showDelete="showDelete"
        @view="handleViewCard"
        @edit="handleEditCard"
        @delete="handleDeleteCard"
      />
    </div>

    <!-- 添加卡牌按钮 -->
    <van-button
      class="add-btn"
      type="primary"
      round
      icon="plus"
      @click="handleAddCard"
    >
      添加卡牌
    </van-button>

    <!-- 卡牌弹窗 -->
    <CardDialog @save="handleSaveCard" />
  </div>
</template>

<script lang="ts" setup name="Cards">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { debounce } from "@/utils/debounce"; // 导入防抖函数
import Card from "@/components/Card.vue";
import CardDialog from "@/components/CardDialog.vue";
import type { CardType } from "@/types";
import throttle from "lodash/throttle"; // 引入 lodash 的节流函数
import {
  getMyAllCardsApi,
  deleteCardApi,
  updateCardApi,
  addCardApi,
} from "@/api/cardApi";
import { showToast } from "vant";
import { useCardDialogStore } from "@/stores/cardDialog";

const store = useCardDialogStore();

const loading = ref(false); // 模拟加载状态
const showDelete = ref(true);
const myCards = ref<CardType[]>([]); // 卡牌数据（初始模拟数据）

// 搜索相关
const keyword = ref("");
const searchMode = ref<"name" | "all">("name");
const searchOptions = [
  { text: "仅名称", value: "name" as const },
  { text: "全部字段", value: "all" as const },
];
// 默认只搜 name，将来可以切换到 all

// 顶部搜索栏背景显示
// 节流滚动事件，避免频繁触发
const showTopBg = ref(false);
// 吸顶滚动监听
const handleScroll = throttle(() => {
  // 当前滚动距离大于 0 显示背景
  showTopBg.value = (window.scrollY || document.documentElement.scrollTop) > 0;
  // console.log("滚动位置", window.scrollY);
}, 60);

// 匹配函数：根据搜索模式判断某张卡片是否匹配关键词
// mode: "name" 只按名称搜索，"all" 按名称+描述+关键词搜索，
// matchCard 专门负责判断一张卡是否匹配 → 逻辑清晰、可扩展。
const matchCard = (card: CardType, kw: string, mode: string) => {
  // 按名称搜索
  if (mode === "name") {
    return card.name.includes(kw);
  }
  // 按“全部字段”搜索：名称 + 描述 + 关键词
  if (mode === "all") {
    return (
      card.name.includes(kw) ||
      card.description.includes(kw) ||
      card.keywords.some((k) => k.includes(kw))
    );
  }
  // 如果出现未知的模式，默认返回 false
  return false;
};

// 过滤后的卡牌（根据搜索关键字实时筛选）
// 计算属性：返回经过搜索过滤后的卡片列表
// filteredCards 只管「什么时候全返回，什么时候过滤」。
const filteredCards = computed(() => {
  // 去掉搜索词前后空格，避免因为用户输入空格导致结果为空
  const kw = keyword.value.trim();
  // 如果没有关键词，直接返回所有卡片
  if (!kw) return myCards.value;
  // 用 matchCard 判断每张卡是否匹配搜索条件
  return myCards.value.filter((c) => matchCard(c, kw, searchMode.value));
});

// 事件回调
// 搜索回调
// 防抖搜索函数：延迟更新 keyword，避免每次输入都触发计算
const handleSearch = debounce((val: string) => {
  console.log("搜索:", val);
  // keyword.value = val; // v-model 已经双向绑定，不必再赋值
}, 300);

// 查看卡牌详情 → 打开弹窗 view 模式
const handleViewCard = async (card: CardType) => {
  console.log("查看卡牌详情", card);
  // 先确保列表已经是最新状态
  const currentList = [...myCards.value];
  store.openView(card, currentList);

  console.log(store.index, store.list.length, store.hasPrev, store.hasNext);
};

// 编辑卡牌 → 打开弹窗 edit 模式
const handleEditCard = (card: CardType) => {
  console.log("编辑卡牌", card);
  store.openEdit(card, myCards.value);
};

// 添加卡牌 → 打开弹窗 create 模式
const handleAddCard = () => {
  console.log("添加新卡牌");
  store.openCreate();
};

// 本地删除（临时方案）
// 删除卡牌
const handleDeleteCard = async (id: number) => {
  // 可选：弹窗确认
  const confirmed = window.confirm("确定删除这张卡牌吗？");
  // const confirmDelete = confirm("确认删除该卡牌吗？");
  if (!confirmed) return;

  //  前端模拟删除
  // myCards.value = myCards.value.filter((c) => c.id !== id);
  // showToast({ type: "success", message: "删除成功" });
  // 后续可调用后端接口
  try {
    await deleteCardApi(id);
    myCards.value = myCards.value.filter((c) => c.id !== id); // 更新本地状态
    showToast({ type: "success", message: "删除成功" });
    // 这里可根据返回结果再更新 myCards 或显示提示

    // 如果弹窗正在查看此卡牌，关闭弹窗
    if (store.currentCard?.id === id) {
      store.close();
    }
  } catch (error) {
    showToast({ type: "fail", message: "删除失败" });
    // 可选：失败时回滚本地数据
    // myCards.value.push(deletedCard);
  } finally {
  }
};

// 保存卡牌 → 编辑/新增
const handleSaveCard = async (card: CardType) => {
  console.log("保存卡牌", card);
  try {
    if (card.id === -1) {
      // 新增
      const newCard = await addCardApi(card);
      myCards.value.push(newCard);
    } else {
      // 编辑
      await updateCardApi(card);
      const index = myCards.value.findIndex((c) => c.id === card.id);
      if (index >= 0) myCards.value[index] = { ...card };
    }
    showToast({ type: "success", message: "保存成功" });
  } catch (err) {
    showToast({ type: "fail", message: "保存失败" });
  }
};

onMounted(async () => {
  loading.value = true;
  // 模拟加载完成
  console.log("模拟加载完成");
  try {
    const res = await getMyAllCardsApi();
    myCards.value = res.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }

  window.addEventListener("scroll", handleScroll);
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
<style scoped lang="scss">
.card-library {
  padding: 20px;
  position: relative;
  min-height: 100vh;

  .top-search-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 52px;
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
    z-index: 50;
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

  .loading-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .empty-state-tip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #999;
    font-size: 14px;
    padding: 40px 0;
    img {
      margin-top: 12px;
      max-width: 120px;
      opacity: 0.6;
    }
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding-bottom: var(--van-tabbar-height);
    position: relative;

    @media (min-width: 768px) {
      grid-template-columns: repeat(4, 1fr);
      padding-bottom: 12px;
    }
  }

  .add-btn {
    position: fixed;
    bottom: 80px;
    right: 16px;
    z-index: 100;
  }
}
</style>
