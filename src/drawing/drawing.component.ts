import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Point } from 'math/point';
import * as Rx from 'rxjs';
import { DataListener } from 'src/drawing/decorators/data-bind';
import { AnimeDirective } from 'src/drawing/directives/anime.directive';
import { MouseButtons } from 'src/gobal';
import { SvgbusService } from 'src/services/svgbus.service';
import { parse, stringify, TransformObject } from 'utils/transform-parser';
import Data from './data';
import { RefEventListener } from './decorators/ref-event-listener';
import { MoveDirective } from './directives/move.directive';

@Component({
  selector: 'layer-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.sass'],
})
export class DrawingComponent implements OnInit, AfterViewInit {
  constructor(private svgbus: SvgbusService) {}

  @ViewChild('svgEl', { read: ElementRef }) svgEl!: ElementRef<SVGElement>;
  @ViewChild('contentEl', { read: ElementRef })
  contentEl!: ElementRef<SVGGElement>;

  sectionStyle: Record<string, string> = {};
  transform = '';

  ngOnInit() {
    document.body.oncontextmenu = null;
    document.body.addEventListener(
      'contextmenu',
      (event) => event.preventDefault(),
      true
    );
    this.listenDataChange();
  }

  contextMenuTransform = '';
  contextMenuShow = false;

  @RefEventListener('svgEl', 'mousedown')
  onMiddleClick(e: MouseEvent) {
    if (e.button !== MouseButtons.Middle || !Data.data.editorMode) {
      this.hiddenContextMenu();
      return;
    }

    e.preventDefault();

    this.contextMenuTransform = `translate(${e.pageX}px, ${e.pageY}px)`;
    this.contextMenuShow = true;
  }

  @DataListener(Data.editorMode, (t) => !t)
  hiddenContextMenu() {
    this.contextMenuTransform = '';
    this.contextMenuShow = false;
  }

  ngAfterViewInit() {
    this.svgbus.svg = this.svgEl.nativeElement;
    this.svgbus.content = this.contentEl.nativeElement;
  }

  onMoveStart(instance: MoveDirective) {
    instance.renderer.addClass(instance.elRef.nativeElement, 'cursor-drag');
  }

  onMoveEnd(instance: MoveDirective) {
    instance.renderer.removeClass(instance.elRef.nativeElement, 'cursor-drag');
  }

  motionCallback(movement: Point) {
    Data.position.next(Data.data.position.add(movement));
  }

  activeAnimate(animtor: AnimeDirective, start = false) {
    if (start) {
      animtor.start();
    } else {
      animtor.end();
    }
  }

  private listenDataChange() {
    let { zoom, position } = Data.init;
    Rx.merge(Data.position, Data.zoom).subscribe({
      next: (x) => {
        if (x instanceof Point) {
          position = x;
        } else {
          zoom = x;
        }
        this.setGStyle(zoom, position);
        this.setSectionStyle(zoom, position);
      },
    });
  }

  private setGStyle(zoom: number, position: Point) {
    const merged: TransformObject = Object.assign({}, parse(this.transform), {
      ///NOTE: this order is not swapable!!! svg transform is NOT a swapable matrix
      translate: position.join(','),
      scale: zoom,
    });
    this.transform = stringify(merged);
  }

  private setSectionStyle(zoom: number, position: Point) {
    const size = zoom * Data.data.gridSize;
    const biasX = position.x % size;
    const biasY = position.y % size;

    this.sectionStyle = {
      'background-size': `${size}px`,
      'background-position': `${biasX}px ${biasY}px`,
    };
  }

  @HostListener('document:keydown.shift', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.repeat) return; /// https://segmentfault.com/q/1010000007245255

    Data.editorMode.next(true);
  }

  @HostListener('document:keyup.shift', ['$event'])
  onKeyUp(e: KeyboardEvent) {
    Data.editorMode.next(false);
  }
}
