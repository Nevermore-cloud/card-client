// 防抖函数
/**
 * 防抖函数
 * @param fn 需要防抖执行的函数
 * @param delay 防抖延迟（毫秒），默认 300ms
 * @returns 返回防抖后的函数
 */
// export function debounce<T extends (...args: any[]) => any>(
//   fn: T,
//   delay = 300
// ) {
//   let timer: ReturnType<typeof setTimeout> | null;
//   return (...args: Parameters<T>) => {
//     if (timer) clearTimeout(timer);
//     timer = setTimeout(() => fn(...args), delay);
//   };
// }

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
) {
  let timer: ReturnType<typeof setTimeout> | null; // 保存定时器引用
  return (...args: Parameters<T>) => {
    // 每次调用先清除之前的定时器
    if (timer) clearTimeout(timer);
    // 延迟执行函数
    timer = setTimeout(() => fn(...args), delay);
  };
}

// <T extends (...args: any[]) => any>：“T 是一个类型变量，它必须是一个函数，这个函数可以接收任意参数，返回任意值。”
// 目的：确保你传给 debounce 的 fn 必须是一个函数，同时保留这个函数的参数和返回值类型信息，让 TypeScript 能做类型推导。

//  fn: T
//  这是函数的第一个参数。
//  fn 是参数名（function 的缩写）。
//  T 是上面定义的泛型类型。
//  目的：指定传入的 fn 参数必须是一个函数，且这个函数的类型由泛型 T 决定。

// let timer: ReturnType<typeof setTimeout> | null
//

// // 定义一个防抖函数，它接收一个“函数”和“延迟时间”
// export function debounce<你传进来的是一个函数类型>(
//   fn: 这个函数,
//   delay = 300
// ) {
//   // 定义一个变量，用来存“定时器ID”（数字）或 null
//   let timer: 数字 或 null = null;

//   // 返回一个“包装后的新函数”
//   return (...args: 这个新函数的参数必须和原函数 fn 一样) => {
//     // 1. 如果之前有定时器，先取消它
//     if (timer) clearTimeout(timer);

//     // 2. 重新设置一个定时器，delay 毫秒后执行原函数 fn
//     timer = setTimeout(() => {
//       fn(...args); // 执行原函数，并传入所有参数
//     }, delay);
//   };
// }
