import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

type PipeFilter<T> = (v: T) => boolean;
type PipeTrigger<T> = (v: T) => void;

export class EventPipe<U> {
  private subject: Subject<U> | null = null;
  private start: PipeFilter<U> = () => true;
  private trigger: PipeFilter<U> = () => true;
  private end: PipeFilter<U> = () => true;

  private isStatred = false;

  constructor() {}

  setSubject(subject: Subject<U>) {
    this.subject = subject;
    return this;
  }

  startWhen(st: PipeFilter<U>) {
    this.start = st;
    return this;
  }

  triggerWhen(trigger: PipeFilter<U>) {
    this.trigger = trigger;
    return this;
  }

  endWhen(end: PipeFilter<U>) {
    this.end = end;
    return this;
  }

  bind(
    onTrigger: PipeTrigger<U>,
    onStart?: PipeTrigger<U>,
    onEnd?: PipeTrigger<U>
  ) {
    if (this.subject) {
      this.subject.pipe(filter(this.start)).subscribe({
        next: (v) => {
          this.isStatred = true;
          onStart && onStart(v);
        },
      });
      this.subject.pipe(filter(this.trigger)).subscribe({
        next: (v) => {
          if (this.isStatred) onTrigger(v);
        },
      });
      this.subject.pipe(filter(this.end)).subscribe({
        next: (v) => {
          if (!this.isStatred) return;
          this.isStatred = false;
          onEnd && onEnd(v);
        },
      });
      return;
    }

    throw new Error('no subject can subscribe for');
  }

  unbind() {
    this.start = function () {
      return true;
    };
    this.trigger = function () {
      return true;
    };
    this.end = function () {
      return true;
    };
    this.subject = null;
  }
}
