import {
  NgModule,
  Type,
  ModuleWithProviders,
  Injector,
  Optional,
  SkipSelf,
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
import { UsCommonModule } from '@ulfalfa/ng-util'
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
export function wsFactory(widgets: Ha4usWidgetLib, ws: WidgetService) {
  ws.registerLibrary(widgets)
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
  ],
  declarations: [
    ...basewidgets,
    WidgetComponent,
    ImgComponent,
    SonosComponent,
    ProgressComponent,
    HueComponent,
  ],
  entryComponents: [...basewidgets],
  exports: [WidgetComponent, ...basewidgets],
  providers: [
    {
      provide: HA4US_WIDGETS,
      useValue: { widgets: basewidgets },
      multi: false,
    },
  ],
})
// tslint:disable-next-line:no-trailing-whitespace
export class WidgetsModule {
  static forFeature(
    widgets: Type<any>[] = [],
    library?: string
  ): ModuleWithProviders {
    return {
      ngModule: WidgetsModule,
      providers: [
        {
          provide: WidgetService,
          useFactory: wsFactory,
          deps: [
            HA4US_WIDGETS,
            [WidgetService, new Optional(), new SkipSelf()],
          ],
        },

        {
          provide: HA4US_WIDGETS,
          useValue: { widgets, name: library },
          multi: false,
        },
      ],
    }
  }
}
