import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { UsFormsModule } from '@ulfalfa/ng-util'
import { DragDropModule } from '@angular/cdk/drag-drop'
import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
} from '@angular/material'

import { FlexLayoutModule } from '@angular/flex-layout'
import { MapComponent } from './components/map/map.component'
import { MapEditorComponent } from './components/map-editor/map-editor.component'
import { MapPipe } from './pipes/map.pipe'
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    DragDropModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    UsFormsModule.forProvider([MapComponent]),
  ],
  declarations: [MapEditorComponent, MapPipe, MapComponent],
  entryComponents: [MapEditorComponent, MapComponent],
  exports: [MapEditorComponent, MapPipe, MapComponent],
})
export class Ha4usMapModule {}
