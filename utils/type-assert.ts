/**
 * 断言：输入是否是数字
 *
 * @param {*} x
 * @returns {x is number}
 */
export function isNumber(x: unknown): x is number {
  return typeof x === 'number';
}

/**
 * 断言：输入是否是字符串
 *
 * @param {*} x
 * @returns {x is string}
 */
export function isString(x: unknown): x is string {
  return typeof x === 'string';
}

/**
 * 断言：输入是否是 Array 的实例（包含继承 Array 类的实例）
 *
 * @param {*} x
 * @returns {x is any[]}
 */
export function isArray(x: unknown): x is any[] {
  return Array.isArray(x);
}

/**
 * 断言：输入是否是 null 或 undefined
 *
 * @param {*} x
 * @returns {(x is null | undefined)}
 */
export function isUndef(x: unknown): x is null | undefined {
  return x === undefined || x === null;
}
