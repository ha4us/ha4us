import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs'
import { ScriptService, Ha4usScript } from '../../services/script.service'
@Component({
    selector: 'ha4us-script-list',
    templateUrl: './script-list.component.html',
    styleUrls: ['./script-list.component.scss'],
})
export class ScriptListComponent implements OnInit {
    constructor(
        public scripts: ScriptService,
        protected router: Router,
        protected route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.scripts.search()
    }

    goDetail(script: Ha4usScript) {
        this.router.navigate(['.', script.name], {
            relativeTo: this.route,
            skipLocationChange: false,
        })
    }
}
