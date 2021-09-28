import { Component, OnInit, Renderer2 } from '@angular/core';
import { Point } from 'math/point';
import Data from 'src/drawing/data';
import { MouseButtons } from 'src/gobal';
import { SvgbusService } from 'src/services/svgbus.service';
import { MouseStateData } from 'utils/event/mouse-bus';

//TODO: merge this to directive.

@Component({
  selector: 'section-box',
  templateUrl: './section-box.component.html',
  styleUrls: ['./section-box.component.sass'],
})
export class SectionBoxComponent implements OnInit {
  constructor(private svgbus: SvgbusService, private renderer: Renderer2) {}

  d = '';
  strokeWidth = 2;
  private isDrawing = false;

  ngOnInit(): void {
    this.svgbus.bind({
      start: 'mousedown',
      trigger: 'mousemove',
      end: ['mouseup', 'mouseleave'],
      for: MouseButtons.Left,
    })(
      (v) => this.onSvgMouseDownMove(v),
      ([_, e]) => {
        this.startPoint = Data.composedPostion(e);
        this.isDrawing = true;
        this.renderer.addClass(e.currentTarget, 'cursor-select');
      },
      ([_, e]) => {
        this.d = '';
        this.isDrawing = false;
        this.renderer.removeClass(e.currentTarget, 'cursor-select');
      }
    );
    Data.zoom.subscribe({
      next: (t) => (this.strokeWidth = 2 / t),
    });
  }

  toPath(start: Point, end: Point) {
    const top = start[1];
    const bottom = end[1];
    const left = start[0];
    const right = end[0];

    return `M${left},${top}L${right},${top}L${right},${bottom}L${left},${bottom}Z`;
  }

  private startPoint = Point.from([-1, -1]);

  onSvgMouseDownMove([_, e]: MouseStateData) {
    if (!this.isDrawing) return;
    this.d = this.toPath(this.startPoint, Data.composedPostion(e));
  }
}
