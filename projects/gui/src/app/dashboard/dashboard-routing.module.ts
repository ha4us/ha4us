import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { Ha4usGuard } from '@ha4us/ng'

import { DashboardMainComponent } from './components/dashboard-main/dashboard-main.component'
const routes: Routes = [
  {
    path: '',
    canActivate: [Ha4usGuard],
    redirectTo: 'default',
  },
  {
    path: ':tag',
    canActivate: [Ha4usGuard],
    component: DashboardMainComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
