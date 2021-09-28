import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreludeComponent } from './prelude/prelude.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/start',
    pathMatch: 'full',
  },
  {
    path: 'start',
    component: PreludeComponent,
  },
  {
    path: 'svg-builder',
    loadChildren: () =>
      import('src/drawing/drawing.module').then((m) => m.DrawingModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
