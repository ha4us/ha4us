import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { map, take, withLatestFrom } from 'rxjs/operators'
import { Visor } from '../../models'
import { VisorService } from '../../services/visor.service'

const debug = require('debug')('ha4us:gui:visor:tabs')
@Component({
  selector: 'ha4us-visor-tab',
  templateUrl: './visor-tab.component.html',
  styleUrls: ['./visor-tab.component.scss'],
})
export class VisorTabComponent implements OnInit {
  visors: Observable<Visor[]>

  tab$: Observable<{
    visors: Visor[];
    selectedIndex: number;
  }>

  activeIdx: Observable<number>

  constructor(protected vs: VisorService) {}

  ngOnInit() {
    this.tab$ = this.vs.mainContainer$.pipe(
      withLatestFrom(this.vs.visors$),
      map(([main, visors]) => {
        return {
          visors,
          selectedIndex: visors.findIndex(visor => visor.id === main),
        }
      })
    )
  }

  createVisor() {
    const visor = new Visor('Neu')
    this.vs.addComponent(visor)
    this.vs.goto(visor.id, true)
  }

  select(event) {
    this.vs.visors$.pipe(take(1)).subscribe(visors => {
      debug(
        `Selecting Visor No. ${event.index} with id ${visors[event.index].id}`
      )
      this.vs.goto(visors[event.index].id, true)
    })
  }
}
