<template>
  <div class="deck-item">
    <!-- 封面图 -->
    <div class="deck-cover" @click="handleView">
      <img
        v-if="deck.coverImage"
        :src="deck.coverImage"
        :alt="deck.name"
        class="cover-img"
      />
      <div v-else class="cover-placeholder">无封面</div>
    </div>

    <!-- 卡组信息 -->
    <div class="deck-info">
      <h3 class="deck-name">{{ deck.name }}</h3>
      <p class="deck-desc">{{ deck.description || "暂无描述" }}</p>
      <p class="deck-count">卡牌数：{{ deck.cardIds?.length ?? 0 }}</p>
    </div>

    <!-- 操作按钮 -->
    <div class="deck-actions">
      <van-icon
        name="add"
        size="18"
        class="action-btn"
        @click.stop="handleAdd"
        v-if="showAdd"
      />
      <van-icon
        name="edit"
        size="18"
        class="action-btn"
        @click.stop="handleEdit"
        v-if="showEdit"
      />
      <van-icon
        name="delete"
        size="18"
        class="action-btn"
        @click.stop="handleDelete"
        v-if="showDel"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { UserDeck, PresetDeck, DeckType } from "@/types/deck";
import { useRoute } from "vue-router";

// 获取当前路由对象
const route = useRoute();
console.log("当前路由：", route.fullPath);

// const props = defineProps<{ deck: UserDeck }>();
const props = defineProps<{
  deck: DeckType;
  showAdd?: boolean;
  showEdit?: boolean;
  showDel?: boolean;
}>();

const emit = defineEmits<{
  (e: "view", deck: DeckType): void;
  (e: "edit", deck: UserDeck): void;
  (e: "delete", deck: UserDeck): void;
  (e: "add", deck: PresetDeck): void;
}>();

// 类型守卫
const isUserDeck = (d: DeckType): d is UserDeck => d.entityType === "userDeck";
const isPresetDeck = (d: DeckType): d is PresetDeck =>
  d.entityType === "presetDeck";

const handleView = () => {
  // console.log("点击卡组：", props.deck);
  emit("view", props.deck);
};

const handleEdit = () => {
  // console.log("编辑卡组：", props.deck);
  if (!isUserDeck(props.deck)) return; // 或者提示不可编辑
  emit("edit", props.deck);
};

const handleDelete = () => {
  // console.log("删除卡组：", props.deck);
  if (!isUserDeck(props.deck)) return; // 或者提示不可编辑
  emit("delete", props.deck);
};

// 将预设卡组添加到我的卡组中
const handleAdd = () => {
  if (!isPresetDeck(props.deck)) return; // 如果不是预设卡组，就不触发
  emit("add", props.deck);
};
</script>

<style scoped lang="scss">
.deck-item {
  position: relative;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .deck-cover {
    width: 100%;
    height: 120px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    aspect-ratio: 4 / 3; // 统一比例
    overflow: hidden;

    .cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    &:hover img {
      transform: scale(1.05);
    }

    .cover-placeholder {
      color: #999;
      font-size: 14px;
    }
  }

  .deck-info {
    padding: 8px 10px;
    flex: 1;

    .deck-name {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: #333;
    }
    .deck-desc {
      font-size: 12px;
      color: #888;
      line-height: 1.4;

      display: -webkit-box;
      -webkit-box-orient: vertical;
      // 注意兼容
      -webkit-line-clamp: 2;
      overflow: hidden;
      margin: 0;

      height: 33.6px;
    }
    .deck-count {
      font-size: 12px;
      color: #999;
    }
  }

  .deck-actions {
    position: absolute;
    top: 6px;
    right: 6px;
    display: flex;
    gap: 6px;

    .action-btn {
      font-size: 18px;
      color: #666;
      border-radius: 50%;
      padding: 4px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      background: rgba(255, 255, 255, 0.9);
      &:hover {
        background: #f5f5f5;
      }
    }
  }
}
</style>
