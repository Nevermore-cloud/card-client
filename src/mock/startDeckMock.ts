import type { DeckType } from "@/types/deck";

// 系统预设mock数据
export let startDecksMock: DeckType[] = [
  {
    id: 1,
    name: "套牌A",
    description: "这是套牌A的描述",
    cards: [], // 关联的卡片ID
    entityType: "presetDeck",
  },
  {
    id: 2,
    name: "套牌B",
    description: "这是套牌A的描述",
    cards: [], // 关联的卡片ID
    entityType: "presetDeck",
  },
  {
    id: 3,
    name: "套牌C",
    description: "这是套牌A的描述",
    cards: [], // 关联的卡片ID
    entityType: "presetDeck",
  },
];
