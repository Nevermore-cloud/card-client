import type { CardType } from "@/types/card";
import { delay } from "@/utils/delay";

import { systemCardsMock } from "@/mock/systemCardsMock"; // 假设已有
import { getPresetsDecksApi } from "@/api/presetsDecksApi";

// 我的卡牌数据存储 key
const STORAGE_KEY = "cards_mock_system";

// 从 localStorage 取数据 卡牌
function getStoredCards(): CardType[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// 存入 localStorage 卡牌
function setStoredCards(cards: CardType[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}
/**
 * 获取系统卡牌
 */
export const getSystemCardsApi = async (): Promise<{ data: CardType[] }> => {
  // 1. 先查缓存
  const cached = getStoredCards();
  if (cached.length > 0) {
    // refreshCardsInBackground();
    return { data: cached }; // ✅ 保持 res.data
  }

  // 2. 缓存没有 → 模拟请求
  await delay(100);
  setStoredCards(systemCardsMock);
  return { data: systemCardsMock };
};

// 获取某个卡组的所有卡牌
/**
 * 获取某个卡组的所有卡牌
 */
export const getCardsByDeckIdApi = async (
  deckId: number
): Promise<{ data: CardType[] }> => {
  // 1. 获取所有卡组
  const decksRes = await getPresetsDecksApi();
  const deck = decksRes.data.find((d) => d.id === deckId);
  if (!deck) {
    return { data: [] }; // 没找到该卡组
  }

  // 2. 获取所有卡牌
  const cardsRes = await getSystemCardsApi();
  const allCards = cardsRes.data;

  // 3. 根据 cardIds 构建卡牌数组，保留重复与顺序
  const deckCards: CardType[] = deck.cardIds
    .map((id) => allCards.find((c) => c.id === id))
    .filter((c): c is CardType => !!c); // 过滤掉找不到的情况

  // 模拟延迟
  await delay(200);
  return { data: deckCards };
};
