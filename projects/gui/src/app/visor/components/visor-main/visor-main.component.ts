import { Component, OnDestroy, OnInit } from '@angular/core'
import { Observable, Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { VisorEntity, VisorId } from '../../models'
import { VisorService } from '../../services/visor.service'

const debug = require('debug')('ha4us:gui:visor:main')
@Component({
  selector: 'ha4us-visor-main',
  templateUrl: './visor-main.component.html',
  styleUrls: ['./visor-main.component.scss'],
})
export class VisorMainComponent implements OnInit, OnDestroy {
  editmode: boolean
  selected: Observable<VisorEntity>

  visor: Observable<VisorId>

  protected sub: Subscription

  constructor(protected vs: VisorService) {}

  ngOnInit() {
    this.sub = this.vs.editMode$.subscribe(editMode => {
      this.editmode = editMode
    })

    this.selected = this.vs.selectedEntity
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  updateWidget(update: { id: VisorId; changes: Partial<VisorEntity> }) {
    debug(`${update.id} will be updated`)
    this.vs.updateComponent(update)
  }

  removeSelected(event: any) {
    this.vs.selected$.pipe(take(1)).subscribe(id => {
      debug(`Removing widget ${id}`)
      this.vs.remove(id)
    })
  }
}
