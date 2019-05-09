import { Component, OnInit } from '@angular/core'

import { Ha4usWidget } from '@app/widgets'

import { ObjectService } from '@ha4us/ng'

@Component({
  selector: 'ha4us-channel-button',
  templateUrl: './channel-button.component.html',
  styleUrls: ['./channel-button.component.scss'],
})
@Ha4usWidget({
  selector: 'Channel/Button',
  label: 'Gerät',
  library: 'dashboard',
  props: [
    {
      id: 'topic',
      type: 'topic',
      label: 'Topic',
      required: true,
    },
  ],
})
export class ChannelButtonComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
