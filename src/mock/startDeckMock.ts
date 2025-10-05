import type { PresetDeck } from "@/types/deck";

// 系统预设mock数据
export let startDecksMock: PresetDeck[] = [
  {
    id: 1,
    name: "预设套牌A",
    description: "这是套牌A的描述",
    cardIds: [1001, 1002, 1003], // 关联的卡片ID
    entityType: "presetDeck",
  },
  {
    id: 2,
    name: "预设套牌B",
    description: "这是套牌B的描述",
    cardIds: [1001, 1002], // 关联的卡片ID
    entityType: "presetDeck",
  },
  {
    id: 3,
    name: "预设套牌C",
    description: "这是套牌A的描述",
    cardIds: [], // 关联的卡片ID
    entityType: "presetDeck",
  },
];
