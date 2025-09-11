import type { UserDeck } from "@/types/deck";

const DECKS_KEY = "decks_mock_user1";

// 读取
export const getStoredMyDecks = (): UserDeck[] => {
  const raw = localStorage.getItem(DECKS_KEY);
  return raw ? (JSON.parse(raw) as UserDeck[]) : [];
};

// 写入
export const setStoredMyDecks = (decks: UserDeck[]): void => {
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
};

// 建议
// getStoredMyDecks / setStoredMyDecks 这种函数最好单独抽离出来，不要直接混在 api 里。原因是：

// api 层 → 模拟/调用服务端接口

// storage 层 → 负责本地缓存（localStorage / IndexedDB / mock 数据）

// 逻辑职责更清晰，后面要替换掉本地存储，用真正后端接口时，改动会更小。
