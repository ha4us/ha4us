import { Component, OnInit } from '@angular/core'
import { WidgetService } from '@app/widgets/widget.service'
import { FormGroup } from '@angular/forms'
import { tap, filter } from 'rxjs/operators'
import { Observable } from 'rxjs'
@Component({
  selector: 'ha4us-sandbox',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.scss'],
})
export class SandboxComponent implements OnInit {
  widgets = this.ws.groupedWidget$

  formData: any = {}

  data: any

  constructor(protected ws: WidgetService) {}

  ngOnInit() {}
}
