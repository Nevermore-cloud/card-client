import { delay } from "@/utils/delay";
import type { CardType, UserDeck, PresetDeck } from "@/types";
import { getSystemCardsApi } from "@/api/systemCardsApi";

import { setStoredMyCards } from "@/storage/userCards";
import { setStoredMyDecks } from "@/storage/decksStorage";
import { getMyAllCardsApi } from "@/api/cardApi";
import { getMyDecksApi } from "@/api/decksApi";
import { startDecksMock } from "@/mock/startDeckMock";

// 系统预设卡组数据
const START_DECKS_KEY = "start_decks_mock_user1";

// 从 localStorage 取数据
function getStoredPresetsDecks(): PresetDeck[] {
  const data = localStorage.getItem(START_DECKS_KEY);
  return data ? JSON.parse(data) : [];
}

// 存入 localStorage
function setStoredPresetsDecks(decks: PresetDeck[]) {
  localStorage.setItem(START_DECKS_KEY, JSON.stringify(decks));
}

/**
 * 获取系统卡组
 */
export const getPresetsDecksApi = async (): Promise<{ data: PresetDeck[] }> => {
  const cached = getStoredPresetsDecks();
  if (cached.length > 0) {
    // refreshPresetsDecksInBackground();
    return { data: cached }; // ✅ 保持 res.data
  }

  await delay(300);
  setStoredPresetsDecks(startDecksMock);
  return { data: startDecksMock };
};

/**
 * 将系统卡组添加到我的卡组中去
 */
export interface AddPresetDeckResult {
  success: boolean;
  data: UserDeck | null;
  error?: string;
}

export const addPresetDeckToMyDecksApi = async (
  presetDeck: PresetDeck
): Promise<AddPresetDeckResult> => {
  await delay(200);

  try {
    // 1. 获取用户现有卡组
    const decksRes = await getMyDecksApi();
    const myDecks = decksRes.data;

    if (myDecks.length >= 10) {
      return {
        success: false,
        error: "最多只能有 10 个卡组",
        data: null,
      };
    }

    // 2. 生成新的 deckId（避免冲突）
    const existingIds = myDecks.map((d) => d.id);
    let newDeckId = 1;
    while (existingIds.includes(newDeckId)) {
      newDeckId++;
    }

    // 3. 获取用户现有卡牌
    const cardsRes = await getMyAllCardsApi();
    const myCards = cardsRes.data;
    const existingCardIds = new Set(myCards.map((c) => c.id));

    // 4. 获取系统卡牌
    const systemCardsRes = await getSystemCardsApi();
    const systemCards = systemCardsRes.data;

    // 5. 找出预设卡组里的卡牌，并过滤掉已有的
    const presetCardIds = presetDeck.cardIds;
    const newCards: CardType[] = presetCardIds
      .filter((id) => !existingCardIds.has(id))
      .map((id) => {
        const card = systemCards.find((c) => c.id === id);
        return card as CardType; // 系统一定有，直接断言
      })
      .filter((c): c is CardType => !!c); // 过滤掉万一没找到的

    // 更新用户卡牌池
    setStoredMyCards([...myCards, ...newCards]);

    // 6. 创建新的用户卡组
    const newDeck: UserDeck = {
      id: newDeckId,
      name: presetDeck.name,
      description: presetDeck.description,
      cardIds: [...presetCardIds], // 保留原顺序
      entityType: "userDeck",
    };

    // 更新用户卡组存储
    setStoredMyDecks([...myDecks, newDeck]);

    return {
      success: true,
      data: newDeck,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "未知错误",
      data: null,
    };
  }
};
