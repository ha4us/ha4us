import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { IOClient } from './ioclient.class'
import { MqttService } from 'ha4us/core'

@Injectable({
  providedIn: 'root',
})
export class StatesService extends MqttService {
  public client: IOClient
  /**
   * The constructor needs a up and running MqttClient
   * @param client an instance of MQTT.Client
   */
  constructor(protected router: Router) {
    super(new IOClient())
  }

  goAndObserve(topic: string) {
    this.router.navigate(['admin/states'], {
      queryParams: { topic },
      skipLocationChange: false,
    })
  }
}
