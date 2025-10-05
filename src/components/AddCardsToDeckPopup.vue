<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '80%' }"
    @closed="resetState"
  >
    <div class="add-card-popup">
      <!-- 顶部：搜索栏 + 关闭按钮 -->
      <div class="popup-top">
        <van-icon name="cross" class="close-icon" @click="closePopup" />

        <SearchBar
          v-model="keyword"
          v-model:searchMode="searchMode"
          :options="searchOptions"
          @search="handleSearch"
        />
      </div>

      <!-- 中间：卡牌区域 -->
      <div class="popup-middle">
        <!-- 加载动画 -->
        <div v-if="loading" class="loading-state">
          <van-loading type="spinner" size="24px">加载中...</van-loading>
        </div>

        <!-- 卡牌网格 -->
        <div v-else class="cards-grid">
          <template v-if="filteredCards.length > 0">
            <div
              v-for="card in filteredCards"
              :key="card.id"
              class="card-wrapper"
              :class="{ selected: isSelected(card.id) }"
              @click="toggleSelect(card.id)"
            >
              <Card :card="card" :showDelete="false" />
            </div>
          </template>

          <!-- 没有结果 -->
          <div
            v-else-if="myCards.length > 0 && filteredCards.length === 0"
            class="search-no-results"
          >
            <p>没有匹配的卡牌</p>
          </div>

          <!-- 还没有卡牌 -->
          <div v-else-if="myCards.length === 0" class="empty-state">
            <p>您还没有卡牌，快去添加吧！</p>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="popup-bottom">
        <van-button
          type="primary"
          block
          :disabled="filteredCards.length === 0"
          @click="selectAll"
        >
          全选
        </van-button>
        <van-button
          type="default"
          block
          :disabled="filteredCards.length === 0"
          @click="unselectAll"
        >
          取消全选
        </van-button>
        <van-button
          type="success"
          block
          :disabled="filteredCards.length === 0"
          @click="handleAdd"
        >
          添加
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { showToast } from "vant";
import SearchBar from "@/components/SearchBar.vue";
import Card from "@/components/Card.vue";
import { getMyAllCardsApi } from "@/api/cardApi";
import type { CardType } from "@/types";

// props 和 emits
const props = defineProps<{
  show: boolean;
  deckId: number; // 当前卡组id
}>();
const emit = defineEmits<{
  (e: "update:show", val: boolean): void;
  (e: "submit", payload: { deckId: number; cardIds: number[] }): void;
}>();

// 弹窗显隐
const visible = ref<boolean>(props.show);
watch(
  () => props.show,
  (val) => {
    visible.value = val;
  }
);
watch(visible, (val) => {
  emit("update:show", val);
  if (val) {
    resetState();
  }
});

// 搜索
const keyword = ref("");
const searchMode = ref<"name" | "all">("name");
const searchOptions = [
  { text: "仅名称", value: "name" as const },
  { text: "全部字段", value: "all" as const },
];

// 数据
const loading = ref(true);
const myCards = ref<CardType[]>([]);
const filteredCards = ref<CardType[]>([]);

// 选中状态管理（只存 id，保持独立性）
const selectedIds = ref<Set<number>>(new Set());

// --- 方法 ---
const filterCards = () => {
  const kw = (keyword.value || "").trim().toLowerCase();
  if (!kw) {
    filteredCards.value = myCards.value;
    return;
  }
  if (searchMode.value === "name") {
    filteredCards.value = myCards.value.filter((d) =>
      d.name.toLowerCase().includes(kw)
    );
  } else {
    filteredCards.value = myCards.value.filter(
      (d) =>
        d.name.toLowerCase().includes(kw) ||
        (d.description || "").toLowerCase().includes(kw)
    );
  }
};
const handleSearch = (val: string) => {
  keyword.value = val;
  filterCards();
};

// 卡牌选择逻辑
const toggleSelect = (id: number) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.add(id);
  }
};
const isSelected = (id: number) => selectedIds.value.has(id);

const selectAll = () => {
  filteredCards.value.forEach((c) => selectedIds.value.add(c.id));
};
const unselectAll = () => {
  selectedIds.value.clear();
};

// 点击添加
const handleAdd = async () => {
  if (selectedIds.value.size <= 0) {
    showToast("还没选择卡牌");
    return;
  }
  const ids = Array.from(selectedIds.value);
  console.log("添加到卡组：", props.deckId, "卡牌id:", ids);

  // 把事件发给父组件
  emit("submit", { deckId: props.deckId, cardIds: ids });

  // TODO: 这里调用添加 API
  // try {
  //   const res = await addCardsToMyDecksApi(props.deckId, ids);
  //   if (res.success && !res.error) {
  //     showToast("添加卡牌成功");
  //   } else {
  //     showToast(res.error);
  //   }
  // } catch (err) {
  // } finally {
  // }
};

// 弹窗关闭
const closePopup = () => {
  visible.value = false;
};

// 重置状态
const resetState = () => {
  keyword.value = "";
  searchMode.value = "name";
  filteredCards.value = [...myCards.value];
  selectedIds.value.clear();
};

// 初始化数据
onMounted(async () => {
  loading.value = true;
  try {
    const res = await getMyAllCardsApi();
    myCards.value = res.data;
    filteredCards.value = [...res.data];
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.add-card-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.popup-top {
  position: relative;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;

  .close-icon {
    position: absolute;
    left: 12px;
    top: 20px;
    font-size: 20px;
    color: #666;
    border: 1px solid #666;
    border-radius: 50%;
  }
}

.popup-middle {
  flex: 1;
  overflow-y: auto;
  padding: 12px;

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr); // 两列
    gap: 12px;
  }

  .card-wrapper {
    border: 2px solid transparent;
    border-radius: 12px;
    transition: border 0.2s;

    &.selected {
      border-color: orange;
    }
  }
}

.popup-bottom {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #eee;

  .van-button {
    flex: 1;
  }
}

.search-no-results,
.empty-state {
  text-align: center;
  color: #888;
  margin-top: 40px;
}
</style>
