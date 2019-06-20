import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatExpansionModule,
  MatToolbarModule,
  MatTooltipModule,
  MatProgressBarModule,
  MatTabsModule,
  MatCardModule,
  MatFormFieldModule,
} from '@angular/material'

import { FlexLayoutModule } from '@angular/flex-layout'

import { Ha4usColorPickerModule } from '@app/color-picker'
import { UsLayoutModule, FormbuilderService } from '@ulfalfa/ng-util'
import { Ha4usMapModule } from '@app/map'

import { Ha4usModule } from '@ha4us/ng'
import { UsCommonModule, UsFormsModule } from '@ulfalfa/ng-util'

import { MainModule } from '@app/main'

import { Ha4usDashboardModule } from '@app/dashboard/dashboard.module'

import { SandboxRoutingModule } from './sandbox-routing.module'

import { SandboxComponent } from './components/sandbox/sandbox.component'
import { WidgetsModule } from '@app/widgets'

@NgModule({
  declarations: [SandboxComponent],
  imports: [
    CommonModule,
    SandboxRoutingModule,
    MainModule,
    Ha4usModule,
    Ha4usDashboardModule,
    FlexLayoutModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    UsFormsModule.forFeature(),
    WidgetsModule.forFeature(),
  ],
})
export class SandboxModule {}
