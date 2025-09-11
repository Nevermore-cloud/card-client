<template>
  <!-- 用来编辑卡组的名字 封面 描述 -->
  <!-- 使用 vant 的 Dialog 组件 -->
  <!-- 阻止Dialog自动关闭，交给我们手动控制 -->
  <van-dialog
    v-model:show="show"
    :title="isEdit ? '编辑卡组' : '添加卡组'"
    show-cancel-button
    confirm-button-text="确认"
    cancel-button-text="取消"
    async-close
    @confirm="onConfirm"
    @cancel="onCancel"
  >
    <div class="deck-form">
      <!-- 封面区域 -->
      <div class="cover-section">
        <div class="cover-preview">
          <img
            v-if="localDeck.coverImage"
            :src="localDeck.coverImage"
            alt="封面"
          />
          <div v-else class="no-cover">无封面</div>
        </div>
        <div class="cover-actions">
          <van-button size="small" type="primary" @click="onSelectImage">
            {{ localDeck.coverImage ? "替换封面" : "添加封面" }}
          </van-button>
          <van-button
            size="small"
            type="danger"
            @click="onRemoveImage"
            :disabled="!localDeck.coverImage"
          >
            删除封面
          </van-button>
        </div>
      </div>

      <!-- 卡组名称 -->
      <div class="field">
        <van-field
          v-model="localDeck.name"
          label="卡组名"
          placeholder="请输入卡组名称"
          maxlength="10"
        />
        <div class="hint">
          {{ getCharLength(localDeck.name ?? "") }}/10（必填）
        </div>
      </div>

      <!-- 卡组描述 -->
      <div class="field">
        <van-field
          v-model="localDeck.description"
          label="描述"
          type="textarea"
          rows="2"
          placeholder="请输入卡组描述（可为空）"
          maxlength="20"
          show-word-limit
        />
        <div class="hint">
          {{ getCharLength(localDeck.description ?? "") }}/20
        </div>
      </div>
    </div>
  </van-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { showToast } from "vant";
import { getCharLength } from "@/utils/charCount";
import type { UserDeck } from "@/types/deck";
// import { fa } from "element-plus/es/locales.mjs";

/**
 * Props:
 * - show: 控制弹窗显示（v-model:show）
 * - deck: 编辑时传入的卡组（可为 null 表示新建）
 * - isEdit?: 可选覆盖父组件传入的编辑态（通常不需要）
 */
const props = defineProps<{
  show: boolean;
  deck?: UserDeck | null;
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:show", val: boolean): void;
  (e: "save", val: Partial<UserDeck>): void; // 保存成功后触发，父组件决定调用哪个 API
}>();

// 本地控制的 show（同步到父组件）
const show = ref(props.show);
watch(
  () => props.show,
  (val) => (show.value = val)
);
// 同步回父组件
watch(show, (val) => emit("update:show", val));

// 编辑态标志（内部维护，但可被 props.isEdit 覆盖）
const isEdit = ref<boolean>(!!props.isEdit || !!props.deck);

// 临时副本（弹窗内部修改这份，不直接修改 props.deck）
const localDeck = ref<Partial<UserDeck>>({
  name: "",
  description: "",
  coverImage: "",
});

/**
 * 关键修复点：
 * 每次弹窗打开（show 从 false -> true）时都**重新初始化** localDeck：
 * - 编辑模式：从 props.deck 浅拷贝一份（确保每次打开都是基于最新父数据）
 * - 新建模式：初始化为空
 *
 * 这样可以避免“上一次在弹窗里做的临时修改在取消后残留”的问题。
 */
watch(
  () => show.value,
  (val) => {
    if (val) {
      // 打开弹窗：初始化 localDeck（浅拷贝）
      if (props.deck) {
        isEdit.value = props.isEdit ?? true;
        // shallow copy，避免引用共享（若存在深层可用 structuredClone）
        localDeck.value = { ...props.deck };
      } else {
        isEdit.value = props.isEdit ?? false;
        localDeck.value = { name: "", description: "", coverImage: "" };
      }
    }
  },
  { immediate: false }
);

// 如果父组件在运行时改变了传入的 deck（极少情况），也更新 isEdit（不作为主要初始化点）
watch(
  () => props.deck,
  (val) => {
    if (!show.value) {
      // 仅在弹窗未打开的情况下更新 isEdit（打开时以 show 的 watcher 为准）
      isEdit.value = props.isEdit ?? !!val;
    }
  }
);

// 删除封面（仅修改 localDeck）
const onRemoveImage = () => {
  localDeck.value.coverImage = "";
};

// 添加/替换封面（file->base64，选择时已做大小校验）
const onSelectImage = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // 立刻校验文件大小（字节）
    if (file.size > 1024 * 1024) {
      showToast("封面大小不能超过 1M");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      localDeck.value.coverImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  };
  input.click();
};

// 点击确认（async-close 已阻止 Dialog 自动关闭）
// 校验顺序：封面（如果存在） -> 名称（必填且 <=10） -> 描述（<=20）
// 只有全部通过才 emit save 并关闭弹窗
// onConfirm 改成接收 done
const onConfirm = () => {
  const name = (localDeck.value.name ?? "").trim();
  const description = (localDeck.value.description ?? "").trim();
  // 1) 封面：由于已经在选择时做了 file.size 校验，这里主要对 base64 的 fallback 校验（可选）
  if (localDeck.value.coverImage?.startsWith("data:")) {
    // 这是一个粗略估算，不一定完全精确，但能防护非常大的 base64 文本
    const base64Length = Math.ceil((localDeck.value.coverImage.length * 3) / 4);
    if (base64Length > 1024 * 1024) {
      showToast("封面大小不能超过 1M");
      show.value = true;

      return; // 不关闭弹窗
    }
  }

  // 2) 名称（必填且不超过 10 字符）
  if (!name || getCharLength(name ?? "") > 10) {
    showToast("卡组名不能为空且不超过 10 字符");
    show.value = true;

    return; // 不关闭弹窗
  }

  // 3) 描述（可空，但不能超过 20 字符）
  if (getCharLength(description ?? "") > 20) {
    showToast("卡组描述不能超过 20 字符");
    show.value = true;
    return; // 不关闭弹窗
  }

  // 校验通过：把临时数据提交给父组件，由父决定是 create 还是 update
  emit("save", {
    ...localDeck.value,
    name,
    description,
  });

  console.log("保存卡组：", localDeck.value);

  // 关闭弹窗（同步到父组件 via watch(show) -> emit('update:show')）
  show.value = false;
  // done(); // 调用 done() 手动关闭弹窗
};

// 点击取消：直接关闭弹窗（不保存），后续再次打开时会重新从 props.deck 初始化 localDeck
const onCancel = () => {
  show.value = false;
};
</script>

<style scoped lang="scss">
.deck-form {
  padding: 12px;

  .cover-section {
    margin-bottom: 16px;

    .cover-preview {
      width: 100%;
      height: 150px;
      background: #f5f5f5;
      border: 1px dashed #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .no-cover {
        color: #999;
        font-size: 14px;
      }
    }

    .cover-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
  }

  .field {
    margin-bottom: 12px;

    .hint {
      font-size: 12px;
      color: #888;
      margin-top: 4px;
      text-align: right;
    }
  }
}
</style>
