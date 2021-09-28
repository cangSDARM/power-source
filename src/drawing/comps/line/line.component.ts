import { Component, Input } from '@angular/core';
import { Point } from 'math/point';
import Data from 'src/drawing/data';

@Component({
  selector: 'line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.sass'],
})
export class LineComponent {
  d = '';

  _transform = Point.zero();
  @Input('transform') set transform(point: Point) {
    this._transform = Data.crystallizePosition(Data.composedPostion(point));
  }

  private _endPoint = Point.zero();
  @Input('end-point') set endPoint(point: Point) {
    this._endPoint = point;
    this.draw();
  }
  get endPoint() {
    return this._endPoint;
  }

  lockPosition?: 'X' | 'Y';

  private lockForPosition(point: Point, autoCheck = false) {
    return this.lockPosition === 'X'
      ? point.padZero(true)
      : this.lockPosition === 'Y'
      ? point.padZero(false)
      : point.padZero(autoCheck);
  }

  private straightenLines(points: Point[]) {
    const pointsShifted = points.slice(1);
    let i = 0;
    while (i < pointsShifted.length) {
      const left = points[i];
      const right = pointsShifted[i];
      const xDistance = Math.abs(left.x - right.x),
        yDistance = Math.abs(left.y - right.y);
      if (xDistance > 1 && yDistance > 1) {
        const newPoint = this.lockForPosition(right, xDistance < yDistance);
        /**
         * TODO:
         * 查找 newPoint 是否在 protectedNodes 里，
         * 在:
         * 1. 返回一个离 left 最近的 protectedPoint
         * 2. 检查 left 是否就是这个 protectedPoint
         *    是: 插入第二近的 protectedPoint
         *    否: 插入这个 protectedPoint
         * 3. i--
         * 否:
         * 直接插入 newPoint
         */
        points.splice(i + 1, 0, newPoint);
      }
      i++;
    }
    points.shift();
    return points;
  }

  private draw() {
    this.d = `M${Point.zero().join(',')} L${this.straightenLines([
      Point.zero(),
      this._endPoint,
    ]).join(' ')}`;
  }

  crystall() {
    this._endPoint = Data.crystallizePosition(this._endPoint);
    this.draw();
  }

  get isIegalLine() {
    return this._endPoint.distance(Point.zero()) >= Data.data.gridSize;
  }
}
