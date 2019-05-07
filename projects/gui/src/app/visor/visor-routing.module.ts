import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { VisorMainComponent } from './components/visor-main/visor-main.component'
import { VisorCanvasComponent } from './components/visor-canvas/visor-canvas.component'
import { VisorGuard } from './guards/visor'

const routes: Routes = [
  {
    path: ':label',
    canActivate: [VisorGuard],
    component: VisorMainComponent,
  },
  {
    path: '',
    canActivate: [VisorGuard],
    component: VisorMainComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisorRoutingModule {}
