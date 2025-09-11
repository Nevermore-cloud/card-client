import type { DeckType } from "@/types/deck";
import { startDecksMock } from "@/mock/startDeckMock";
import { delay } from "@/utils/delay";

// 系统预设卡组数据
const START_DECKS_KEY = "start_decks_mock_user1";

// 从 localStorage 取数据
function getStoredPresetsDecks(): DeckType[] {
  const data = localStorage.getItem(START_DECKS_KEY);
  return data ? JSON.parse(data) : [];
}

// 存入 localStorage
function setStoredPresetsDecks(decks: DeckType[]) {
  localStorage.setItem(START_DECKS_KEY, JSON.stringify(decks));
}

/**
 * 获取我的卡组（缓存优先 + 后台更新）
 */
export const getPresetsDecksApi = async (): Promise<{ data: DeckType[] }> => {
  const cached = getStoredPresetsDecks();
  if (cached.length > 0) {
    refreshPresetsDecksInBackground();
    return { data: cached }; // ✅ 保持 res.data
  }

  await delay(300);
  setStoredPresetsDecks(startDecksMock);
  return { data: startDecksMock };
};

/**
 * 模拟后台偷偷刷新数据
 */
async function refreshPresetsDecksInBackground() {
  try {
    await delay(300);
    const freshData = startDecksMock;
    setStoredPresetsDecks(freshData);
    console.log("后台刷新我的卡组数据成功");
  } catch (error) {
    console.error("后台刷新失败 ", error);
  }
}
