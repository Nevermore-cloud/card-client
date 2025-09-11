<template>
  <van-dialog
    v-model:show="visible"
    :show-cancel-button="false"
    :show-confirm-button="false"
    close-on-click-overlay
    class="card-detail-dialog"
  >
    <!-- 右上角自定义关闭按钮（圆形 + 叉） -->
    <button class="close-btn" @click="closeDialog" aria-label="关闭卡牌详情">
      <span class="x">✕</span>
    </button>

    <!-- 卡牌主要内容 -->
    <div class="card-content" v-if="currentCard">
      <h3 class="card-name">{{ currentCard.name }}</h3>

      <!-- 可滚动的描述区域 -->
      <div class="card-description" ref="descriptionEl">
        <p v-if="currentCard.description?.length">
          {{ currentCard.description }}
        </p>
        <p v-else class="no-desc">暂无描述</p>
      </div>

      <!-- 关键词 / 标签 -->
      <div class="card-keywords">
        <template v-if="currentCard.keywords?.length">
          <van-tag
            v-for="(kw, i) in currentCard.keywords"
            :key="i"
            type="primary"
            plain
            class="keyword-tag"
          >
            {{ kw }}
          </van-tag>
        </template>
        <span v-else class="no-tags">暂无标签</span>
      </div>

      <!-- 当前索引 / 总数 提示 -->
      <div class="index-indicator" v-if="cards.length > 1">
        {{ currentIndex + 1 }} / {{ cards.length }}
      </div>
    </div>

    <!-- 底部左右箭头 -->
    <div v-if="cards.length > 1" class="arrow-container">
      <button
        class="nav-arrow"
        :class="{ disabled: isFirst }"
        @click="prevCard"
        :aria-disabled="isFirst"
        title="上一张"
      >
        ‹
      </button>
      <button
        class="nav-arrow"
        :class="{ disabled: isLast }"
        @click="nextCard"
        :aria-disabled="isLast"
        title="下一张"
      >
        ›
      </button>
    </div>
  </van-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed, nextTick } from "vue";
import type { CardType } from "@/types/card";

const props = defineProps<{
  show: boolean;
  cards: CardType[];
  initialIndex?: number;
}>();

const emit = defineEmits<{
  (e: "update:show", val: boolean): void;
}>();

const visible = ref<boolean>(props.show);
watch(
  () => props.show,
  (v) => (visible.value = v)
);
watch(visible, (v) => emit("update:show", v));

const cards = computed(() => props.cards || []);

const safeInitialIndex = (n?: number) => {
  const i = typeof n === "number" && !Number.isNaN(n) ? Math.floor(n) : 0;
  return Math.min(Math.max(i, 0), Math.max(cards.value.length - 1, 0));
};

const currentIndex = ref<number>(safeInitialIndex(props.initialIndex));
watch(visible, (val) => {
  emit("update:show", val);
  if (val) {
    // 每次打开弹窗时重置为点击的卡牌索引
    currentIndex.value = safeInitialIndex(props.initialIndex);
    scrollDescriptionToTop();
  }
});

watch(
  () => cards.value.length,
  (len) => {
    if (len === 0) {
      currentIndex.value = 0;
    } else if (currentIndex.value >= len) {
      currentIndex.value = len - 1;
    }
  }
);

const currentCard = computed<CardType | null>(() => {
  if (!cards.value.length) return null;
  return cards.value[currentIndex.value] ?? null;
});

const isFirst = computed(() => currentIndex.value <= 0);
const isLast = computed(() => currentIndex.value >= cards.value.length - 1);

const descriptionEl = ref<HTMLElement | null>(null);

const scrollDescriptionToTop = async () => {
  await nextTick();
  if (descriptionEl.value) {
    descriptionEl.value.scrollTop = 0;
  }
};

const prevCard = () => {
  if (isFirst.value) return;
  currentIndex.value = Math.max(0, currentIndex.value - 1);
  scrollDescriptionToTop();
};

const nextCard = () => {
  if (isLast.value) return;
  currentIndex.value = Math.min(cards.value.length - 1, currentIndex.value + 1);
  scrollDescriptionToTop();
};

const closeDialog = () => {
  visible.value = false;
};
</script>

<style scoped lang="scss">
.card-detail-dialog {
  border-radius: 12px;
  padding: 20px;
  position: relative;
  max-width: 720px;
  width: calc(100vw - 40px);
  min-height: 60vh; // ✅ 高度加高但不过分
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  //   overflow: visible !important;

  .van-dialog__content {
    padding: 0;
    width: 100%;
  }

  /* 右上角关闭按钮 */
  .close-btn {
    position: absolute;
    top: -12px;
    right: -12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);

    .x {
      font-size: 16px;
      line-height: 1;
      color: #333;
      transform: translateY(-1px);
    }
  }

  /* 卡片内容 */
  .card-content {
    width: 100%;
    max-width: 560px;
    box-sizing: border-box;
    text-align: left;
    padding: 16px 24px;
    border-radius: 10px;
    background: #ffffff;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
    min-height: 53vh; // ✅ 内容区高度固定，避免切换时闪动
    display: flex;
    flex-direction: column;

    .card-name {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 700;
      color: #111827;
    }

    .card-description {
      flex: 1;
      max-height: 260px;
      overflow-y: auto;
      padding-right: 8px;
      margin-bottom: 12px;
      color: #4b5563;
      font-size: 14px;
      line-height: 1.6;
      background: #fbfdff;
      border-radius: 8px;
      padding: 12px;
      border: 1px solid #f0f4f8;

      p {
        margin: 0;
        white-space: pre-wrap;
      }

      .no-desc {
        color: #9ca3af;
        font-style: italic;
      }
    }

    .card-keywords {
      margin-top: 8px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .keyword-tag {
        font-size: 12px;
        padding: 0 6px;
      }

      .no-tags {
        font-size: 12px;
        color: #9ca3af;
        font-style: italic;
      }
    }

    .index-indicator {
      margin-top: 12px;
      text-align: center;
      color: #9ca3af;
      font-size: 13px;
    }
  }

  /* 底部箭头容器 */
  .arrow-container {
    margin-top: 16px;
    display: flex;
    justify-content: center;
    gap: 32px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    .nav-arrow {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: #ffffff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      font-size: 28px;
      color: #1677ff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover:not(.disabled) {
        background: #f0f7ff;
      }

      &.disabled {
        color: #cfcfcf;
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }

  /* 小屏幕适配 */
  @media (max-width: 640px) {
    .card-content {
      padding: 12px;
    }

    .card-description {
      max-height: 40vh;
    }

    .arrow-container {
      .nav-arrow {
        width: 42px;
        height: 42px;
        font-size: 24px;
      }
    }

    .close-btn {
      width: 32px;
      height: 32px;
    }
  }
}
</style>
