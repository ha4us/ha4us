import {
  NgModule,
  Type,
  ModuleWithProviders,
  Injector,
  Optional,
  SkipSelf,
  Self,
} from '@angular/core'
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
} from '@angular/material'

import { FlexLayoutModule } from '@angular/flex-layout'

import { Ha4usColorPickerModule } from '@app/color-picker'
import { UsLayoutModule } from '@ulfalfa/ng-util'
import { Ha4usMapModule } from '@app/map'

import { Ha4usModule } from '@ha4us/ng'
import { UsCommonModule, UsFormsModule } from '@ulfalfa/ng-util'
import { ColorHueModule } from 'ngx-color/hue'
import { HA4US_WIDGETS, Ha4usWidgetLib } from './models'

import { WidgetService } from '../widgets/widget.service'
import {
  ButtonComponent,
  IndicatorComponent,
  // SelectComponent,
  SliderComponent,
  SwitchComponent,
  ValueComponent,
  IndicatorButtonComponent,
  ColorComponent,
  ImgComponent,
} from './widgets'
import { WidgetComponent } from './components/widget/widget.component'
import { SonosComponent } from './widgets/sonos/sonos.component'
import { ProgressComponent } from './widgets/sonos/progress.component'
import { HueComponent } from './widgets/hue/hue.component'
import { CssDirective } from './css.directive'
const basewidgets = [
  ButtonComponent,
  IndicatorComponent,
  // SelectComponent,
  SliderComponent,
  SwitchComponent,
  ValueComponent,
  IndicatorButtonComponent,
  ColorComponent,
  ImgComponent,
  SonosComponent,
  HueComponent,
]
export function wsFactory(widgets: Ha4usWidgetLib[], ws: WidgetService) {
  widgets.forEach(widgetSet => ws.registerLibrary(widgetSet))
  return ws
}

@NgModule({
  imports: [
    CommonModule,
    Ha4usModule,
    UsCommonModule,
    ColorHueModule,
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    Ha4usMapModule,
    Ha4usColorPickerModule,
    MatButtonToggleModule,
    UsLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatTabsModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    UsFormsModule.forFeature(),
  ],
  declarations: [
    ...basewidgets,
    WidgetComponent,
    ImgComponent,
    SonosComponent,
    ProgressComponent,
    HueComponent,
    CssDirective,
  ],
  entryComponents: [...basewidgets],
  exports: [WidgetComponent, ...basewidgets],
  providers: [
    {
      provide: HA4US_WIDGETS,
      useValue: { widgets: basewidgets },
      multi: true,
    },
  ],
})
export class WidgetsModule {
  static forFeature(
    widgets: Type<any>[] = [],
    library?: string
  ): ModuleWithProviders {
    return {
      ngModule: WidgetsModule,
      providers: [
        {
          provide: HA4US_WIDGETS,
          useValue: { widgets, name: library },
          multi: true,
        },
        {
          provide: WidgetService,
          useClass: WidgetService,
          deps: [HA4US_WIDGETS],
        },
      ],
    }
  }
}
