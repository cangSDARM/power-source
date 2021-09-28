import { patchNgLifeCycle } from './until';

/**
 * A ElementRef Event Listener.
 * Auto inject: **event**
 */
export function RefEventListener(elRef: string, event: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const internalElRef = `__internal_${elRef}__`;
    const patchName = `__${propertyKey}_${event}_listen_on__`;

    patchNgLifeCycle(target, 'ngAfterViewInit', function (this: any) {
      this[internalElRef] = this[elRef];
      const setPatch = () => {
        if (
          !this[patchName] &&
          this[internalElRef]?.nativeElement &&
          this[propertyKey] &&
          typeof this[propertyKey] === 'function'
        ) {
          Object.defineProperty(this, patchName, { value: true });
          this[internalElRef].nativeElement.addEventListener(
            event,
            this[propertyKey].bind(this)
          );
        }
      };
      setPatch();
      Object.defineProperty(this, elRef, {
        get: function () {
          return this[internalElRef];
        },
        set: function (v) {
          setPatch();
          this[internalElRef] = v;
        },
      });
    });
  };
}
