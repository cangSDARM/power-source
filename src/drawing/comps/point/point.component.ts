import {
  AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Point } from 'math/point';
import { LineComponent } from 'src/drawing/comps/line/line.component';
import Data from 'src/drawing/data';
import { MouseButtons } from 'src/gobal';
import { NgHelperService } from 'src/services/ngcomps.service';
import { SvgbusService } from 'src/services/svgbus.service';

@Component({
  selector: 'point',
  template: ` <svg:g
    class="cursor-hover"
    nowrapper
    [attr.transform]="transform"
  >
    <circle
      cx="0"
      cy="0"
      animatable
      anime-attribute="r"
      [anime-size]="[4, 8]"
      [attr.style]="style"
      #animte="animatable"
    ></circle>
    <rect
      stroke-width="0"
      fill="transparent"
      storke="transparent"
      x="-8.5"
      y="-8.5"
      height="17"
      width="17"
      (mouseenter)="animte.start()"
      (mouseleave)="animte.end()"
      (mousedown)="onMouseDown($event)"
      (moveable)="motionCallback($event[0])"
      [moveable-config]="{
        nonStruct: false,
        disableWhenLeave: false,
        bindFor: 0
      }"
      class="cursor-hover"
      #rectEl
    ></rect>
  </svg:g>`,
  styleUrls: ['../../drawing.component.sass'],
})
export class PointComponent implements AfterViewInit, OnDestroy {
  constructor(
    private _svgBus: SvgbusService,
    private _ngHelper: NgHelperService
  ) {}

  @Input('transform') transform = '';
  @Input('style') style = '';
  @Input('preferred-direction') preferredDirection?: 'X' | 'Y';

  private _type: 'dashed' | 'solid' = 'dashed';
  @Input('type') set type(t: 'dashed' | 'solid') {
    if (t === 'dashed') {
      this.style = 'fill: rgb(255, 255, 255); stroke-dasharray: 1.5, 4';
    } else if (t === 'solid') {
      this.style = 'fill:currentcolor; stroke:currentcolor';
    }
    this._type = t;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.style === '') {
        this.type = 'dashed';
      }
    }, 0);
  }

  @ViewChild('rectEl', { read: ElementRef })
  rectEl!: ElementRef<SVGRectElement>;

  private componentIdx = -1;
  private componentRef?: ComponentRef<LineComponent>;
  onMouseDown(e: MouseEvent) {
    if (this.componentRef || e.button !== MouseButtons.Left) return;

    const componentRef = this._ngHelper.createDynamicComponent(LineComponent);
    componentRef.instance.transform = new Point(e.pageX, e.pageY);
    componentRef.instance.lockPosition = this.preferredDirection;
    this.componentRef = componentRef;
    this.componentIdx =
      this._svgBus.appendTemporaryComponent(
        componentRef.location.nativeElement
      ) || -1;
  }

  motionCallback(movement: Point) {
    if (!this.componentRef) return;

    const zoomedMovement = movement.div(Data.data.zoom);

    this.componentRef.instance.endPoint =
      this.componentRef.instance.endPoint.add(zoomedMovement);
  }

  @HostListener('document:mouseup', ['$event']) onMouseUp(e: MouseEvent) {
    if (!this.componentRef || e.button !== MouseButtons.Left) return;

    e.preventDefault();
    e.stopPropagation();
    this.componentRef.instance.crystall();
    if (!this.componentRef.instance.isIegalLine) {
      this._svgBus.removeTemporaryComponent(this.componentIdx);
    } else {
      this._svgBus.solidifyTemporaryComponent(this.componentIdx);
      if (this._type === 'dashed') {
        this.type = 'solid';
      }
    }
    this.componentRef = undefined;
  }

  ngOnDestroy() {
    this.componentRef = undefined;
  }
}
