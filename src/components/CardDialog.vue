<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '80%' }"
  >
    <div class="card-dialog">
      <!-- 弹窗标题 -->
      <h3 class="dialog-title">{{ dialogTitle }}</h3>

      <!-- ========== 查看模式 ========== -->
      <div v-if="isViewMode" class="view-mode">
        <h4>{{ currentCard?.name }}</h4>
        <div class="keywords">
          <van-tag
            v-for="(kw, i) in currentCard?.keywords"
            :key="i"
            type="primary"
          >
            {{ kw }}
          </van-tag>
        </div>
        <p class="desc">{{ currentCard?.description }}</p>

        <!-- 左右切换箭头 -->
        <!-- 左右切换箭头 -->
        <div v-if="canNavigate" class="nav-arrows">
          <div
            @click="hasPrev ? prev() : null"
            :class="['nav-arrow', 'nav-prev', { 'nav-disabled': !hasPrev }]"
          >
            <img
              src="@/assets/icons/arrow-left.svg"
              alt="上一页"
              class="nav-arrow-icon"
            />
          </div>
          <div
            @click="hasNext ? next() : null"
            :class="['nav-arrow', 'nav-next', { 'nav-disabled': !hasNext }]"
          >
            <img
              src="@/assets/icons/arrow-right.svg"
              alt="下一页"
              class="nav-arrow-icon"
            />
          </div>
        </div>
      </div>

      <!-- ========== 编辑 / 新建模式 ========== -->
      <div v-else class="edit-mode">
        <!-- 卡牌名 -->
        <van-field
          v-model="localCard.name"
          label="卡牌名"
          placeholder="请输入卡牌名"
          clearable
          required
        />
        <!-- 卡牌名字数提示 -->
        <div class="field-info">{{ getTextLength(localCard.name) }}/10</div>

        <!-- 关键词输入框（最多 3 个） -->
        <div class="keywords-input">
          <van-field
            v-for="(_kw, i) in keywordInputs"
            :key="i"
            v-model="keywordInputs[i]"
            placeholder="关键词"
            maxlength="6"
            clearable
          />
        </div>
        <div class="field-info">
          已填 {{ nonEmptyKeywords.length }}/3（单个 ≤ 6 字）
        </div>

        <!-- 描述 -->
        <van-field
          v-model="localCard.description"
          type="textarea"
          label="描述"
          placeholder="请输入描述"
          :rows="4"
        />
        <div class="field-info">
          {{ getTextLength(localCard.description) }}/150
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <div v-if="!isViewMode" class="limit-hint">
          卡牌名 ≤ 10 字，关键词 ≤ 3 个（单个 ≤ 6 字），描述 ≤ 150 字
        </div>
        <van-button type="default" @click="close">退出</van-button>
        <van-button v-if="!isViewMode" type="primary" @click="onSave"
          >保存</van-button
        >
      </div>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { useCardDialogStore } from "@/stores/cardDialog";
import type { CardType } from "@/types/card";

// 父组件触发保存事件
const emit = defineEmits<{
  (e: "save", card: CardType): void;
}>();

const store = useCardDialogStore();

// 弹窗显示控制
const visible = computed({
  get: () => store.visible,
  set: (val: boolean) => (store.visible = val),
});

// 弹窗标题
const dialogTitle = computed(() => store.dialogTitle);
// 当前显示/编辑的卡牌
const currentCard = computed(() => store.currentCard);
// 是否查看模式
const isViewMode = computed(() => store.mode === "view");
// 左右切换状态
const hasPrev = computed(() => store.hasPrev);
const hasNext = computed(() => store.hasNext);
const canNavigate = computed(() => store.canNavigate);

// 本地表单数据（用于编辑/新建）
const localCard = ref<CardType>({
  id: -1,
  name: "",
  keywords: [],
  description: "",
});

// 关键词输入框（最多 3 个）
const keywordInputs = ref<string[]>(["", "", ""]);

// 非空关键词
const nonEmptyKeywords = computed(() =>
  keywordInputs.value.map((s) => s.trim()).filter((s) => s.length > 0)
);

