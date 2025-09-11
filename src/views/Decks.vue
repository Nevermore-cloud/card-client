<template>
  <div class="my-decks">
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

    <!-- 卡组列表 -->
    <div v-else class="decks-list">
      <template v-if="filteredDecks.length > 0">
        <MyDeck
          v-for="deck in filteredDecks"
          :key="deck.id"
          :deck="deck"
          @view="handleViewDeck"
          @edit="handleEditDeck"
          @delete="handleDeleteDeck"
        />
      </template>
      <div
        v-else-if="myDecks.length > 0 && filteredDecks.length === 0"
        class="search-no-results"
      >
        <p>没有匹配的卡组</p>
        <img src="" alt="空卡组提示" />
      </div>
      <div v-else-if="myDecks.length == 0" class="empty-state">
        <p>您还没有卡组，快去添加吧！</p>
        <img src="" alt="空卡组提示" />
      </div>
    </div>

    <!-- 新建卡组按钮 -->
    <van-button
      class="add-btn"
      type="primary"
      round
      icon="plus"
      @click="handleCreateDeck"
    >
      新建卡组
    </van-button>

    <!-- 卡组表单弹窗 -->
    <!-- 添加 / 编辑弹窗 -->
    <DeckFormDialog
      v-model:show="showDialog"
      :deck="editingDeck"
      :isEdit="isEdit"
      @save="handleSave"
    />
  </div>
</template>

<script lang="ts" setup name="Decks">
import { ref, onMounted } from "vue";
import { showToast, showConfirmDialog } from "vant";
import SearchBar from "@/components/SearchBar.vue";
import MyDeck from "@/components/Deck.vue";
import DeckFormDialog from "@/components/DeckFormDialog.vue";
import type { UserDeck } from "@/types/deck";
import {
  getMyDecksApi,
  createMyDecksApi,
  updateMyDecksInfoApi,
  deleteMyDecksApi,
} from "@/api/decksApi";
import { useRouter } from "vue-router";

// ------------------ 状态 ------------------
const router = useRouter();
// 搜索关键词
const keyword = ref("");
const searchMode = ref<"name" | "all">("name");
const searchOptions = [
  { text: "仅名称", value: "name" as const },
  { text: "全部字段", value: "all" as const },
];
const loading = ref(true);
const myDecks = ref<UserDeck[]>([]); // 我的所有卡组
const filteredDecks = ref<UserDeck[]>([]); // 搜索过滤后的卡组

// 弹窗状态
const showDialog = ref(false);
const editingDeck = ref<UserDeck | null>(null);
const isEdit = ref(false);

// ------------------ 方法 ------------------
// 获取卡组
const fetchDecks = async () => {
  const res = await getMyDecksApi();
  myDecks.value = res.data;
  filterDecks();
};

// 搜索过滤
const filterDecks = () => {
  const kw = (keyword.value || "").trim().toLowerCase();

  if (!kw) {
    // 没输入时，显示所有卡组
    filteredDecks.value = myDecks.value;
    return;
  }

  if (searchMode.value === "name") {
    // 仅匹配名称
    filteredDecks.value = myDecks.value.filter((deck) =>
      deck.name.toLowerCase().includes(kw)
    );
  } else {
    // 全局搜索（名称 + 描述）
    filteredDecks.value = myDecks.value.filter(
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

// console.log("新建卡组");
const handleCreateDeck = () => {
  console.log("新建卡组");
  editingDeck.value = null;
  isEdit.value = false;
  showDialog.value = true;
};

// // 编辑卡组
const handleEditDeck = (deck: UserDeck) => {
  console.log("编辑卡组：", deck);
  editingDeck.value = deck; // 注意：DeckFormDialog 内部会拷贝一份，不会改原数据
  isEdit.value = true;
  showDialog.value = true;
};

// 点击保存（来自弹窗）
const handleSave = async (deck: Partial<UserDeck>) => {
  if (isEdit.value) {
    // 编辑
    if (!deck.id) return; // 安全检查
    await updateMyDecksInfoApi(deck.id, {
      name: deck.name ?? "",
      description: deck.description ?? "",
      coverImage: deck.coverImage ?? "",
    });
    showToast("编辑成功");
  } else {
    // 添加
    await createMyDecksApi({
      name: deck.name ?? "",
      description: deck.description ?? "",
      coverImage: deck.coverImage ?? "",
      cardIds: [], // 必填字段补上 默认新建卡组为空
    });
    showToast("添加成功");
  }
  // 重新获取最新卡组并过滤
  await fetchDecks();
};

// 删除卡组
const handleDeleteDeck = async (deck: UserDeck) => {
  console.log("删除卡组：", deck);
  try {
    await showConfirmDialog({
      title: "提示",
      message: `确定删除卡组【${deck.name}】吗？`,
    });
    const res = await deleteMyDecksApi(deck.id);
    if (res.success) {
      showToast("删除成功");
      await fetchDecks();
    } else {
      showToast("删除失败");
    }
  } catch {
    // 用户点了取消
  }
};

// 查看卡组详情
const handleViewDeck = (deck: UserDeck) => {
  if (!deck) {
    console.error("无效的卡组：", deck);
    return;
  }
  console.log("查看卡组详情：", deck);
  router.push({ name: "MyDeckDetail", params: { id: deck.id } });
};

// ------------------ 生命周期 ------------------
onMounted(async () => {
  loading.value = true;
  console.log("进入我的卡组页面，加载数据...");
  try {
    const res = await getMyDecksApi();
    // myDecks.value.splice(0, myDecks.value.length, ...res.data);
    myDecks.value = res.data;
    filteredDecks.value = res.data;
  } catch (error) {
    console.error("获取卡组失败：", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.my-decks {
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

  .add-btn {
    position: fixed;
    bottom: 80px;
    right: 16px;
    z-index: 42;
  }
}
</style>
