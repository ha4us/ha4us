import * as Handlebars from 'handlebars'
import { Ha4usObject, render, Ha4usMessage } from '@ha4us/core'

export interface IIntentParams {
  [any: string]: string
}

export interface IIntentRequest {
  slots: IIntentParams
}

export interface IIntentResponse {
  text?: string
  data?: any
}

export abstract class AbstractIntent {
  protected handlebars = Handlebars
  constructor() {
    this.handlebars.registerHelper('defined', function(
      value: any,
      options: any
    ) {
      const fnTrue = options.fn
      const fnFalse = options.inverse
      return typeof value !== 'undefined' ? fnTrue(this) : fnFalse(this)
    })
    // tslint:disable-next-line
    this.handlebars.registerHelper('format', function(
      value: Ha4usMessage,
      object: Ha4usObject
    ) {
      if (object.template) {
        try {
          return render(object.template, value)
        } catch (e) {
          console.error(e)
          return 'N/A'
        }
      } else {
        return value.val
      }
    })

    // tslint:disable-next-line
    this.handlebars.registerHelper('default', function() {
      for (let i = 0; i < arguments.length - 1; i++) {
        if (
          arguments[i] !== null &&
          arguments[i] !== undefined &&
          typeof arguments[i] !== 'undefined' &&
          arguments[i] !== ''
        ) {
          return arguments[i]
        }
      }
      return ''
    })
  }

  public createText(template, params) {
    return this.handlebars.compile(template)(params)
  }

  public abstract handleRequest(req: IIntentRequest, res: IIntentResponse)
}
