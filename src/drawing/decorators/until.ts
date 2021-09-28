export function patchNgLifeCycle(
  target: any,
  life: 'ngOnInit' | 'ngOnDestroy' | 'ngAfterViewInit',
  pather: () => void
) {
  const oldLife = target[life] || (() => undefined);
  target[life] = function () {
    pather.call(this);
    oldLife.call(this);
  };
}
