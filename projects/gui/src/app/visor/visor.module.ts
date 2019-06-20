import { NgModule, ModuleWithProviders, Type } from '@angular/core'
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
  MatTabsModule,
  MatCardModule,
} from '@angular/material'

import { FlexLayoutModule } from '@angular/flex-layout'

import { Ha4usModule } from '@ha4us/ng'

import { MainModule } from '@app/main'

import { Ha4usColorPickerModule } from '@app/color-picker'

import { UsFormsModule } from '@ulfalfa/ng-util'

import { DragAndDropModule } from '@ulfalfa/angular-draggable-droppable'
import { ResizableModule } from 'angular-resizable-element'

import { WidgetsModule } from '@app/widgets'

import { VisorRoutingModule } from './visor-routing.module'
import { VisorMainComponent } from './components/visor-main/visor-main.component'
import { VisorComponent } from './components/visor/visor.component'
import { VisorWidgetlibComponent } from './components/visor-widgetlib/visor-widgetlib.component'
import { VisorCanvasComponent } from './components/visor-canvas/visor-canvas.component'
import { VisorWidgetComponent } from './components/visor-widget/visor-widget.component'

import { WidgetEditComponent } from './components/widget-edit/widget-edit.component'

/*export function visorServiceFactory(widgets: Type<any>[][]) {
    return new VisorService( @Inject(Store), @Inject(HA4US_WIDGETS) )
}*/

import { StyleDirective } from './directives/style/style.directive'
import { VisorTabComponent } from './components/visor-tab/visor-tab.component'
import { VisorSelectComponent } from './components/visor-select/visor-select.component'

import { VisorButtonsComponent } from './components/visor-buttons/visor-buttons.component'
@NgModule({
  imports: [
    VisorRoutingModule,
    Ha4usModule,
    UsFormsModule.forFeature([VisorSelectComponent]),
    CommonModule,
    DragAndDropModule,
    FlexLayoutModule,
    MainModule,
    WidgetsModule.forFeature([VisorButtonsComponent], 'visor'),

    FormsModule,

    Ha4usColorPickerModule,

    MatButtonToggleModule,

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
    MatTabsModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    ResizableModule,
  ],
  declarations: [
    VisorMainComponent,
    VisorComponent,
    VisorWidgetlibComponent,
    VisorCanvasComponent,
    VisorWidgetComponent,

    WidgetEditComponent,
    StyleDirective,
    VisorTabComponent,
    VisorSelectComponent,
    VisorButtonsComponent,
  ],
  entryComponents: [VisorSelectComponent, VisorButtonsComponent],
})
export class VisorModule {}
