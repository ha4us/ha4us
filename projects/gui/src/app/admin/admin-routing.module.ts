import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { Ha4usGuard, Ha4usRoutes, Ha4usPermission } from '@ha4us/ng'
import { MediaEditorComponent } from './media-editor/media-editor.component'
import { ObjectsComponent } from './objects/objects.component'
import { MqttComponent } from './mqtt/mqtt.component'
const routes: Ha4usRoutes = [
  {
    path: '',
    redirectTo: 'objects',
  },
  {
    path: 'objects',
    data: {
      auth: [Ha4usPermission.ReadObjects],
    },
    component: ObjectsComponent,
  },
  {
    path: 'states',
    canActivateChild: [Ha4usGuard],
    component: MqttComponent,
  },
  {
    path: 'media',
    canActivateChild: [Ha4usGuard],
    component: MediaEditorComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
