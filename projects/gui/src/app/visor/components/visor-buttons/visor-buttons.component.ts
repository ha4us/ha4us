import {
    Component,
    OnInit,
    Input,
    ChangeDetectionStrategy,
} from '@angular/core'

import { Router, ActivatedRoute } from '@angular/router'

import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Ha4usWidget } from '@app/widgets'

@Component({
    selector: 'ha4us-visor-buttons',
    templateUrl: './visor-buttons.component.html',
    styleUrls: ['./visor-buttons.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
@Ha4usWidget({
    selector: 'visor-buttons',
    label: 'Visor Buttons',
    props: [
        {
            id: 'vertical',
            type: 'boolean',
            label: 'Vertikal',
        },
        {
            id: 'buttons',
            type: 'array',
            label: 'Visoren',
            min: 2,
            max: 8,
            controls: [
                {
                    id: 'visor',
                    type: 'visor',
                    label: 'Visor',
                },
                {
                    id: 'label',
                    type: 'string',
                    label: 'Button Bezeichnung',
                },
            ],
        },
    ],
})
export class VisorButtonsComponent implements OnInit {
    @Input()
    buttons: {
        visor: string
        label: string
    }[]

    @Input() vertical: boolean

    curVisor: Observable<string>

    constructor(protected router: Router, protected route: ActivatedRoute) { }

    ngOnInit() {
        this.curVisor = this.route.params.pipe(map(param => param.label))
    }

    go($event) {
        this.router.navigate(['visor', $event.value])
    }
}
