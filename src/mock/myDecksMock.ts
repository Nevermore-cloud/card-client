import type { UserDeck } from "@/types/deck";

// 我的卡组mock数据
export let myDecksMock: UserDeck[] = [
  {
    id: 1,
    name: "套牌A",
    description: "这是套牌A的描述",
    cardIds: [1, 2, 3], // 关联的卡片ID
    entityType: "userDeck",
  },
  {
    id: 2,
    name: "套牌B",
    description: "这是套牌A的描述bb",
    cardIds: [3, 5], // 关联的卡片ID
    entityType: "userDeck",
  },
  {
    id: 3,
    name: "套牌C",
    description: "这是套牌A的描述cc",
    cardIds: [1, 2, 4], // 关联的卡片ID
    entityType: "userDeck",
  },
  {
    id: 4,
    name: "套牌D",
    description: "这是套牌A的描述cc",
    cardIds: [1, 2, 3, 4, 5, 6, 7], // 关联的卡片ID
    entityType: "userDeck",
  },
];
