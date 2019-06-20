import { Component, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { Dashboard } from '@app/dash2/state/dashboard.model'
import { FormBuilder, FormGroup } from '@angular/forms'
import Debug from 'debug'
const debug = Debug('ha4us:gui:dash2:dashedit')
export interface DashboardEditDialogData {
  dashboard: Dashboard
}

@Component({
  selector: 'ha4us-dashboard-edit-dialog',
  templateUrl: './dashboard-edit-dialog.component.html',
  styleUrls: ['./dashboard-edit-dialog.component.scss'],
})
export class DashboardEditDialogComponent implements OnInit {
  form: FormGroup
  constructor(
    public dialogRef: MatDialogRef<
      DashboardEditDialogComponent,
      DashboardEditDialogData
    >,
    @Inject(MAT_DIALOG_DATA) public data: DashboardEditDialogData,
    protected formBuilder: FormBuilder
  ) {
    this.form = formBuilder.group({
      label: data.dashboard.label,
      media: data.dashboard.media,
    })
  }

  ngOnInit() {
    debug('Data given', this.data)
  }

  save(event: any) {
    this.dialogRef.close({
      dashboard: this.form.value,
    })
  }
}
