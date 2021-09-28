import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Point } from 'math/point';
import Data from 'src/drawing/data';
import { DataListener, RequireData } from 'src/drawing/decorators/data-bind';
import { NgHelperService } from 'src/services/ngcomps.service';
import { RefEventListener } from '../decorators/ref-event-listener';

@Directive({
  selector: '[edit-highlight]',
})
export class EditHighlightDirective implements OnInit {
  constructor(
    private renderer: Renderer2,
    private _ngHelperService: NgHelperService,
    private changeDetectorRef: ChangeDetectorRef,
    private _el: ElementRef
  ) {}

  @Input('edit-highlight-type') type: 'stroke-width' | 'border' | 'opacity' =
    'border';

  private _rect?: ElementRef<SVGGraphicsElement>;
  private _eventElRef?: ElementRef<SVGGraphicsElement>;

  @Input('edit-highlight') set elRef(
    el:
      | ElementRef<HTMLElement | SVGGraphicsElement>
      | HTMLElement
      | SVGGraphicsElement
      | undefined
  ) {
    this._eventElRef =
      el instanceof HTMLElement || el instanceof SVGGraphicsElement
        ? new ElementRef(el as unknown as SVGGraphicsElement)
        : (el as unknown as ElementRef<SVGGraphicsElement>);
  }

  ngOnInit() {
    if (!this._el || this._rect) return;

    switch (this.type) {
      case 'border':
        const rect: SVGGraphicsElement = this.renderer.createElement(
          'rect',
          'http://www.w3.org/2000/svg'
        );
        this.renderer.setAttribute(rect, 'x', '0');
        this.renderer.setAttribute(rect, 'y', '0');
        this.renderer.setAttribute(rect, 'rx', '2');
        this.renderer.setAttribute(rect, 'fill', 'transparent');
        this.renderer.setAttribute(rect, 'stroke', 'currentcolor');
        this.renderer.appendChild(this._el.nativeElement.parentElement, rect);
        this._rect = this._ngHelperService.createDynamicElement(rect);
        this.changeDetectorRef.detectChanges();
    }
  }

  @RefEventListener('_eventElRef', 'mouseenter')
  @RequireData(Data.editorMode, (t) => t)
  @DataListener(Data.editorMode, (t) => !!t)
  onMouseEnter() {
    switch (this.type) {
      case 'border':
        this.toggleBorder(1);
        break;
      case 'stroke-width':
        this.setStrokeWidth(true);
    }
  }

  @RefEventListener('_eventElRef', 'mouseleave')
  @DataListener(Data.editorMode, (t) => !t)
  onMouseLeave() {
    switch (this.type) {
      case 'border':
        this.toggleBorder(0);
        break;
      case 'stroke-width':
        this.setStrokeWidth(false);
    }
  }

  private _strokeWidth = -1;
  private setStrokeWidth(active = false) {
    if (!this._el) return;
    if (this._strokeWidth < 0) {
      this._strokeWidth = parseFloat(
        window
          .getComputedStyle(this._el.nativeElement)
          .getPropertyValue('stroke-width')
      );
    }

    this.renderer.setAttribute(
      this._el.nativeElement,
      'stroke-width',
      (active ? this._strokeWidth + 1 : this._strokeWidth).toString()
    );
  }

  private toggleBorder(size = 1) {
    if (!this._el) return;

    const rect = this._el.nativeElement.getBBox();
    if (!this._rect?.nativeElement) return;

    const rectSize = new Point(rect.width, rect.height),
      padding = 2;
    const attrs = {
      x: rectSize.x * -0.5 - padding,
      y: rectSize.y * -0.5 - padding,
      height: rectSize.y,
      width: rectSize.x + padding * 2,
      'stroke-width': size,
      class: size > 0 ? 'cursor-select' : '',
    };
    Object.entries(attrs).map(([key, value]) => {
      this.renderer.setAttribute(
        this._rect?.nativeElement,
        key,
        value.toString()
      );
    });
  }
}
