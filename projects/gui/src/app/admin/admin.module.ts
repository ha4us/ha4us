import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { Ha4usModule } from '@ha4us/ng'
import { MainModule } from '@app/main'
import { AdminRoutingModule } from './admin-routing.module'
import { MediaEditorComponent } from './media-editor/media-editor.component'
import { ObjectsComponent } from './objects/objects.component'
import { MqttComponent } from './mqtt/mqtt.component'

@NgModule({
  declarations: [MediaEditorComponent, ObjectsComponent, MqttComponent],
  imports: [Ha4usModule, MainModule, MatButtonToggleModule, AdminRoutingModule],
})
export class AdminModule {}
