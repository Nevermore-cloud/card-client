import { defineStore } from "pinia";
import type { CardType } from "@/types/card";
import { nextTick, reactive } from "vue";

/**
 * 弹窗模式：
 * - view   查看详情（只读）
 * - edit   编辑已有卡片
 * - create 新增卡片
 */
export type CardDialogMode = "view" | "edit" | "create";

/**
 * Pinia Store：统一管理卡牌弹窗的 UI 状态
 * 注意：只负责 UI 状态，不做任何网络请求（便于解耦、测试与复用）
 */
export const useCardDialogStore = defineStore("cardDialog", {
  state: () => ({
    /** 是否显示弹窗 */
    visible: false as boolean,
    /** 弹窗模式 */
    mode: "view" as CardDialogMode,
    /**
     * 当前展示/编辑的卡片
     * - view/edit 时：来自外部传入的真实卡片
     * - create 时：使用占位草稿（id 可能为 -1）
     */
    currentCard: null as CardType | null,

    /**
     * 列表上下文：用于左右切换（例如在“卡牌库”或“卡组详情”中打开）
     * 这里存的是“当下这批可切换的卡片”
     */
    list: [] as CardType[],
    /** 当前卡片在 list 中的下标；create 时为 -1 */
    index: -1 as number,
  }),

  getters: {
    /** 是否有上一张（用于左右切换按钮状态） */
    hasPrev: (s) => s.index > 0,
    /** 是否有下一张 */
    hasNext: (s) => {
      console.log("hasNext?", s.index >= 0 && s.index < s.list.length - 1);
      return s.index >= 0 && s.index < s.list.length - 1;
    },
    /** 弹窗标题（可直接在组件里使用） */
    dialogTitle: (s) => {
      switch (s.mode) {
        case "view":
          return "卡牌详情";
        case "edit":
          return "编辑卡牌";
        case "create":
          return "新增卡牌";
        default:
          return "卡牌";
      }
    },
    /**
     * 是否允许切换（左右箭头是否可见）
     * 规则：
     * - 仅在 view 模式下
     * - 且当前上下文列表长度大于 1
     */
    canNavigate: (s) => s.mode === "view" && s.list.length > 1,
  },

  actions: {
    /** 内部：根据传入卡片在 list 中定位 index */
    _locateIndexById(cardId?: number) {
      // if (!cardId || !this.list?.length) {
      //   this.index = -1;
      //   return;
      // }
      // const found = this.list.findIndex((c) => c.id === cardId);
      // this.index = found >= 0 ? found : 0; // 避免 -1

      if (!cardId || !this.list?.length) {
        this.index = 0;
        return;
      }
      const found = this.list.findIndex((c) => c.id === cardId);
      this.index = found >= 0 ? found : 0; // 避免 -1
    },

    /** 内部：浅拷贝设置当前卡片，避免直接改到父列表的引用 */
    _setCurrent(card: CardType | null) {
      this.currentCard = card ? { ...card } : null;
    },

    /** 供页面在打开弹窗前设置可切换的“上下文列表” */
    setContextList(list: CardType[]) {
      // 原来的写法：
      // this.list = Array.isArray(list) ? [...list] : [];

      // 改成 reactive，保证响应式
      this.list = reactive(Array.isArray(list) ? [...list] : []);
    },

    /** 打开：查看模式 */
    openView(card: CardType, list?: CardType[]) {
      // 如果传入了卡牌列表，先更新上下文
      if (list) this.setContextList(list);
      // 设置模式为查看
      this.mode = "view";
      // 设置当前卡牌
      this._setCurrent(card);
      // 定位 index（通过 id 匹配）
      this._locateIndexById(card.id);
      // 延迟显示弹窗，确保 index / list 先计算完成
      nextTick(() => {
        this.visible = true;
      });
    },

    /** 打开：编辑模式 */
    openEdit(card: CardType, list?: CardType[]) {
      if (list) this.setContextList(list);
      this.mode = "edit";
      this._setCurrent(card);
      this._locateIndexById(card.id);
      this.visible = true;
    },

    /**
     * 打开：新增模式
     * @param initial 新建草稿的初始值（可选）
     */
    openCreate(initial?: Partial<CardType>) {
      this.mode = "create";
      // 新建草稿：id 用 -1 占位，避免与真实数据冲突
      const draft: CardType = {
        id: -1,
        name: initial?.name ?? "",
        keywords: initial?.keywords ?? [],
        description: initial?.description ?? "",
      };
      this._setCurrent(draft);
      this.index = -1;
      this.visible = true;
    },

    /** 关闭弹窗并清理当前态 */
    close() {
      this.visible = false;
      this.mode = "view";
      this._setCurrent(null);
      this.index = -1;
      // list 是否清空看业务需要；这里保留，便于再次打开时沿用上下文
      // this.list = [];
    },

    /** 左右切换 —— 下一张 */
    next() {
      if (this.mode !== "view") return; // 只允许在查看模式下切换
      if (!this.hasNext) return;
      this.index += 1;
      this._setCurrent(this.list[this.index]);
    },

    /** 左右切换 —— 上一张 */
    prev() {
      if (this.mode !== "view") return; // 只允许在查看模式下切换
      if (!this.hasPrev) return;
      this.index -= 1;
      this._setCurrent(this.list[this.index]);
    },

    /**
     * 更新当前卡片（局部字段），通常用于编辑表单的双向绑定
     * 仅改 store.currentCard，不直接改列表（避免未保存就污染列表）
     */
    patchCurrent(patch: Partial<CardType>) {
      if (!this.currentCard) return;
      this.currentCard = { ...this.currentCard, ...patch };
    },

    /**
     * 保存后用“最新卡片”替换当前卡片，且同步写回上下文列表的位置
     * 页面完成后端保存成功后调用
     */
    replaceCurrentAfterSave(updated: CardType) {
      if (this.mode !== "view") return;
      this._setCurrent(updated);
      if (this.index >= 0 && this.index < this.list.length) {
        this.list.splice(this.index, 1, { ...updated });
      }
    },

    /**
     * 从上下文列表中移除当前卡片（删除成功后调用）
     * 并自动跳转到相邻卡片，若删除后列表为空则关闭弹窗
     */
    // removeCurrentFromList() {
    //   if (this.index < 0) {
    //     // 新建模式删除草稿：直接关闭即可
    //     this.close();
    //     return;
    //   }
    //   this.list.splice(this.index, 1);

    //   if (this.list.length === 0) {
    //     this.close();
    //     return;
    //   }

    //   // 调整 index 并刷新 currentCard
    //   if (this.index >= this.list.length) this.index = this.list.length - 1;
    //   this._setCurrent(this.list[this.index]);
    // },

    /** 可选：外部指定跳转到列表中的某个索引 */
    goTo(index: number) {
      if (index < 0 || index >= this.list.length) return;
      this.index = index;
      this._setCurrent(this.list[index]);
    },
  },
});

// 怎么使用
/**
 * 
import { useCardDialogStore } from "@/stores/cardDialog";

const dialog = useCardDialogStore();

function onCardClick(card: CardType) {
  dialog.openView(card, filteredCards.value); // 查看模式 + 可左右切换
}

function onEdit(card: CardType) {
  dialog.openEdit(card, filteredCards.value);
}

function onAdd() {
  dialog.openCreate(); // 新建模式
}
 * 
 * 
 */
