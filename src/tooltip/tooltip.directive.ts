import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';

const template = `
<div arraw="true"></div>
<div>{{ tip }}</div>`;

@Component({
  selector: 'tooltip',
  template: template,
  styleUrls: ['./tooltip.component.sass'],
  host: {
    type: 'tooltip',
    '[style.top.px]': 'top',
    '[style.left.px]': 'left',
    '[style.visibility]': 'visibility',
  },
})
export class TooltipComponent {
  constructor() {}

  tip: string = '';
  top = 0;
  left = 0;
  visibility = 'visible';

  show(ele: HTMLElement) {
    const clientRect = ele.getBoundingClientRect();
    this.top = ele.offsetTop - clientRect.height / 2;
    this.left = ele.offsetLeft + clientRect.width / 2;
    this.visibility = 'visible';
  }

  hiden() {
    this.visibility = 'hidden';
  }
}

@Directive({
  selector: '[tooltip]',
  exportAs: 'tooltip',
})
export class TooltipDirective implements OnDestroy {
  constructor(
    private _renderer: Renderer2,
    private elRef: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private viewContainerRef: ViewContainerRef
  ) {}

  static tipId = 0;

  @Input('tooltip') tooltip: string = '';
  @Input('direction') direction: 'top' = 'top';
  @Input('tooltip-id') id: string = '';

  @HostListener('focusin')
  @HostListener('mouseenter')
  onMouseEnter() {
    this.show();
  }

  @HostListener('focusout')
  @HostListener('mouseleave')
  onMouseLeave() {
    this.hide();
  }

  componentRef: ComponentRef<TooltipComponent> | null = null;

  private show() {
    if (this.componentRef == null) {
      this.createTooltipEle();
    }

    this.componentRef!.instance.tip = this.tooltip;
    this._renderer.setAttribute(
      this.elRef.nativeElement,
      'aria-describedby',
      this.id
    );
    this.componentRef?.instance.show(this.elRef.nativeElement);
  }

  private createTooltipEle() {
    this.componentRef = this.componentFactoryResolver
      .resolveComponentFactory(TooltipComponent)
      .create(this.injector);

    this.id = `tip-${TooltipDirective.tipId++}`;
    this._renderer.setAttribute(
      this.componentRef?.location.nativeElement,
      'id',
      this.id
    );
    this.viewContainerRef.insert(this.componentRef.hostView);
  }

  private hide() {
    // this.destory();
    this.componentRef?.instance.hiden();
    this._renderer.removeAttribute(
      this.elRef.nativeElement,
      'aria-describedby'
    );
  }

  private destory() {
    this.componentRef?.destroy();
    this.componentRef = null;
  }

  ngOnDestroy() {
    this.destory();
  }
}
