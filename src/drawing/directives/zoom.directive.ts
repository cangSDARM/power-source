import { Directive, HostListener, Input } from '@angular/core';
import { Point } from 'math/point';
import { narrow } from 'math/utils';
import { isFireOnBindedTarget } from 'utils/event';
import Data from '../data';

@Directive({
  selector: '[zoomable]',
})
export class ZoomDirective {
  constructor() {}

  @Input('zoomable-struct')
  struct = true;

  @HostListener('wheel', ['$event']) onMouseWeel(e: WheelEvent) {
    if (this.struct && !isFireOnBindedTarget(e)) return;

    const mousePosition = new Point(e.pageX, e.pageY);
    let size = Data.data.zoom * 20;

    if (e.deltaY > 0) {
      size -= 5;
    } else if (e.deltaY < 0) {
      size += 5;
    }

    size = narrow(size, [20, 100]) / 20;

    //https://stackoverflow.com/a/20996105/9883803
    const position = Data.data.position
      .sub(mousePosition)
      .mul(size / Data.data.zoom)
      .add(mousePosition)
      .round(1);

    if (size !== Data.data.zoom) Data.zoom.next(size);
    if (!Data.data.position.isEqual(position)) Data.position.next(position);
  }
}
