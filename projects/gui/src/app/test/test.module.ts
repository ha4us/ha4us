import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { FlexLayoutModule } from '@angular/flex-layout'
import {
  MatCardModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatFormFieldModule,
} from '@angular/material'
import { UsLayoutModule } from '@ulfalfa/ng-util'
import { Ha4usModule } from '@ha4us/ng'
import { WidgetsModule } from '@app/widgets'
import { TestRoutingModule } from './test-routing.module'
import { TestComponent } from './components/test/test.component'

import { ColorChromeModule } from 'ngx-color/chrome'
import { ColorHueModule } from 'ngx-color/hue'
import { Ha4usColorPickerModule } from '@app/color-picker'
import { MonacoEditorModule } from 'ngx-monaco-editor'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MatSliderModule,
    ReactiveFormsModule,
    TestRoutingModule,
    UsLayoutModule,
    Ha4usModule,
    Ha4usColorPickerModule,
    WidgetsModule,
    MonacoEditorModule.forRoot(),
  ],
  declarations: [TestComponent],
})
export class TestModule {}
