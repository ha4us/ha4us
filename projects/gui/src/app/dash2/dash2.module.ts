import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import {
  MatButtonModule,
  MatSliderModule,
  MatCardModule,
  MatButtonToggleModule,
  MatListModule,
  MatIconModule,
  MatTabsModule,
  MatTooltipModule,
  MatDialogModule,
} from '@angular/material'
import { Ha4usModule } from '@ha4us/ng'

import { GridsterModule } from 'angular-gridster2'

import { UsCommonModule } from '@ulfalfa/ng-util'

import { MainModule } from '@app/main'

import { Dash2RoutingModule } from './dash2-routing.module'
import { DashboardComponent } from './components/dashboard/dashboard.component'
import { DashboardTabsComponent } from './components/dashboard-tabs/dashboard-tabs.component'
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component'
import { DashboardGridComponent } from './components/dashboard-grid/dashboard-grid.component'

import { DashboardEditDialogComponent } from './components/dashboard-edit-dialog/dashboard-edit-dialog.component'
import { CardEditDialogComponent } from './components/card-edit-dialog/card-edit-dialog.component'

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardTabsComponent,
    DashboardCardComponent,
    DashboardGridComponent,

    DashboardEditDialogComponent,
    CardEditDialogComponent,
  ],
  entryComponents: [DashboardEditDialogComponent, CardEditDialogComponent],
  imports: [
    CommonModule,
    UsCommonModule,
    Dash2RoutingModule,
    Ha4usModule,
    MainModule,
    GridsterModule,
    MatButtonModule,
    MatDialogModule,
    MatSliderModule,
    MatCardModule,
    MatButtonToggleModule,
    MatListModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
  ],
})
export class Dash2Module {}
