import { isNumber } from 'utils/type-assert';
import { Matrix } from './matrix';

export type PointLike = number[] | Point;
export type PointInput = PointLike | number;

/** 方向 */
export enum Direction {
  Center,
  Top,
  TopLeft,
  TopRight,
  Bottom,
  BottomLeft,
  BottomRight,
  Left,
  Right,
}

/** 点和向量类 */
export class Point {
  0: number;
  1: number;
  readonly length!: 2;

  get x() {
    return this[0];
  }
  get y() {
    return this[1];
  }

  static zero() {
    return Point.from([0, 0]);
  }

  /**
   * 创建一个点或者向量
   * @param {PointInput} start
   * @param {PointInput} end
   */
  constructor(start: number, end: number);
  constructor(start: PointLike, end: PointLike);
  constructor(start: PointInput, end: PointInput) {
    // 输入两个数 -> 点
    if (isNumber(start)) {
      this[0] = start;
      this[1] = end as number;
    }
    // 输入两个点 -> 向量
    else if (!isNumber(end)) {
      this[0] = end[0] - start[0];
      this[1] = end[1] - start[1];
    }
    // 非法输入
    else {
      throw new Error('not allowed a number/PointLike combination');
    }

    Object.defineProperty(this, 'length', {
      writable: false,
      enumerable: false,
      configurable: false,
      value: 2,
    });
  }
  /**
   * 从类似 Point 结构的数据中创建 Point
   */
  static from(start: PointInput) {
    if (isNumber(start)) {
      return new Point(start, start);
    } else {
      return new Point(start[0], start[1]);
    }
  }
  /**
   * 传递四个角标，生成四方格坐标
   * @returns [LeftTop, RightTop, RightBottom, LeftBottom]
   */
  static grid(
    top: number,
    bottom: number,
    left: number,
    right: number
  ): [Point, Point, Point, Point] {
    return [
      new Point(left, top),
      new Point(right, top),
      new Point(right, bottom),
      new Point(left, bottom),
    ];
  }
  /**
   * 迭代器函数
   *  - 用于解构赋值
   *
   * @returns {Generator}
   */
  [Symbol.iterator]() {
    return Array.prototype[Symbol.iterator].call(this);
  }
  [Symbol.toPrimitive](hint: 'number' | 'string' | 'default') {
    switch (hint) {
      case 'string':
        return this.join();
      default:
        console.error('not defined this oprator:', hint);
        return undefined;
    }
  }
  [Symbol.isConcatSpreadable] = false;
  /**
   * 判断`this`与`point`是否相等
   *  - 此处的相等将会兼容`[number, number]`类型
   *
   * @param {PointLike} point
   * @returns {boolean}
   * @memberof Point
   */
  isEqual(point: PointLike): boolean {
    return point.length === 2 && this[0] === point[0] && this[1] === point[1];
  }
  /**
   * 加法
   *  - 第一项将会调用 Point 构造函数生成实例，然后参与运算
   *  - 第二项输入 -1 表示是减法，且 this 是被减数
   */
  add(added: PointInput, label = 1): Point {
    const sum = new Point(0, 0);
    if (isNumber(added)) {
      sum[0] = this[0] + added * label;
      sum[1] = this[1] + added * label;
    } else {
      sum[0] = this[0] + added[0] * label;
      sum[1] = this[1] + added[1] * label;
    }
    return sum;
  }
  sub(minus: PointInput): Point {
    return this.add(minus, -1);
  }
  /**
   * 乘法
   *  - 第一项将会调用 Point 构造函数生成实例，然后参与运算
   *  - 第二项输入 -1 表示是除法，且 this 是被除数
   */
  mul(multiplier: PointInput, label = 1): Point {
    const sum = new Point(0, 0);
    if (isNumber(multiplier)) {
      sum[0] = this[0] * (label < 0 ? 1 / multiplier : multiplier);
      sum[1] = this[1] * (label < 0 ? 1 / multiplier : multiplier);
    } else {
      sum[0] = this[0] * (label < 0 ? 1 / multiplier[0] : multiplier[0]);
      sum[1] = this[1] * (label < 0 ? 1 / multiplier[1] : multiplier[1]);
    }
    return sum;
  }
  div(division: PointInput): Point {
    const dived = isNumber(division)
      ? new Point(division, division)
      : (division as Point);
    if (dived.x === 0 || dived.y === 0) {
      console.error(`you are trying divide ${this} by zero!`);
      return this;
    }

    return this.mul(division, -1);
  }
  /**
   * 向量乘法
   */
  product(vector: PointLike): number {
    return this[0] * vector[0] + this[1] * vector[1];
  }
  /**
   * 点旋转（乘以矩阵）
   */
  rotate(ma: Matrix) {
    return new Point(
      this[0] * ma.get(0, 0) + this[1] * ma.get(1, 0),
      this[0] * ma.get(0, 1) + this[1] * ma.get(1, 1)
    );
  }
  /**
   * 返回对 x, y 坐标分别求绝对值后组成的新 Point 实例
   */
  abs(): Point {
    return new Point(Math.abs(this[0]), Math.abs(this[1]));
  }
  /**
   * 返回 x, y 坐标分别单位化后组成的新 Point 实例
   */
  sign(factor = 1): Point {
    return new Point(Math.sign(this[0]) * factor, Math.sign(this[1]) * factor);
  }
  /**
   * 求 this 到 point 的几何距离
   */
  distance(point: PointLike = [0, 0]): number {
    return Math.hypot(this[0] - point[0], this[1] - point[1]);
  }
  /**
   * this 在`vector`上的投影向量
   */
  toProjection(vector: Point) {
    return vector.mul(this.product(vector) / vector.distance());
  }
  /**
   * 求与 this 平行且模为 factor 的向量
   */
  toUnit(factor = 1) {
    const scale = 1 / this.distance();
    return this.mul(scale * factor);
  }
  /**
   * 获取点的方向
   */
  toDirection() {
    if (this[0] > 0) {
      if (this[1] > 0) {
        return Direction.BottomRight;
      } else if (this[1] < 0) {
        return Direction.TopRight;
      } else {
        return Direction.Right;
      }
    } else if (this[0] < 0) {
      if (this[1] > 0) {
        return Direction.BottomLeft;
      } else if (this[1] < 0) {
        return Direction.TopLeft;
      } else {
        return Direction.Left;
      }
    } else {
      if (this[1] > 0) {
        return Direction.Bottom;
      } else if (this[1] < 0) {
        return Direction.Top;
      } else {
        return Direction.Center;
      }
    }
  }
  /**
   * x, y 分别对 n 的余数四舍五入
   */
  round(fixed = 20): Point {
    return new Point(
      Number.parseInt((this[0] / fixed).toFixed(), 10) * fixed,
      Number.parseInt((this[1] / fixed).toFixed(), 10) * fixed
    );
  }
  /**
   * 对 x, y 分别除以 n, 然后四舍五入
   */
  roundToSmall(fixed = 20): Point {
    return new Point(
      Number.parseInt((this[0] / fixed).toFixed(), 10),
      Number.parseInt((this[1] / fixed).toFixed(), 10)
    );
  }
  /**
   * x, y 分别对 n 的余数向下取整
   */
  floor(fixed = 20): Point {
    return new Point(
      Math.floor(this[0] / fixed) * fixed,
      Math.floor(this[1] / fixed) * fixed
    );
  }
  /**
   * 对 x, y 分别除以 n, 然后向下取整
   */
  floorToSmall(fixed = 20): Point {
    return new Point(Math.floor(this[0] / fixed), Math.floor(this[1] / fixed));
  }
  /**
   * 是否是零向量
   */
  isZero(): boolean {
    return this[0] === 0 && this[1] === 0;
  }
  /**
   * 返回新的 Point 且其中某一方向为 0
   */
  padZero(xOrY = false): Point {
    if (xOrY) {
      return new Point(this.x, 0);
    } else return new Point(0, this.y);
  }
  /**
   * 是否是整数点
   */
  isInteger(): boolean {
    return (
      this.length === 2 &&
      Number.isInteger(this[0]) &&
      Number.isInteger(this[1])
    );
  }
  /**
   * 是否和输入向量平行
   */
  isParallelOf(vector: PointLike): boolean {
    return this[0] * vector[1] === this[1] * vector[0];
  }
  /**
   * 是否和输入向量垂直
   */
  isPerpendicularOf(vector: PointLike): boolean {
    return this[0] * vector[0] + this[1] * vector[1] === 0;
  }
  /**
   * 是否和输入向量方向相同
   */
  isSameDirectionOf(vector: PointLike): boolean {
    return (
      // 0 向量与任意向量的方向都相同
      this.isZero() ||
      (this.isZero.call(vector) as boolean) ||
      // 非零向量
      (this.isParallelOf(vector) &&
        (vector[0] * this[0] > 0 || vector[1] * this[1] > 0))
    );
  }
  /**
   * 是否和输入向量方向相反
   */
  isOppositeDirectionOf(vector: PointLike): boolean {
    return (
      // 0 向量与任意向量的方向都相反
      this.isZero() ||
      (this.isZero.call(vector) as boolean) ||
      // 非零向量
      (this.isParallelOf(vector) &&
        (vector[0] * this[0] < 0 || vector[1] * this[1] < 0))
    );
  }
  /**
   * 以 this 为中心点，过滤距离中心点距离为 factor 的所有点，返回使 predicate 输出 true 的点的集合
   */
  around(predicate: (point: Point) => boolean, factor = 1): Point[] {
    const ans: Point[] = predicate(this) ? [Point.from(this)] : [];

    for (let m = 1; ans.length < 1; m++) {
      for (let i = 0; i < m; i++) {
        const x = i * factor,
          y = (m - i) * factor;
        const around =
          x === 0
            ? [
                [0, y],
                [0, -y],
                [y, 0],
                [-y, 0],
              ]
            : [
                [x, y],
                [x, -y],
                [-x, y],
                [-x, -y],
              ];

        const points = around.map((n) => this.add(n));

        ans.push(...points.filter(predicate));

        if (ans.length > 0) {
          break;
        }
      }
    }
    return ans;
  }
  /**
   * 求 points 中与 this 距离最近的点
   */
  closest(points: PointLike[]) {
    if (points.length === 0) {
      throw new Error('(point) points can not be a empty array.');
    }

    return Point.from(
      points.reduce((pre, next) =>
        this.distance(pre) < this.distance(next) ? pre : next
      )
    );
  }
  /**
   * 求 vectors 中与 this 夹角最小的向量
   */
  minAngle(vectors: PointLike[]) {
    if (vectors.length === 0) {
      throw new Error('(point) vectors can not be a empty array.');
    }

    function cosAB(a: PointLike, b: PointLike): number {
      return (
        Point.prototype.product.call(a, b) /
        Point.prototype.distance.call(a, [0, 0]) /
        Point.prototype.distance.call(b, [0, 0])
      );
    }

    return Point.from(
      vectors.reduce((pre, next) =>
        cosAB(this, pre) > cosAB(this, next) ? pre : next
      )
    );
  }
  /**
   * 以当前点为左上角，生成四方格坐标
   */
  toGrid(len: number = 20): [Point, Point, Point, Point] {
    return [
      new Point(this[0], this[1]),
      new Point(this[0] + len, this[1]),
      new Point(this[0], this[1] + len),
      new Point(this[0] + len, this[1] + len),
    ];
  }
  /**
   * 将坐标用 str 连接成字符串
   */
  join(str = ',') {
    return `${this[0]}${str}${this[1]}`;
  }
  map<T>(callback: (value: number, index: number) => T): [T, T] {
    return [callback(this[0], 0), callback(this[1], 1)];
  }
}

export const Directions: Readonly<Record<Direction, Point>> = {
  [Direction.Center]: Point.from([0, 0]),
  [Direction.Top]: Point.from([0, -1]),
  [Direction.Bottom]: Point.from([0, 1]),
  [Direction.Left]: Point.from([-1, 0]),
  [Direction.Right]: Point.from([1, 0]),
  [Direction.TopLeft]: Point.from([-1, -1]),
  [Direction.TopRight]: Point.from([1, -1]),
  [Direction.BottomLeft]: Point.from([-1, 1]),
  [Direction.BottomRight]: Point.from([1, 1]),
};
