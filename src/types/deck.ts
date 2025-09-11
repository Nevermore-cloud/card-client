import type { CardType } from "./card";

// 通用部分
interface BaseDeck {
  id: number;
  name: string;
  description: string;
  coverImage?: string; // 预留封面字段（用户、预设都能用）
  tags?: string[]; // 分类标签
  recommended?: boolean; // 是否推荐
}

// 用户自建卡组
export interface UserDeck extends BaseDeck {
  cardIds: number[];
  entityType: "userDeck";
  author?: string; // 预设来源
}

// 系统预设卡组
export interface PresetDeck extends BaseDeck {
  cards: CardType[]; // 直接返回卡牌对象
  editable?: boolean; // 是否允许直接修改
  author?: string; // 预设来源
  entityType: "presetDeck";
}

// 联合类型
export type DeckType = UserDeck | PresetDeck;
