import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { AuthGuard } from '@ha4us/ng'
import { PreloadObjectsGuard } from '@ha4us/ng'
import { ScriptEditorComponent } from './components/script-editor/script-editor.component'
import { ScriptListComponent } from './components/script-list/script-list.component'
import { CanDeactivateGuard } from '@ha4us/ng'
const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, PreloadObjectsGuard],

    component: ScriptListComponent,
  },
  {
    path: ':topic',
    canActivate: [AuthGuard, PreloadObjectsGuard],
    canDeactivate: [CanDeactivateGuard],
    component: ScriptEditorComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScriptsRoutingModule {}
