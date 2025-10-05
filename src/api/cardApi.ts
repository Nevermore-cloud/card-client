// import type { CardType } from "@/types/card";
// import request from "./request";

// /**
//  * 获取我的卡牌列表
//  */
// export const getMyCardsApi = () => {
//   return request.get("/cards/my");
// };

// /**
//  * 删除卡牌
//  * @param id 卡牌ID
//  */
// export const deleteCardApi = (id: number) => {
//   return request.delete(`/cards/${id}`);
// };

// // 编辑卡牌
// export const updateCardApi = (card: CardType) => {
//   return request.put(`/cards/${card.id}`, card);
// };

// 临时
//------------------------------------------ 下面是临时使用的模拟数据和接口
// src/api/cardApi.ts
// import type { CardType } from "@/types/card";
// import { myCardsMock } from "@/mock/cardsMock";
// import { delay } from "@/utils/delay";

/**
 * 删除卡牌
 */
// export const deleteCardApi = async (id: number): Promise<void> => {
//   await delay(200); // 模拟网络延迟
//   // 模拟删除
//   const index = myCardsMock.findIndex((c) => c.id === id);
//   if (index !== -1) myCardsMock.splice(index, 1);
// };

/**
 * 编辑卡牌
 */
// export const updateCardApi = async (card: CardType): Promise<void> => {
//   await delay(200);
//   const index = myCardsMock.findIndex((c) => c.id === card.id);
//   if (index !== -1) myCardsMock[index] = card;
// };
// // ---持久化代码
// // 获取我的卡牌列表
// export const getMyCardsApi = async (): Promise<{ data: CardType[] }> => {
//   await delay(300);
//   const data =
//     JSON.parse(localStorage.getItem("user1_myCards") || "null") || myCardsMock;
//   return { data };
// };
// // 删除卡牌
// export const deleteCardApi = async (id: number): Promise<void> => {
//   await delay(200);
//   const data =
//     JSON.parse(localStorage.getItem("user1_myCards") || "null") || myCardsMock;
//   const index = data.findIndex((c) => c.id === id);
//   if (index !== -1) data.splice(index, 1);
//   localStorage.setItem("myCards", JSON.stringify(data));
// };

import { getStoredMyDecks, setStoredMyDecks } from "@/storage/decksStorage";
import type { CardType } from "@/types/card";
import { myCardsMock } from "@/mock/cardsMock"; // 假设已有
import { getMyDecksApi } from "@/api/decksApi";
import { delay } from "@/utils/delay";
import { getStoredMyCards, setStoredMyCards } from "@/storage/userCards";

/**
 * 获取我的所有卡牌（缓存优先 + 后台更新）
 */
export const getMyAllCardsApi = async (): Promise<{ data: CardType[] }> => {
  // 1. 先查缓存
  const cached = getStoredMyCards();
  if (cached.length > 0) {
    refreshCardsInBackground();
    return { data: cached }; // ✅ 保持 res.data
  }

  // 2. 缓存没有 → 模拟请求
  await delay(300);
  setStoredMyCards(myCardsMock);
  return { data: myCardsMock };
};

/**
 * 模拟后台偷偷更新 接入后端 → 后端返回数据就是最新状态，refreshCardsInBackground 可以删除。 也可以保留做增量更新
 */
async function refreshCardsInBackground() {
  try {
    await delay(300);
    // 不要直接覆盖缓存，除非是从真正后端拉取
    // const freshData = myCardsMock;
    // setStoredCards(freshData);
    console.log("后台刷新完成");
    console.log("缓存已后台更新 ");
  } catch (err) {
    console.error("后台刷新失败 ", err);
  }

  // try {
  //   await delay(300);
  //   const stored = getStoredCards(); // 本地已有卡牌
  //   const freshMock = myCardsMock; // 后端最新 mock 数据
  //   // 合并：保留本地已有卡牌，新增 mock 中不存在的
  //   const merged: CardType[] = [...stored];
  //   freshMock.forEach((mockCard) => {
  //     // 如果 localStorage 中不存在此 mock 卡牌，就添加
  //     if (!stored.some((c) => c.id === mockCard.id)) {
  //       merged.push(mockCard);
  //     }
  //   });
  //   // 写回 localStorage
  //   setStoredCards(merged);
  //   console.log("缓存已安全后台更新，保留用户数据");
  // } catch (err) {
  //   console.error("后台刷新失败", err);
  // }
}

// 获取某个卡组的所有卡牌
/**
 * 获取某个卡组的所有卡牌
 */
export const getCardsByDeckIdApi = async (
  deckId: number
): Promise<{ data: CardType[] }> => {
  // 1. 获取所有卡组
  const decksRes = await getMyDecksApi();
  const deck = decksRes.data.find((d) => d.id === deckId);
  if (!deck) {
    return { data: [] }; // 没找到该卡组
  }

  // 2. 获取所有卡牌
  const cardsRes = await getMyAllCardsApi();
  const allCards = cardsRes.data;

  // 3. 根据 cardIds 构建卡牌数组，保留重复与顺序
  const deckCards: CardType[] = deck.cardIds
    .map((id) => allCards.find((c) => c.id === id))
    .filter((c): c is CardType => !!c); // 过滤掉找不到的情况

  // 模拟延迟
  await delay(200);

  return { data: deckCards };
};

/**
 * 删除卡牌
 */
export const deleteCardApi = async (id: number): Promise<void> => {
  await delay(200);
  // 这里删除的是缓存里的
  // 删除我的卡牌
  const cards = getStoredMyCards().filter((c) => c.id !== id);
  // 删除卡牌时，也要从所有卡组中移除该卡牌
  const decks = getStoredMyDecks().map((deck) => ({
    ...deck,
    cardIds: deck.cardIds.filter((cardId) => cardId !== id),
  }));
  setStoredMyDecks(decks);
  setStoredMyCards(cards);
};

/**
 * 新增卡牌
 * @param card - 新卡片信息（注意：前端可传 id=-1 占位）
 * @returns 新增后的完整卡片（带真实 id）
 */
export const addCardApi = async (card: CardType): Promise<CardType> => {
  await delay(200);

  const stored = getStoredMyCards();

  // 模拟后端生成 id：取现有最大 id + 1
  const newId = stored.length ? Math.max(...stored.map((c) => c.id)) + 1 : 1;

  const newCard: CardType = { ...card, id: newId };
  stored.push(newCard);
  setStoredMyCards(stored);

  return newCard;
};

/**
 * 编辑卡牌
 * @param card - 要更新的卡片（必须有有效 id）
 * @returns 更新后的卡片
 */
export const updateCardApi = async (card: CardType): Promise<CardType> => {
  await delay(200);

  const stored = getStoredMyCards();

  const index = stored.findIndex((c) => c.id === card.id);
  if (index === -1) {
    throw new Error(`卡牌 id=${card.id} 不存在`);
  }

  // 更新卡片
  stored[index] = { ...stored[index], ...card };
  setStoredMyCards(stored);

  return stored[index];
};
