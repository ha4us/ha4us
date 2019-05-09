import { Db } from 'mongodb'

import { Ha4usError , IHa4usObject} from 'ha4us/core'
import { IHa4usLogger  } from 'ha4us/adapter'
import { StatesService } from 'ha4us/adapter/features'

import { AlexaController, IAlexaRequest, IAlexaResponse, IAlexaEndpoint } from './alexa'


export default class PercentageController extends AlexaController {

  public static type = 'AlexaInterface'
  public static NAMESPACE = 'Alexa.PercentageController'
  public static VERSION = '3'

  constructor($log: IHa4usLogger, $db: Db, $states: StatesService) {
    super($log, $db, $states)
  }

  async handleRequest(req: IAlexaRequest): Promise<IAlexaResponse> {


    if (req.directive.header.name === 'SetPercentage') {
      this.validateToken(req.directive.endpoint.scope.token)
      this.$log.debug('PercentageController request', JSON.stringify(req))


      await this.getObjects(req.directive.endpoint.cookie, 'PercentageController')
        .mergeMap ((ha4usObject: any) => {
          if (ha4usObject.type === 'number') {
            const targetVal = (ha4usObject.max - ha4usObject.min) * req.directive.payload.percentage / 100 + ha4usObject.min
            this.$log.debug ('Scaled target val', targetVal)
            if (!isNaN(targetVal)) {
              return this.$states.set(ha4usObject.topic, targetVal)
            } else {
              return this.$states.set(ha4usObject.topic, req.directive.payload.percentage)
            }
          }
        }).toArray().toPromise()

      return PercentageController.createResponse('Response', 'Alexa', PercentageController.VERSION)

    } else {

      const res =  PercentageController.createResponse('ErrorResponse', 'Alexa', PercentageController.VERSION)
      res.event.payload.type = 'INVALID_VALUE'
      res.event.payload.message = 'AdjustPowerLevel not implemented'
      return res
    }

  }
}
