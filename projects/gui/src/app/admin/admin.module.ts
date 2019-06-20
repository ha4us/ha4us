import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatDividerModule } from '@angular/material/divider'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatListModule } from '@angular/material/list'
import { MatSidenavModule } from '@angular/material/sidenav'

import { MatExpansionModule } from '@angular/material/expansion'

import { UsFormsModule } from '@ulfalfa/ng-util'

import { Ha4usModule } from '@ha4us/ng'
import { MainModule } from '@app/main'
import { AdminRoutingModule } from './admin-routing.module'
import { MediaEditorComponent } from './media-editor/media-editor.component'
import { ObjectsComponent } from './objects/objects.component'
import { MqttComponent } from './mqtt/mqtt.component'

import { UserFormComponent } from './users/user-form.component'
import { UserListEditComponent } from './users/user-list-edit.component'
@NgModule({
  declarations: [
    MediaEditorComponent,
    ObjectsComponent,
    MqttComponent,
    UserFormComponent,
    UserListEditComponent,
  ],
  imports: [
    Ha4usModule,
    MainModule,
    UsFormsModule.forFeature(),
    MatButtonToggleModule,
    MatFormFieldModule,
    MatDividerModule,
    MatTooltipModule,
    MatListModule,
    MatSidenavModule,
    MatExpansionModule,

    AdminRoutingModule,
  ],
})
export class AdminModule {}
