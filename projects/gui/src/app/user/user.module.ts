import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MatFormFieldModule } from '@angular/material/form-field'
import { MatDividerModule } from '@angular/material/divider'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatListModule } from '@angular/material/list'
import { MatSidenavModule } from '@angular/material/sidenav'

import { Ha4usModule } from '@ha4us/ng'
import { UsFormsModule } from '@ulfalfa/ng-util'

import { UserRoutingModule } from './user-routing.module'
import { UserFormComponent } from './components/user-form/user-form.component'
import { UserListEditComponent } from './components/user-list-edit/user-list-edit.component'

@NgModule({
  declarations: [UserFormComponent, UserListEditComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    Ha4usModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    UsFormsModule,
  ],
  exports: [UserListEditComponent],
})
export class UserModule {}
