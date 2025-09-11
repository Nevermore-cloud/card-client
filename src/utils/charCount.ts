// 字符长度限制工具函数
// 计算字符串的字符长度，支持多字节字符（如中文、emoji 等）
// 使用 Array.from 可以正确处理 Unicode 字符
// 目前针对卡组名称和描述的长度计算

/**
 * 获取字符串长度：
 * - 左右空格不计数
 * - 中间空格/换行/中文/英文/标点都算 1
 */
export function getCharLength(str: string): number {
  if (!str) return 0;

  // 去掉左右空格
  const trimmed = str.replace(/^\s+|\s+$/g, "");
  return Array.from(trimmed).length;
}

/**
 * 按规则截断字符串
 * @param str 输入字符串
 * @param maxLen 最大长度
 * @returns 截断后的字符串
 */
export function truncateByCharLength(str: string, maxLen: number): string {
  if (!str) return "";

  const trimmed = str.replace(/^\s+|\s+$/g, "");
  const chars = Array.from(trimmed);

  if (chars.length <= maxLen) return trimmed;

  return chars.slice(0, maxLen).join("");
}
