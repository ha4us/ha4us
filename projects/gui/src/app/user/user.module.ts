import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { MatDividerModule } from '@angular/material/divider'
import { MatTooltipModule } from '@angular/material/tooltip'
import { Ha4usModule } from '@ha4us/ng'
import { UsFormsModule } from '@ulfalfa/ng-util'

import { UserRoutingModule } from './user-routing.module'
import { UserFormComponent } from './components/user-form/user-form.component'

@NgModule({
  declarations: [UserFormComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    Ha4usModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    MatTooltipModule,
    UsFormsModule,
  ],
  exports: [UserFormComponent],
})
export class UserModule {}
