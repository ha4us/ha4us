import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { TestComponent } from './components/test/test.component'
import { PreloadMediaGuard } from '@ha4us/ng'
import { PreloadObjectsGuard } from '@ha4us/ng'
const routes: Routes = [
    { path: '', canActivate: [PreloadObjectsGuard, PreloadMediaGuard], component: TestComponent },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TestRoutingModule { }
