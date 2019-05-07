import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
} from '@angular/core'
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogConfig,
} from '@angular/material'
import { Ha4usObject } from '@ha4us/core'
export interface Ha4usObjectEditDialogData extends MatDialogConfig {
  topic: Ha4usObject
}
@Component({
  selector: 'ha4us-object-edit-dialog',
  templateUrl: './object-edit-dialog.component.html',
  styleUrls: ['./object-edit-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectEditDialogComponent implements OnInit {
  object: Ha4usObject
  constructor(
    public dialogRef: MatDialogRef<ObjectEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Ha4usObjectEditDialogData
  ) {}

  ngOnInit() {}

  save($event: MouseEvent) {
    this.dialogRef.close(this.object)
  }
}
