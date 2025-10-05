/**
 * 模拟延迟 的工具函数
 * @param ms - 延迟毫秒数
 * @returns Promise<void>
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
