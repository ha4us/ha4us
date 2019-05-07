import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl } from '@angular/forms'
import { StatesService } from '@ha4us/ng'
import { take } from 'rxjs/operators'
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

  value = 1
  myForm = new FormGroup({})
  constructor(state: StatesService) {
    // this.myForm = this.fbs.form(this.controls)
    this.myForm = new FormGroup({ tags: new FormControl(['test']) })

    state
      .observe('hm/#')
      .pipe(take(1))
      .subscribe(
        val => console.log(val),
        e => console.error(e),
        () => console.log('Finished')
      )
  }

  ngOnInit() {
    this.myForm.valueChanges.subscribe(changes => {
      console.log('Changes', changes)
    })
  }
}
