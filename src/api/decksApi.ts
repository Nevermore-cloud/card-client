// import type { UserDeck, DeckType } from "@/types/deck";
import type { UserDeck } from "@/types/deck";
import { myDecksMock } from "@/mock/myDecksMock";
import { delay } from "@/utils/delay";
import { getStoredMyDecks, setStoredMyDecks } from "@/storage/decksStorage";

// 卡组元信息（metadata）
/**
 * 获取我的所有卡组（缓存优先 + 后台更新）
 */
export const getMyDecksApi = async (): Promise<{ data: UserDeck[] }> => {
  const cached = getStoredMyDecks();
  if (cached.length > 0) {
    refreshMyDecksInBackground();
    return { data: cached }; // ✅ 保持 res.data
  }

  await delay(300);
  setStoredMyDecks(myDecksMock);
  return { data: myDecksMock };
};

/**
 * 模拟后台偷偷刷新数据 这里没接后台数据 暂时不管
 */
async function refreshMyDecksInBackground() {
  // try {
  //   await delay(300);
  //   const freshData = myDecksMock;
  //   setStoredMyDecks(freshData);
  //   console.log("后台刷新我的卡组数据成功");
  // } catch (error) {
  //   console.error("后台刷新失败 ", error);
  // }
}

/**
 * 新建卡组 添加卡组
 */
export const createMyDecksApi = async (
  deck: Omit<UserDeck, "id" | "entityType">
): Promise<{ data: UserDeck }> => {
  await delay(200);
  const decks = getStoredMyDecks();

  // 用当前最大 id + 1 生成新 id
  const newId = decks.length > 0 ? Math.max(...decks.map((d) => d.id)) + 1 : 1;

  const newDeck: UserDeck = {
    ...deck,
    id: newId,
    cardIds: [], // 新建时默认没有卡牌
    entityType: "userDeck",
  };

  decks.push(newDeck);
  setStoredMyDecks(decks);

  return { data: newDeck };
};

/**
 * 删除卡组
 */
export const deleteMyDecksApi = async (
  id: number
): Promise<{ success: boolean }> => {
  await delay(200);
  let decks = getStoredMyDecks();

  // 只删除用户自建卡组
  const before = decks.length;
  decks = decks.filter((d) => !(d.id === id && d.entityType === "userDeck"));

  setStoredMyDecks(decks);
  return { success: decks.length < before };
};

/**
 * 更新卡组信息（名称、描述、封面图等）
 */
export const updateMyDecksInfoApi = async (
  id: number,
  updates: Partial<Pick<UserDeck, "name" | "description" | "coverImage">>
): Promise<{ data: UserDeck | null }> => {
  await delay(200);
  const decks = getStoredMyDecks();
  const idx = decks.findIndex(
    (d) => d.id === id && d.entityType === "userDeck"
  );

  if (idx === -1) return { data: null };

  const updated = {
    ...decks[idx],
    ...updates,
  } as UserDeck;

  decks[idx] = updated;
  setStoredMyDecks(decks);

  return { data: updated };
};

// 卡组内容（content）
/**
 * 往卡组添加卡牌
 */
export const addCardToMyDecksApi = async (
  deckId: number,
  cardId: number
): Promise<{ data: UserDeck | null }> => {
  await delay(200);
  const decks = getStoredMyDecks();
  const idx = decks.findIndex(
    (d) => d.id === deckId && d.entityType === "userDeck"
  );
  if (idx === -1) return { data: null };

  const deck = decks[idx] as UserDeck;

  // TODO: 如果未来需要限制同一卡牌最多 3 张，可启用以下逻辑
  // const count = deck.cardIds.filter(id => id === cardId).length;
  // if (count >= 3) {
  //   throw new Error("同一卡牌最多 3 张");
  // }

  deck.cardIds.push(cardId); // 允许重复，目前无限制

  decks[idx] = deck;
  setStoredMyDecks(decks);

  return { data: deck };
};

/**
 * 从卡组移除卡牌（只移除一张相同的卡牌）
 */

export const removeCardFromMyDecksApi = async (
  deckId: number,
  cardId: number,
  cardIndex: number //要删除的卡牌在卡组中的下标
): Promise<{ data: UserDeck | null; error?: string; success?: boolean }> => {
  await delay(200);
  const decks = getStoredMyDecks();
  const idx = decks.findIndex(
    (d) => d.id === deckId && d.entityType === "userDeck"
  );
  // 未找到对应卡组
  if (idx === -1) return { data: null, success: false };

  const deck = decks[idx] as UserDeck;

  // 卡组为空
  // error: `卡组为空`
  if (deck.cardIds.length <= 0) {
    return { data: null, success: false };
  }

  // 先检查卡牌是否存在
  // error: `卡组中不存在卡牌 ${cardId}`
  if (!deck.cardIds.includes(cardId)) {
    return { data: null, success: false };
  }

  // 再校验 index 是否有效且对应的确是该卡牌
  // error: "卡牌序号不正确或与 cardId 不匹配"
  if (
    cardIndex < 0 ||
    cardIndex >= deck.cardIds.length ||
    deck.cardIds[cardIndex] !== cardId
  ) {
    return { data: null, success: false };
  }

  // 删除指定位置的卡牌
  deck.cardIds.splice(cardIndex, 1);

  decks[idx] = deck;
  setStoredMyDecks(decks);

  return { data: deck, success: true };
};

/**
 * 进入卡组详情时，获取最新的卡组信息（主要是为了拿到最新的卡牌列表）
 */
// export const getMyDeckByIdApi = async (
//   id: number
// ): Promise<{ data: UserDeck | null }> => { }
