import { Injectable, OnDestroy } from '@angular/core';
import { MouseBus } from 'utils/event';

@Injectable({
  providedIn: 'root',
})
export class SvgbusService implements OnDestroy {
  constructor() {}

  private _svg?: SVGElement;
  private svgBus = new MouseBus();

  private _content?: SVGGElement;

  set content(ct: SVGGElement) {
    // only set this in once, prevent other component try set this
    if (!this._content) {
      this._content = ct;
    }
  }

  set svg(ns: SVGElement) {
    this._svg = ns;
    this.svgBus.bind(this._svg);
  }

  get svg() {
    if (!this._svg) {
      throw new Error('no svg in service');
    }

    return this._svg;
  }

  bind(config: Parameters<typeof MouseBus.prototype.listen>[0]) {
    return this.svgBus.listen(config);
  }

  ngOnDestroy(): void {
    this.svgBus.remove();
    this._svg = undefined;
  }

  private tempCompIdx = -1;
  appendTemporaryComponent(ele: SVGElement) {
    if (this.tempCompIdx > -1)
      console.warn(
        "still have a temp component and it shouldn't happend. You need finish its process then append others"
      );

    if (!this._content) {
      console.error('no content found to insert any child');
      return;
    }

    this._content.appendChild(ele);
    this.tempCompIdx = this._content.childNodes.length - 1;
    return this.tempCompIdx;
  }

  removeTemporaryComponent(idx: number) {
    try {
      this._content?.removeChild(
        this._content.childNodes[this.temporaryComponentCheck(idx)]
      );
      this.tempCompIdx = -1;
    } catch (e) {
      console.error('remove component failur', e);
    }
  }

  solidifyTemporaryComponent(idx: number) {
    if (
      this.temporaryComponentCheck(idx) !== this.tempCompIdx ||
      this.tempCompIdx < 0
    )
      console.warn("solidify don't works, no any temporary component found");

    this.tempCompIdx = -1;
  }

  private temporaryComponentCheck(idx: number) {
    if (this.tempCompIdx !== idx) {
      console.error("it's not the right temporary component");
    }

    if (idx > 0 && idx < (this._content?.childNodes.length || 0)) {
      return idx;
    } else {
      console.error('passed in idx isnot the illgal number, use internal idx');
      return this.tempCompIdx;
    }
  }
}
