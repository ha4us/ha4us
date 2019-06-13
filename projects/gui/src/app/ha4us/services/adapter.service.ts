import { Injectable } from '@angular/core'
import { ObjectService } from './object.service'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'

export interface Instance {
  topic: string
  version: string
  adapter: string
  image: string
}
@Injectable({
  providedIn: 'root',
})
export class AdapterService {
  constructor(protected os: ObjectService) {}

  getInstances(adapter: string): Observable<Instance[]> {
    return this.os.observeRole(new RegExp('adapter/' + adapter, 'i')).pipe(
      map(instanceObjects =>
        instanceObjects.map(obj => ({
          topic: obj.topic,
          version: obj.native.version,
          adapter: obj.native.name,
          image: obj.image,
        }))
      )
    )
  }
}