/**
 * 字数计算（MVP版本修改后）
 * - 英文、中文、标点、空格、换行均算作 1 个字符
 * - 保持排版一致，不区分中英文宽度
 */
function getTextLength(str: string): number {
  return str.length; // 直接按字符数计算
}

/**
 * 按字符数截断
 * - 保持排版和换行
 */
function truncateByLength(str: string, maxLen: number): string {
  return str.slice(0, maxLen);
}

// 同步 store.currentCard 数据到本地表单
watch(
  () => store.currentCard,
  (val) => {
    if (val) {
      localCard.value = { ...val };
      keywordInputs.value = [
        val.keywords[0] || "",
        val.keywords[1] || "",
        val.keywords[2] || "",
      ];
    } else {
      localCard.value = { id: -1, name: "", keywords: [], description: "" };
      keywordInputs.value = ["", "", ""];
    }
  },
  { immediate: true }
);

// 保存卡牌
function onSave() {
  if (!localCard.value.name.trim()) {
    return alert("卡牌名不能为空");
  }
  if (getTextLength(localCard.value.name) > 10) {
    return alert("卡牌名不能超过 10 字");
  }
  if (getTextLength(localCard.value.description) > 150) {
    return alert("描述不能超过 150 字");
  }

  // 处理关键词长度
  const processedKeywords = nonEmptyKeywords.value.map((kw) =>
    getTextLength(kw) > 6 ? truncateByLength(kw, 6) : kw
  );
  localCard.value.keywords = processedKeywords;

  // 更新 store
  store.patchCurrent(localCard.value);

  // 触发父组件保存事件
  emit("save", { ...localCard.value });

  // 关闭弹窗
  store.close();
}

// 关闭弹窗
function close() {
  store.close();
}
// 左右切换
function prev() {
  store.prev();
}
function next() {
  store.next();
}
</script>

<style scoped lang="scss">
.card-dialog {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 80%;
  display: flex;
  flex-direction: column;

  // PC端最大宽度居中
  @media (min-width: 768px) {
    width: 480px;
    margin: 0 auto;
  }

  .dialog-title {
    margin-bottom: 12px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
    text-align: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
  }

  .view-mode {
    flex: 1;
    overflow-y: auto;

    .keywords {
      margin: 12px 0;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .desc {
      margin-top: 8px;
      font-size: 14px;
      color: #555;
      line-height: 1.6;
      white-space: pre-wrap;
      background: #fff;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #eee;
    }

    .nav-arrows {
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      padding: 0 40px;

      // --arrow-size: 24px;

      @media (min-width: 768px) {
        --arrow-size: 28px;
      }

      .nav-arrow {
        width: var(--arrow-size);
        height: var(--arrow-size);
        cursor: pointer;
        opacity: 1;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        // 默认 filter（灰色）
        filter: brightness(0) saturate(100%) opacity(0.6) contrast(0.8);
      }

      .nav-arrow:hover:not(.nav-disabled) {
        // hover 时变为蓝色
        filter: brightness(0) saturate(100%) opacity(0.8) contrast(1)
          invert(12%) sepia(71%) saturate(697%) hue-rotate(195deg)
          brightness(89%) contrast(95%);
      }

      .nav-disabled {
        opacity: 0.4; // 视觉变淡
        filter: brightness(0) opacity(0.3); // 更灰
        cursor: not-allowed; // 鼠标显示禁用状态
        pointer-events: none; // 🔥 关键：禁用所有鼠标事件（点击、hover 都无效）
      }
    }
  }

  .edit-mode {
    flex: 1;
    overflow-y: auto;

    .field-info {
      font-size: 12px;
      color: #999;
      text-align: right;
      margin-bottom: 8px;
    }

    .keywords-input {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;

      :deep(.van-field) {
        flex: 1;
      }
    }

    .van-field {
      --field-label-width: 80px;
      --van-field-label-font-size: 14px;

      @media (min-width: 768px) {
        --van-field-label-font-size: 16px;
      }
    }
  }

  .actions {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;

    .limit-hint {
      font-size: 12px;
      color: #999;
      align-self: flex-start;
    }

    .van-button {
      border-radius: 8px;
    }
  }
}
</style>
