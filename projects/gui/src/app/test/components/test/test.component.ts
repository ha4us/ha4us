import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { StatesService } from '@ha4us/ng'
import { take } from 'rxjs/operators'

import { UserService } from '@ha4us/ng'
@Component({
  selector: 'ha4us-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
  /*editorOptions = { theme: 'vs-dark', language: 'json' }
    code: string = 'function x() {\nconsole.log("Hello world!");\n}'*/

  allTags = 'Hamburg,Bremen,Berlin,München,Hannover,Frankfurt,Dresden,Chemnitz,Kiel,Flensburg,Test,Köln'.split(
    ','
  )

  test: any

  required = true

  user = this.us.getOne('admin')

  value = 1
  myForm = new FormGroup({})
  fc = new FormControl(undefined, [Validators.required])
  constructor(state: StatesService, protected us: UserService) {
    // this.myForm = this.fbs.form(this.controls)
    this.myForm = new FormGroup({
      yaml: new FormControl(),
    })
  }

  ngOnInit() {}

  changed($event) {
    console.log($event)
  }
}
