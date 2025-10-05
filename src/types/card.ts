/**
 * 定义卡片的数据结构
 * - id: 卡片的唯一标识
 * - name: 卡片的标题
 * - keywords: 关键字数组（用于标签/搜索）
 * - description: 描述内容
 */
// export interface CardType {
//   id: number;
//   name: string;
//   keywords: string[];
//   description: string;
// }
export interface CardType {
  id: number;
  name: string;
  keywords: string[];
  description: string;
  entityType?: "card"; // 默认就是卡牌
  cardCategory?: "monster" | "spell" | "trap" | "other"; // 默认 "other"
  isSelected?: false;
}
