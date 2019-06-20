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
        loadChildren: './dashboard/dashboard.module#Ha4usDashboardModule',
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
      },
      {
        path: 'statistic',
        loadChildren: './statistic/statistic.module#StatisticModule',
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
      },
      {
        path: 'admin',
        loadChildren: './admin/admin.module#AdminModule',
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
      },
      {
        path: 'scripts',
        loadChildren: './scripts/scripts.module#Ha4usScriptsModule',
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
      },
      {
        path: 'test',
        loadChildren: './test/test.module#TestModule',
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
      },
      {
        path: 'settings',
        loadChildren: './settings/settings.module#SettingsModule',
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
      },
      {
        path: 'visor',
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
        loadChildren: './visor/visor.module#VisorModule',
      },
      {
        path: 'widgets',
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
        loadChildren: './sandbox/sandbox.module#SandboxModule',
      },
      {
        path: 'dash2',
        canActivate: [Ha4usGuard],
        canActivateChild: [Ha4usGuard],
        loadChildren: './dash2/dash2.module#Dash2Module',
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
