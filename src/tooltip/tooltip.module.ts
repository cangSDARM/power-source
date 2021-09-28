import { NgModule } from '@angular/core';
import { TooltipComponent, TooltipDirective } from './tooltip.directive';

@NgModule({
  declarations: [TooltipDirective, TooltipComponent],
  imports: [],
  exports: [TooltipDirective, TooltipComponent],
})
export class TooltipModule {}
