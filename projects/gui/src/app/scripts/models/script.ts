import { Ha4usObject, Ha4usRole } from '@ha4us/core'

export class Ha4usScript {
  name: string
  source: string
  autostart: boolean

  static toHa4usObject(script: Ha4usScript): Partial<Ha4usObject> {
    return {
      topic: script.name,
      role: Ha4usRole.Script,
      native: {
        source: script.source,
        autostart: script.autostart,
      },
    }
  }

  constructor(objOrName: Ha4usObject | string) {
    if (typeof objOrName === 'string') {
      this.name = objOrName
      this.source = `console.log('${objOrName} started!')`
      this.autostart = false
    } else {
      const obj = objOrName as Ha4usObject
      this.name = obj.topic
      if (obj.native) {
        this.source = obj.native.source
        this.autostart = obj.native.autostart
      }
    }
  }
}
