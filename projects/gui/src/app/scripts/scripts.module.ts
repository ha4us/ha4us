import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import {
  MatInputModule,
  MatIconModule,
  MatListModule,
  MatButtonModule,
  MatToolbarModule,
  MatSlideToggleModule,
  MatProgressSpinnerModule,
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher,
} from '@angular/material'

import { ScrollingModule } from '@angular/cdk/scrolling'

import { FlexLayoutModule } from '@angular/flex-layout'

import { MonacoEditorModule } from 'ngx-monaco-editor'

import { Ha4usModule } from '@ha4us/ng'
import { UsLayoutModule } from '@ulfalfa/ng-util'
import { ScriptsRoutingModule } from './scripts-routing.module'
import { ScriptListComponent } from './components/script-list/script-list.component'
import { ScriptEditorComponent } from './components/script-editor/script-editor.component'
import { MainModule } from '@app/main/main.module'
import { LogComponent } from './components/log/log.component'
@NgModule({
  imports: [
    CommonModule,
    ScriptsRoutingModule,
    Ha4usModule,
    FormsModule,
    FlexLayoutModule,
    ScrollingModule,
    ReactiveFormsModule,
    UsLayoutModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatToolbarModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MonacoEditorModule.forRoot(),
    MainModule,
  ],
  declarations: [ScriptListComponent, ScriptEditorComponent, LogComponent],
  providers: [
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
  ],
})
export class Ha4usScriptsModule {}
