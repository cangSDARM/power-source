import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

//https://stackoverflow.com/a/35837189/9883803
@Directive({
  selector: '[nowrapper]',
  exportAs: 'nowrapper',
})
export class NowrapperDirective implements AfterViewInit {
  constructor(private elRef: ElementRef<HTMLElement>) {}

  /**
   * Set `true` revert this from out
   */
  @Input('nowrapper') nowrapper: boolean | '' = false;

  ngAfterViewInit() {
    this.removeNgWrappingTag();
  }

  private removeNgWrappingTag() {
    const nativeElement = !!this.nowrapper
        ? this.elRef.nativeElement
        : this.elRef.nativeElement.parentElement!,
      parentElement = nativeElement.parentElement || document.body;
    // move all children out of the element
    while (nativeElement.firstChild) {
      parentElement.insertBefore(nativeElement.firstChild, nativeElement);
    }
    // remove the empty element(the host)
    parentElement.removeChild(nativeElement);
  }
}
