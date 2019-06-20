import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  Input,
  OnDestroy,
} from '@angular/core'
import { GridsterConfig, GridsterItem } from 'angular-gridster2'
import { DashboardService } from '@app/dash2/state/dashboard.service'
import { DashboardQuery } from '@app/dash2/state/dashboard.query'
import {
  map,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  tap,
} from 'rxjs/operators'
import {
  DashboardCard,
  createCard,
  Dashboard,
} from '@app/dash2/state/dashboard.model'
import { Observable } from 'rxjs'
import Debug from 'debug'
import { ID } from '@datorama/akita'
import { untilDestroyed } from 'ngx-take-until-destroy'
const debug = Debug('ha4us:gui:dash2:grid')

interface CardControl extends GridsterItem {
  card: DashboardCard
}

@Component({
  selector: 'ha4us-dashboard-grid',
  templateUrl: './dashboard-grid.component.html',
  styleUrls: ['./dashboard-grid.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardGridComponent implements OnInit, OnDestroy {
  ui$ = this.query.ui$

  editMode = false

  @Input() dashboard: Dashboard

  activeCard$: Observable<CardControl[]> = this.query.selectActive().pipe(
    map(dashboard => dashboard.cards),
    map(cards =>
      cards.map(card => {
        return {
          card,

          x: undefined,
          y: undefined,
          rows: undefined,
          cols: undefined,
        }
      })
    )
  )

  options: GridsterConfig

  constructor(
    protected service: DashboardService,
    protected query: DashboardQuery
  ) {}

  ngOnInit() {
    this.query.ui$
      .pipe(map(state => state.editMode))
      .pipe(untilDestroyed(this))
      .subscribe(editMode => (this.editMode = editMode))
    this.options = {
      // compactType: 'compactUp',
      gridType: 'verticalFixed',
      fixedRowHeight: 10,
      maxRows: 1000,
      minItemRows: 2,
      defaultItemRows: 20,
      displayGrid: 'none',
      pushItems: true,
      draggable: {
        enabled: true,
        dragHandleClass: 'actions',
      },
      resizable: {
        enabled: true,
      },

      itemResizeCallback: (item: GridsterItem, component: any) => {
        debug('Item Resized', item)
      },
    }
  }

  changeHeight(height: number, gridItem: GridsterItem) {
    debug('Height changed', height)
  }

  addCard() {
    debug('Adding card')
    this.service.addCard(createCard({ label: 'Test' }))
  }

  deleteCard(id: string) {
    this.service.deleteCard(id)
    debug('Delete Card ', id)
  }
  editCard(id: string) {
    debug('Edit Card ', id)
  }
  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
  }
}
