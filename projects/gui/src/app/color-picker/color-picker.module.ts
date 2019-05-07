import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import {
  MatButtonModule,
  MatInputModule,
  MatFormFieldModule,
} from '@angular/material'
import { OverlayModule } from '@angular/cdk/overlay'
import { PortalModule } from '@angular/cdk/portal'

import { ColorChromeModule } from 'ngx-color/chrome'
import { ColorGithubModule } from 'ngx-color/github'

import { ColorPickerComponent } from './color-picker/color-picker.component'
import { Ha4usColorFormcontrolComponent } from './ha4us-color-formcontrol/ha4us-color-formcontrol.component'

import { UsFormsModule } from '@ulfalfa/ng-util'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OverlayModule,
    PortalModule,
    ColorChromeModule,
    ColorGithubModule,
    MatButtonModule,

    MatInputModule,
    MatFormFieldModule,
    UsFormsModule.forFeature([Ha4usColorFormcontrolComponent]),
  ],
  declarations: [ColorPickerComponent, Ha4usColorFormcontrolComponent],
  exports: [ColorPickerComponent],
  entryComponents: [Ha4usColorFormcontrolComponent],
})
export class Ha4usColorPickerModule {}
