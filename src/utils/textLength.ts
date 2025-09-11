/**
 * 计算字符串长度
 * 规则：
 * - 中文/中文标点 = 2
 * - 英文/英文标点 = 1
 * - 空格 = 1
 * - 换行 \n = 1
 * @param str 输入字符串
 */
export function getTextLength(str: string): number {
  let len = 0;
  for (const ch of str) {
    if (ch === "\n" || ch === " " || ch.charCodeAt(0) <= 255) {
      len += 1;
    } else {
      len += 1;
    }
  }
  return len;
}

/**
 * 按字符长度截断字符串
 * 规则同 getTextLength
 * @param str 输入字符串
 * @param maxLen 最大长度
 */
export function truncateByLength(str: string, maxLen: number): string {
  let len = 0;
  let result = "";
  for (const ch of str) {
    const charLen =
      ch === "\n" || ch === " " || ch.charCodeAt(0) <= 255 ? 1 : 2;
    if (len + charLen > maxLen) break;
    result += ch;
    len += charLen;
  }
  return result;
}
