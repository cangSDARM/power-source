import * as Rx from 'rxjs';
import { ArrayElement, MouseButtons } from 'src/gobal';
import { EventPipe } from 'utils/event';
import { isUndef } from 'utils/type-assert';

const mouseEvents = [
  'mouseenter',
  'mouseleave',
  'mousedown',
  'mouseup',
  'mousemove',
] as const;

const eventAccurateButton = ['mousedown', 'mouseup'];

export type MouseStateData = [ArrayElement<typeof mouseEvents>, MouseEvent];

export class MouseBus {
  constructor() {
    this.ep = new EventPipe<MouseStateData>();
  }

  static mouseEvents = mouseEvents;
  static eventAccurateButton = eventAccurateButton;

  private ep: EventPipe<MouseStateData>;
  private mouseState: Rx.Subject<
    [ArrayElement<typeof mouseEvents>, MouseEvent]
  > = new Rx.Subject();
  private comp?: HTMLElement | SVGElement;

  bind(comp: HTMLElement | SVGElement) {
    this.comp = comp;

    MouseBus.mouseEvents.forEach((item) => {
      this.comp!.addEventListener(item, (e) =>
        this.mouseState.next([item, e as MouseEvent])
      );
    });
  }

  listen(config: {
    start?: MouseStateData[0][] | MouseStateData[0];
    end?: MouseStateData[0][] | MouseStateData[0];
    trigger: MouseStateData[0];
    for?: MouseButtons;
  }) {
    const checkEvent = function <T>(t: T, v?: T | T[]) {
      return v ? (Array.isArray(v) ? v.includes(t) : t === v) : true;
    };
    const checkButton = isUndef(config.for)
      ? function () {
          return true;
        }
      : function (state: MouseStateData) {
          if (!eventAccurateButton.includes(state[0])) {
            return true;
          }
          return config.for === state[1].button;
        };

    this.ep
      .setSubject(this.mouseState)
      .startWhen(
        (s) =>
          //make sure we are bind for this svg element, otherwise target should handle events by themself
          s[1].target === s[1].currentTarget &&
          checkEvent(s[0], config.start) &&
          checkButton(s)
      )
      .endWhen((s) => checkEvent(s[0], config.end) && checkButton(s))
      .triggerWhen(([t]) => t === config.trigger);

    return this.ep.bind.bind(this.ep);
  }

  remove() {
    this.mouseState.complete();
    this.mouseState.unsubscribe();
    this.ep.unbind();
    this.comp = undefined;
  }
}
