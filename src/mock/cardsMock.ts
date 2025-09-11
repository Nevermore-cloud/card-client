import type { CardType } from "@/types/card";

// export let myCardsMock: CardType[] = [
//   { id: 1, name: "卡牌A", keywords: ["火"], description: "描述A" },
//   { id: 2, name: "卡牌B", keywords: ["水"], description: "描述B" },
//   { id: 3, name: "卡牌C", keywords: ["风"], description: "描述C" },
// ];
export let myCardsMock: CardType[] = [
  {
    id: 1,
    name: "卡牌A",
    keywords: ["vue", "vue", "vue"],
    description: "描述内容1",
  },
  { id: 2, name: "卡牌B", keywords: [], description: "描述内容 42" },
  {
    id: 3,
    name: "卡牌C",
    keywords: [],
    description:
      "从代码可读性和维护角度:1.建议把工具函数 / 辅助函数放在前面，再定义计算属性、响应式状态，最后定义事件回调。2.这样一眼就能看到「搜索逻辑 → 计算属性 → 用户操作」的流程，更清晰。",
  },
  {
    id: 4,
    name: "卡牌B",
    keywords: [],
    description:
      "1.先定义 ref、computed、store 2.再定义方法函数 3.最后放 watch、onMounted、onUnmounted 等生命周期相关",
  },

  { id: 5, name: "卡牌B", keywords: [], description: "描述内容 42" },

  { id: 6, name: "卡牌B", keywords: [], description: "描述内容 42" },

  { id: 7, name: "卡牌B", keywords: [], description: "描述内容 42" },
];
