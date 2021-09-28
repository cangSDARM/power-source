import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NowarpperModule } from 'src/nowarpper/nowapper.module';
import { SvgbusService } from 'src/services/svgbus.service';
import { TooltipModule } from 'src/tooltip/tooltip.module';
import { NgHelperService } from './../services/ngcomps.service';
import { ActionsComponent } from './comps/actions/actions.component';
import { ContextMenuComponent } from './comps/context-menu/context-menu.component';
import { LabelComponent } from './comps/label/label.component';
import { LineComponent } from './comps/line/line.component';
import { PointComponent } from './comps/point/point.component';
import { SectionBoxComponent } from './comps/section-box/section-box.component';
import { AnimeComponent, AnimeDirective } from './directives/anime.directive';
import { EditHighlightDirective } from './directives/edit-highlight.directive';
import { MoveDirective } from './directives/move.directive';
import { ZoomDirective } from './directives/zoom.directive';
import { RoutingModule } from './drawing-routing.module';
import { DrawingComponent } from './drawing.component';

@NgModule({
  declarations: [
    DrawingComponent,
    SectionBoxComponent,
    ActionsComponent,
    ZoomDirective,
    MoveDirective,
    AnimeDirective,
    EditHighlightDirective,
    AnimeComponent,
    LabelComponent,
    PointComponent,
    LineComponent,
    ContextMenuComponent,
  ],
  imports: [CommonModule, RoutingModule, TooltipModule, NowarpperModule],
  providers: [SvgbusService, NgHelperService],
})
export class DrawingModule {}
