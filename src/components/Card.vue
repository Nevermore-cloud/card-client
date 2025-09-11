<template>
  <div class="card-item" @click="emitView">
    <div class="card-inner">
      <!-- 标题区 -->
      <header class="card-header">
        <h3 class="card-name">{{ card.name }}</h3>
      </header>

      <!-- 描述区 -->
      <div class="card-description">
        <p>{{ card.description }}</p>
      </div>

      <!-- 关键词区 -->
      <div class="card-keywords">
        <div class="keywords-wrapper">
          <template v-if="card.keywords?.length">
            <span v-for="(k, idx) in card.keywords" :key="idx" class="keyword">
              #{{ k }}
            </span>
          </template>
          <span v-else class="keyword placeholder">无标签</span>
        </div>
        <span class="fade-right" aria-hidden="true"></span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="card-actions">
      <van-icon
        v-if="route.name === 'Cards'"
        name="edit"
        @click.stop="emitEdit"
      />
      <van-icon name="delete" @click.stop="emitDelete" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CardType } from "@/types/card";
import { useRoute } from "vue-router";

// 获取当前路由对象
const route = useRoute();
console.log("route.name", route.name);
/**
 * 接收来自父组件的 props
 * - 这里父组件会传递一个 card 对象进来
 */
const props = defineProps<{
  card: CardType;
  idx?: number;
}>();

/**
 * 定义当前组件可能触发的事件（emit）
 * - "view": 查看详情时触发，传递整个 card
 * - "edit": 编辑时触发，传递整个 card
 * - "delete": 删除时触发，传递 card 的 id
 *
 * 注意：这里的事件只是“告诉父组件发生了什么”，
 * 具体逻辑（如删除接口请求、打开编辑弹窗）由父组件处理。
 */
const emit = defineEmits<{
  (e: "view", card: CardType, idx?: number): void;
  (e: "edit", card: CardType): void;
  (e: "delete", id: number, idx?: number): void;
}>();

/**
 * 子组件内部封装的事件触发函数
 * - 点击时调用 emit，通知父组件
 */
const emitView = () => emit("view", props.card, props.idx);
const emitEdit = () => emit("edit", props.card);
const emitDelete = () => emit("delete", props.card.id, props.idx);
</script>

<style scoped lang="scss">
/* 卡片列表容器里的单个卡片样式 */
.card-item {
  background: linear-gradient(145deg, #fff, #f0f0f0);
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  padding: 1px;
  position: relative;
  cursor: pointer;

  /* 让每个 grid 单元内的卡片大小一致（宽度来自 grid 列宽，aspect-ratio 控制高度） */
  // aspect-ratio: 2 / 2; /* 宽高比：3:4，类似实体卡；可改为 63/88 更接近实体卡比例 */
  // aspect-ratio: 3 / 4;
  // aspect-ratio: 63 / 88;
  aspect-ratio: 83 / 88;
  overflow: visible; /* 操作图标可以溢出显示 */
  // 防止在宽屏下被撑得太大
  max-width: 200px;

  display: flex;
  flex-direction: column;
  justify-content: space-between; // 内容与操作按钮保持分离

  /* 轻微按压反馈（触感） */
  &:active {
    transform: translateY(2px);
  }
  /* 卡牌内容 */

  /* 内部用一个弹性列容器来分配空间（header / body / keywords） */
  .card-inner {
    /* 填满卡片主体，使用 flex 列布局 */
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* 顶部标题、中间描述、底部 keywords */
    background: linear-gradient(145deg, #ffffff, #f7f9fc); /* 卡面轻微渐变 */
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
    padding: 12px;
    box-sizing: border-box;

    /* 标题区：放在顶部，字体强调 */
    .card-header {
      .card-name {
        font-size: 15px;
        font-weight: 700;
        color: #111;
        margin: 0;
        line-height: 1.2;
        max-height: 2.4em; /* 两行以内 */
        overflow: hidden;
        text-overflow: ellipsis;

        /* 标准语法 - 面向未来 */
        line-clamp: 4;
        /* 兼容语法 - 确保当前可用 */
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
    /* 描述区：限制显示行数，保持卡片信息层次 */
    .card-description {
      margin-top: 8px;
      p {
        margin: 0;
        font-size: 12px;
        color: #555;
        line-height: 1.5;

        /* 标准语法（未来） */
        line-clamp: 4;
        /* 三行溢出省略 兼容语法（现在） */
        display: -webkit-box; /* 必须：将元素设为弹性盒子（WebKit 版） */
        -webkit-box-orient: vertical; /* 必须：设置盒子方向为垂直 */
        /* prettier-ignore */
        -webkit-line-clamp: 4; // 最大行数

        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    /* 关键词区：固定一行，使用 overflow + fade 提示溢出 */
    .card-keywords {
      margin-top: 10px;
      position: relative;
      overflow: hidden;
      min-height: 22px;
      /* 内层 wrapper：绝对定位以脱离流，避免长内容影响 min-content 宽度 */
      .keywords-wrapper {
        position: absolute;
        left: 0;
        top: 0;
        white-space: nowrap;
        /* keywords 容器 */
        .keyword {
          display: inline-block; /* 改成 inline-block，允许多个并排 */
          margin-right: 6px;
          background: #f0f4ff;
          color: #1f4ed8;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 999px;
          line-height: 1.4;
          vertical-align: middle;

          &.placeholder {
            background: transparent;
            color: #999;
            font-style: italic;
          }
        }
      }

      /* 渐变遮罩：提示溢出 */
      .fade-right {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 36px;
        pointer-events: none;
        background: linear-gradient(to right, rgba(255, 255, 255, 0), #fff);
      }
    }
  }

  /* 卡牌操作按钮 */
  .card-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 6px;

    .van-icon {
      font-size: 16px;
      color: #888;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 6px;
      padding: 4px; /* 提升点击目标 */
    }
  }

  @media (min-width: 768px) {
    .card-keywords {
      display: flex; /* 使用 Flex 佈局 */
      flex-wrap: wrap; /* 允許換行 */
      white-space: normal; /* 恢復正常換行模式 */
      overflow: hidden; /* 如果換行後還是太高，可以隱藏 */
      // flex-wrap: wrap; // 多行显示
      // text-overflow: clip; // 超出不显示省略号
    }

    /* 可选：在 PC 端取消 strict aspect-ratio，改为固定高度（若你想卡片更一致） */
    /* aspect-ratio: auto;
       height: 260px; */
    .fade-right {
      display: none;
    }
  }
}
</style>
