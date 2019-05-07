import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { map, tap, filter } from 'rxjs/operators'
import { ObjectService } from '@ha4us/ng'
import { Ha4usRole, Ha4usObject, MqttUtil } from 'ha4us/core'
import { Ha4usScript } from '../models'

export * from '../models'

const debug = require('debug')('ha4us:gui:scripts')

@Injectable({
  providedIn: 'root',
})
export class ScriptService {
  script$ = this.os.searchResult$.pipe(
    tap(obj => debug(`Scripts loaded`, obj)),
    map(objs => objs.map(obj => new Ha4usScript(obj)))
  )

  adapter$ = this.os.observeRole(Ha4usRole.ScriptAdapter)
  topics$ = this.os.topics$

  adapterScripts$ = this.os.observeRole('adapter/scripts').pipe(
    map((adapters: Ha4usObject[]) =>
      adapters.map(adapter => {
        return { ...adapter, scripts: this.getScripts(adapter.topic) }
      })
    )
  )

  constructor(protected os: ObjectService) {}

  search() {
    this.os.search({ role: Ha4usRole.Script })
  }

  get(topic: string): Observable<Ha4usScript> {
    return this.os.observeOne(topic).pipe(
      filter(obj => !!obj),
      map(obj => new Ha4usScript(obj))
    )
  }
  getScripts(adapter: string): Observable<Ha4usScript[]> {
    return this.script$.pipe(
      map(scripts =>
        scripts.filter(script => script.name.indexOf(adapter) === 0)
      )
    )
  }

  save(script: Ha4usScript) {
    return this.os.updateOne(script.name, Ha4usScript.toHa4usObject(script))
  }

  create(name: string) {
    const newScript = new Ha4usScript(name)
    this.os.upsert(this.os.new(name, Ha4usScript.toHa4usObject(newScript)))
  }
}
