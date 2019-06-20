import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { Ha4usGuard } from '@ha4us/ng'

import { SandboxComponent } from './components/sandbox/sandbox.component'
const routes: Routes = [
  {
    path: '',
    component: SandboxComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SandboxRoutingModule {}
