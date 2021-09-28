import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  Renderer2,
} from '@angular/core';
import { Point } from 'math/point';
import Data from 'src/drawing/data';
import { MouseButtons } from 'src/gobal';
import { isFireOnBindedTarget } from 'utils/event';

export interface MoveableConfigs {
  onStart?: (instance: MoveDirective) => void | boolean;
  onEnd?: (instance: MoveDirective) => void;
  /**
   * Non-Struct-Mode. Trigger on children if it's `true`
   */
  nonStruct?: boolean;
  /**
   * Only Editor Mode can trigger this
   *
   * FIXME: this shouldnt depended on editorMode.
   */
  reqEditorMode?: boolean;
  /**
   * disable moveable when mouseleave if needed
   */
  disableWhenLeave?: boolean;
  /**
   * @see MouseButtons
   */
  bindFor?: number;
}

@Directive({
  selector: '[moveable]',
})
export class MoveDirective {
  constructor(
    public renderer: Renderer2,
    public elRef: ElementRef<HTMLOrSVGElement>
  ) {}

  last: Point | null = null;

  private _isMoving = false;
  private set isMoving(i: boolean) {
    this._isMoving = i;
  }
  private get isMoving() {
    if (this._config.reqEditorMode && !Data.data.editorMode) {
      this._isMoving = false;
      this.last = null;
    }
    return this._isMoving;
  }

  private _config: MoveableConfigs = {};
  @Input('moveable-config') set config(cfg: MoveableConfigs) {
    this._config = Object.assign(
      {
        disableWhenLeave: true,
        nonStructMode: false,
        reqEditorMode: false,
        bindFor: MouseButtons.Right,
      } as MoveableConfigs,
      cfg
    );
  }

  /**
   * https://stackoverflow.com/a/39620352/9883803
   */
  @Output('moveable') motionCallback: EventEmitter<[Point, ElementRef]> =
    new EventEmitter();

  @HostListener('mousedown', ['$event']) onMouseDown(e: MouseEvent) {
    e.stopPropagation();

    if (
      e.button !== this._config.bindFor ||
      (e.currentTarget as any) !== this.elRef.nativeElement ||
      (!this._config.nonStruct && !isFireOnBindedTarget(e))
    )
      return;

    if (this._config.onStart) {
      const ret = this._config.onStart(this);
      if (typeof ret === 'boolean' && !ret) return;
    }

    this.isMoving = true;
    this.last = null;
  }

  @HostListener('document:mousemove', ['$event']) onMouseMove(e: MouseEvent) {
    if (!this.isMoving) return;

    e.preventDefault();

    const mouse = new Point(e.pageX, e.pageY);
    const { zoom } = Data.data;
    const movement = this.last
      ? mouse.sub(this.last).mul(1 / zoom)
      : new Point(0, 0);

    this.motionCallback.emit([movement.mul(zoom), this.elRef]);

    this.last = mouse;
  }

  @HostListener('mouseup', ['$event'])
  @HostListener('mouseleave', ['$event'])
  onMouseUp(e: MouseEvent) {
    if (!this.isMoving) return;

    if (!this._config.disableWhenLeave && e.type === 'mouseleave') return;

    this.isMoving = false;
    if (this._config.onEnd) this._config.onEnd(this);
  }
}
