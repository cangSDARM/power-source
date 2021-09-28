import { Point } from 'math/point';
import * as Rx from 'rxjs';
import { actions } from './actions';

let zoomCus = 1;
const zoom = new Rx.Subject<number>();
zoom.next(zoomCus);

zoom.subscribe({
  next: (t) => (zoomCus = t),
});

let posCus = Point.zero();
const position = new Rx.Subject<Point>();
position.next(posCus);

position.subscribe({
  next: (t) => (posCus = t),
});

let actionCus = -1;
const action = new Rx.Subject<number>();
action.next(actionCus);

action.subscribe({
  next: (t) => (actionCus = t),
});

let editorModeCus = false;
const editorMode = new Rx.Subject<boolean>();
editorMode.next(editorModeCus);

editorMode.subscribe({
  next: (t) => (editorModeCus = t),
});

export default class Data {
  static get init() {
    return {
      zoom: 1,
      position: Point.zero(),
    };
  }

  static get zoom() {
    return zoom;
  }

  static get position() {
    return position;
  }

  static get action() {
    return action;
  }

  static get actions() {
    return actions;
  }

  static get editorMode() {
    return editorMode;
  }

  static get data() {
    return {
      zoom: zoomCus,
      position: posCus,
      action: actionCus,
      gridSize: 20,
      editorMode: editorModeCus,
    };
  }

  /**
   * compose svg's transform/scale to this position or the viewport
   */
  static composedPostion(e: Point | MouseEvent) {
    let p = Point.zero();
    if (e instanceof Point) {
      p = e;
    } else {
      p = new Point(e.pageX, e.pageY);
    }
    return p.sub(Data.data.position).mul(1 / Data.data.zoom);
  }

  /**
   * crystallize the pos and align grid lines
   */
  static crystallizePosition(pos: Point) {
    return pos.round(Data.data.gridSize);
  }

  /**
   * @returns [LeftTop, RightTop, RightBottom, LeftBottom]
   */
  static get protectedNodeRects(): [Point, Point, Point, Point][] {
    return Array.from(document.querySelectorAll('[protected]')).map((node) => {
      const rect = node.getBoundingClientRect();
      return Point.grid(rect.top, rect.bottom, rect.left, rect.right).map(
        (data) => Data.composedPostion(data)
      ) as [Point, Point, Point, Point];
    });
  }
}
