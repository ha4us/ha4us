import { Db } from 'mongodb';

import { Ha4usError , IHa4usObject} from 'ha4us/core';
import { IHa4usLogger  } from 'ha4us/adapter/types';
import { StatesService } from 'ha4us/adapter/features';

import { AlexaController, IAlexaRequest, IAlexaResponse, IAlexaEndpoint } from './alexa';


export default class PowerLevelController extends AlexaController {

  public static type = 'AlexaInterface';
  public static NAMESPACE = 'Alexa.PowerLevelController';
  public static VERSION = '3';

  constructor($log: IHa4usLogger, $db: Db, $states: StatesService) {
    super($log, $db, $states);
  }

  async handleRequest(req: IAlexaRequest): Promise<IAlexaResponse> {


    if (req.directive.header.name === 'SetPowerLevel') {

      this.$log.debug('PowerLevelController request', JSON.stringify(req));

this.validateToken(req.directive.endpoint.scope.token);
      await this.getObjects(req.directive.endpoint.cookie, 'PowerLevelController')
        .mergeMap ((ha4usObject: any) => {
          if (ha4usObject.type === 'number') {
            const targetVal = (ha4usObject.max - ha4usObject.min) * req.directive.payload.powerLevel / 100 + ha4usObject.min;
            this.$log.debug ('Scaled target val', targetVal);
            if (!isNaN(targetVal)) {
              return this.$states.set(ha4usObject.topic, targetVal);
            } else {
              return this.$states.set(ha4usObject.topic, req.directive.payload.powerLevel);
            }
          }
        }).toArray().toPromise();

      return PowerLevelController.createResponse('Response', 'Alexa', PowerLevelController.VERSION);

    } else {

      const res =  PowerLevelController.createResponse('ErrorResponse', 'Alexa', PowerLevelController.VERSION);
      res.event.payload.type = 'INVALID_VALUE';
      res.event.payload.message = 'AdjustPowerLevel not implemented';
      return res;
    }

  }
}
