import { Component, OnInit, OnDestroy, Input, HostBinding } from '@angular/core'

import { VisorService } from '../../services/visor.service'

import { Subscription, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import {
    Visor,
    VisorEntityType,
    VisorWidget,
    VisorEntity,
    VisorId,
} from '../../models'
import { ResizeEvent } from 'angular-resizable-element'
import { DropEvent } from '@ulfalfa/angular-draggable-droppable'

import { AbstractVisorEntity } from '../abstract-visor-entity.component'

@Component({
    selector: 'ha4us-visor',
    templateUrl: './visor.component.html',
    styleUrls: ['./visor.component.scss'],
})
export class VisorComponent extends AbstractVisorEntity {
    constructor(protected vs: VisorService) {
        super(vs)
    }

    public drop(event) {
        if (event.dropData) {
            console.log('Dropped in visor', this.id, event.dropData)
            const child: VisorWidget = event.dropData

            child.x = event.offset.x
            child.y = event.offset.y

            this.vs.addComponent(child, this.id)
        }
    }
}
