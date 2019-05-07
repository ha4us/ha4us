import { Component, OnInit, Input } from '@angular/core'
import { Observable } from 'rxjs'
import { Ha4usObject } from '@ha4us/core'

import { ObjectService, Ha4usRoleDefinition } from '@ha4us/ng'
@Component({
  selector: 'ha4us-listitem-widget',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
})
export class ListItemComponent implements OnInit {
  @Input() object: Ha4usObject
  constructor(protected os: ObjectService) {}

  ngOnInit() {}

  edit(event: MouseEvent, topic: string) {
    console.log('Editing', topic)
    this.os.edit(topic)
  }
}
