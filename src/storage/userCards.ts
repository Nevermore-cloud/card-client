import type { CardType } from "@/types/card";

// 我的卡牌数据存储 key
const STORAGE_KEY = "cards_mock_user1";

// 从 localStorage 取数据 卡牌
export const getStoredMyCards = (): CardType[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// 存入 localStorage 卡牌
export const setStoredMyCards = (cards: CardType[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
};
