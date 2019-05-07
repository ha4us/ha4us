import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import {
  MatListModule,
  MatToolbarModule,
  MatDialogModule,
  MatSnackBarModule,
} from '@angular/material'
import { FlexLayoutModule } from '@angular/flex-layout'
import { Ha4usModule } from '@ha4us/ng'

import { MainComponent } from './components/main/main.component'
import { WelcomeComponent } from './components/welcome/welcome.component'
import { MenuComponent } from './components/menu/menu.component'
import { ToolbarComponent } from './components/toolbar/toolbar.component'
import { LoginComponent } from './components/login/login.component'
import { NotfoundComponent } from './components/notfound/notfound.component'
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component'

import { UserinfoComponent } from './components/userinfo/userinfo.component'
import { WildcardPipe } from './pipes/wilcard'
@NgModule({
  imports: [
    CommonModule,
    Ha4usModule,
    RouterModule,
    MatListModule,
    MatToolbarModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  declarations: [
    MainComponent,
    WelcomeComponent,
    MenuComponent,
    ToolbarComponent,
    LoginComponent,
    ConfirmDialogComponent,
    NotfoundComponent,

    UserinfoComponent,
    WildcardPipe,
  ],
  entryComponents: [ConfirmDialogComponent],
  exports: [ToolbarComponent, Ha4usModule, WildcardPipe],
})
export class MainModule {}
