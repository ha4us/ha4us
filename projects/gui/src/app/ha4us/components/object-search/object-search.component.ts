import { Component, OnInit, OnDestroy } from '@angular/core'

import { FormGroup, FormControl } from '@angular/forms'

import { Subscription } from 'rxjs'
import { startWith, debounceTime } from 'rxjs/operators'

import { ObjectService } from '../../services/object.service'

@Component({
  selector: 'ha4us-object-search',
  templateUrl: './object-search.component.html',
  styleUrls: ['./object-search.component.scss'],
})
export class ObjectSearchComponent implements OnInit, OnDestroy {
  protected sub: Subscription
  searchForm: FormGroup

  selectedTopic: string

  constructor(public os: ObjectService) {}

  ngOnInit() {
    this.searchForm = new FormGroup({
      pattern: new FormControl('#'),
      tags: new FormControl([]),
    })

    this.sub = this.searchForm.valueChanges
      .pipe(debounceTime(1000))
      .subscribe(value => {
        this.os.search(value)
      })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }
}
