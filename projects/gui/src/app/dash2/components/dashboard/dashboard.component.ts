import { Component, OnInit } from '@angular/core'

import { DashboardService } from '../../state/dashboard.service'
import { DashboardQuery } from '../../state/dashboard.query'

import { createDashboard, createCard } from '../../state/dashboard.model'

import Debug from 'debug'
import { MatDialog, MatDialogRef } from '@angular/material'
import {
  DashboardEditDialogComponent,
  DashboardEditDialogData,
} from '../dashboard-edit-dialog/dashboard-edit-dialog.component'
const debug = Debug('ha4us:gui:dash2:dashboard')
@Component({
  selector: 'ha4us-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  ui$ = this.query.ui$

  activeDashboard$ = this.query.activeDashboard$

  constructor(
    protected service: DashboardService,
    protected query: DashboardQuery,
    protected dialog: MatDialog
  ) {}

  toggleEditMode() {
    this.service.setEditMode(!this.query.getValue().ui.editMode)
  }

  ngOnInit() {
    this.service.setActive(1)
    const dashone = createDashboard({
      label: 'Eins',
      cards: [createCard({ label: 'Card1' }), createCard({ label: 'Card2' })],
    })
    this.service.set([
      dashone,
      createDashboard({ label: 'Zwei' }),
      createDashboard({ label: 'Drei' }),
    ])

    this.service.move(dashone.id, 1)
    this.service.setActive(dashone.id)
  }

  addDashboard(label: string) {
    debug('Add Dashboard')
    this.service.add(
      createDashboard({
        label,
        cards: [createCard({ label: 'Card1' }), createCard({ label: 'Card2' })],
      })
    )
  }

  moveDashboard(event: any) {
    this.service.move(event.idx, event.delta)
  }

  editDashboard(id: string) {
    debug('Edit Dashboard', id)
    const dialogRef = this.dialog.open(DashboardEditDialogComponent, {
      data: {
        dashboard: this.query.getEntity(id),
      },
    })
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.service.update(id, data.dashboard)
      }
    })
  }
}
