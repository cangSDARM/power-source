import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  Injectable,
  Injector,
  Renderer2,
  Type,
} from '@angular/core';
import { kebabCase } from 'utils/strings';
import { isUndef } from 'utils/type-assert';

@Component({
  template: '',
})
class DynamicComponent {}

@Injectable({
  providedIn: 'root',
})
export class NgHelperService {
  constructor(
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private _appRef: ApplicationRef
  ) {}

  createDynamicComponent<T>(component: Type<T>) {
    const componentRef: ComponentRef<T> = this.resolver
      .resolveComponentFactory(component)
      .create(this.injector);
    this._appRef.attachView(componentRef.hostView);

    return componentRef;
  }

  createDynamicElement<T>(element: T) {
    const factory = this.resolver.resolveComponentFactory(DynamicComponent);
    this._appRef.attachView(
      factory.create(this.injector, [], element).hostView
    );
    return new ElementRef(element);
  }

  static elRefNative<T extends { style: Record<string, any> }>(
    el: ElementRef<T> | T
  ): T {
    if (el instanceof ElementRef || !isUndef((el as any).nativeElement)) {
      return (el as any).nativeElement;
    } else {
      return el;
    }
  }

  ///https://softwareengineering.stackexchange.com/a/367612
  static setStyles<T extends { style: CSSStyleDeclaration }>(
    renderer: Renderer2,
    elRef: ElementRef<T> | T,
    styles: Record<string, string | ((olderData: string) => string)>
  ) {
    const element = NgHelperService.elRefNative(elRef);
    const oldStyles = element.style;

    for (let key in styles) {
      const kebabCaseKey = kebabCase(key);
      const newV = styles[key];
      const oldV = oldStyles.getPropertyValue(kebabCaseKey);
      if (!isUndef(newV) && newV.toString() !== '') {
        if (typeof newV === 'function') {
          oldStyles.setProperty(kebabCaseKey, newV(oldV));
        } else if (typeof newV === 'string' && newV.trim() !== '') {
          oldStyles.setProperty(kebabCaseKey, newV);
        }
      }
    }
  }
}
