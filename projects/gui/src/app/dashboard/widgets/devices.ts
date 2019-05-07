import { Component, ChangeDetectionStrategy, Input } from '@angular/core'
import { Ha4usWidget } from '@app/widgets'
@Component({
  template: `
    <ha4us-dashboard-card [object]="topic | ha4usObject">
      <ha4us-hue ha4us-card-content [topic]="topic"></ha4us-hue>
    </ha4us-dashboard-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Ha4usWidget({
  selector: 'Device/Hue*',
  label: 'HueDashboard',
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
export class DashboardHueComponent {
  @Input() topic: string
}

@Component({
  template: `
    <ha4us-dashboard-card [object]="topic | ha4usObject">
      <ha4us-sonos ha4us-card-content [topic]="topic"></ha4us-sonos>
    </ha4us-dashboard-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Ha4usWidget({
  selector: 'Device/Sonos',
  label: 'DashboardSonos',
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
export class DashboardSonosComponent {
  @Input() topic: string
}
