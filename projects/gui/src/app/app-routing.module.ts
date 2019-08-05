import { NgModule } from '@angular/core'
import {
  Routes,
  RouterModule,
  PreloadAllModules,
  NoPreloading,
} from '@angular/router'

import { MainComponent } from '@app/main/components/main/main.component'
import { WelcomeComponent } from '@app/main/components/welcome/welcome.component'
import { LoginComponent } from '@app/main/components/login/login.component'
import { Ha4usGuard } from '@ha4us/ng'

import { NotfoundComponent } from '@app/main'
const routes: Routes = [
  {
    path: '404',
    component: NotfoundComponent,
  },
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'welcome', pathMatch: 'full' },
      {
        path: 'welcome',
        canActivate: [Ha4usGuard],
        component: WelcomeComponent,
      },
      { path: 'login', component: LoginComponent },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.Ha4usDashboardModule),
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
      },
      {
        path: 'statistic',
        loadChildren: () => import('./statistic/statistic.module').then(m => m.StatisticModule),
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
      },
      {
        path: 'admin',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
      },
      {
        path: 'scripts',
        loadChildren: () => import('./scripts/scripts.module').then(m => m.Ha4usScriptsModule),
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
      },
      {
        path: 'test',
        loadChildren: () => import('./test/test.module').then(m => m.TestModule),
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
      },
      {
        path: 'visor',
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
        loadChildren: () => import('./visor/visor.module').then(m => m.VisorModule),
      },
      {
        path: 'widgets',
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
        loadChildren: () => import('./sandbox/sandbox.module').then(m => m.SandboxModule),
      },
      {
        path: 'dash2',
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
        loadChildren: () => import('./dash2/dash2.module').then(m => m.Dash2Module),
      },
    ],
  },

  {
    path: '**',
    component: NotfoundComponent,
  },
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
