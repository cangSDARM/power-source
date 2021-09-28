import { Subject } from 'rxjs';
import { patchNgLifeCycle } from './until';

export function RequireData<T>(data: Subject<T>, on: (t: T) => boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    let active: boolean = false;
    data.subscribe({
      next: (t) => {
        active = false;
        if (on(t)) active = true;
      },
    });
    descriptor.value = function (...args: any) {
      if (!active) {
        return;
      }
      return original.call(this, ...args);
    };
  };
}

/**
 * **NOTE** this decorator targets' arguments must be _empty_  or _optinal_ at all
 */
export function DataListener<T>(data: Subject<T>, on: (t: T) => boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    const observer = (that: any, ...args: any) => {
      return {
        next: (t: T) => {
          on(t) && original.call(that, ...args);
        },
      };
    };
    const observe = `__data_listener_observe__${propertyKey}`;

    patchNgLifeCycle(target, 'ngOnInit', function (this: any) {
      const that = this as any;
      if (typeof that[propertyKey] !== 'function') {
        throw new Error(
          `DataListener Require a function to bind, but received a ${typeof that[
            propertyKey
          ]} in ${that}`
        );
      }
      if (!that[observe]) {
        Object.defineProperty(that, observe, {
          value: observer(that),
          enumerable: true,
          writable: false,
        });
        data.subscribe(that[observe]);
      }
    });
  };
}
