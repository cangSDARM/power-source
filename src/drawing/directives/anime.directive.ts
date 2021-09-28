import {
  AfterViewInit,
  Component,
  ComponentRef,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Point } from 'math/point';
import { NgHelperService } from 'src/services/ngcomps.service';

///https://www.zhangxinxu.com/wordpress/2014/08/so-powerful-svg-smil-animation/
@Component({
  selector: 'animator',
  template: `<svg:animate
    nowrapper
    fill="freeze"
    [attr.attributeName]="attributeName"
    begin="indefinite"
    calcMode="spline"
    keyTimes="0; 1"
    keySplines=".2 1 1 1"
    dur="200ms"
    [attr.values]="animateValues"
    #elRef
  ></svg:animate>`,
})
export class AnimeComponent implements AfterViewInit {
  @ViewChild('elRef', { read: ElementRef }) elRef!: ElementRef;

  ngAfterViewInit() {
    setTimeout(() => {
      this.anime(this.size.x, this.size.x);
    }, 0);
  }

  animateValues: `${string};${string}` = '0;0';
  size = Point.zero();
  attributeName = 'r';

  start() {
    this.anime(this.size.x, this.size.y);
  }

  end() {
    this.anime(this.size.y, this.size.x);
  }

  private anime(from: number, to: number) {
    this.animateValues = `${from};${to}`;
    this.elRef.nativeElement.beginElement();
  }
}

@Directive({
  selector: '[animatable]',
  exportAs: 'animatable',
})
export class AnimeDirective implements OnInit, OnDestroy {
  constructor(
    private viewContainerRef: ViewContainerRef,
    private _ngHelper: NgHelperService
  ) {}

  private _size = new Point(0, 5);
  @Input('anime-size') set size(input: [number, number]) {
    this._size = Point.from(input);
  }

  @Input('anime-attribute') attribute = 'r';

  componentRef: ComponentRef<AnimeComponent> | null = null;

  ngOnInit() {
    this.componentRef = this._ngHelper.createDynamicComponent(AnimeComponent);
    this.componentRef.instance.size = this._size;
    this.componentRef.instance.attributeName = this.attribute;

    this.viewContainerRef.element.nativeElement.appendChild(
      this.componentRef.location.nativeElement
    );
  }

  start() {
    this.componentRef?.instance.start();
  }

  end() {
    this.componentRef?.instance.end();
  }

  ngOnDestroy() {
    this.componentRef?.destroy();
    this.componentRef = null;
  }
}
