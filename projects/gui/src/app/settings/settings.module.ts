import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DragDropModule } from '@angular/cdk/drag-drop'

import { UsFormsModule } from '@ulfalfa/ng-util'
import { MainModule } from '@app/main'
import { Ha4usColorPickerModule } from '@app/color-picker'
import { SettingsRoutingModule } from './settings-routing.module'
import { ListComponent } from './components/role/role-list.component'
import { SettingsComponent } from './components/settings/settings.component'
import { DashboardComponent } from './components/dashboard/dashboard.component'

@NgModule({
  declarations: [ListComponent, SettingsComponent, DashboardComponent],
  imports: [
    CommonModule,
    MainModule,
    DragDropModule,
    UsFormsModule.forFeature(),
    Ha4usColorPickerModule,
    SettingsRoutingModule,
  ],
})
export class SettingsModule {}
