/**
 * 模拟延迟的工具 函数
 * @param ms - 延迟毫秒数
 * @returns Promise<void>
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
