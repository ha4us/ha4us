import { Db } from 'mongodb';

import { Ha4usError , IHa4usObject} from 'ha4us/core';
import { IHa4usLogger  } from 'ha4us/adapter/types';
import { StatesService } from 'ha4us/adapter/features';

import { AlexaController, IAlexaRequest, IAlexaResponse, IAlexaEndpoint } from './alexa';


export default class PowerController extends AlexaController {

  public static type = 'AlexaInterface';
  public static NAMESPACE = 'Alexa.PowerController';
  public static VERSION = '3';

  constructor($log: IHa4usLogger, $db: Db, $states: StatesService) {
    super($log, $db, $states);
  }

  async handleRequest(req: IAlexaRequest): Promise<IAlexaResponse> {


    if (req.directive.header.name === 'TurnOn' || req.directive.header.name === 'TurnOff') {
this.validateToken(req.directive.endpoint.scope.token);
      const targetVal = (req.directive.header.name === 'TurnOn');
      this.$log.debug('PowerController request', JSON.stringify(req));


      await this.getObjects(req.directive.endpoint.cookie, 'PowerController')
        .mergeMap ((ha4usObject: any) => {
          this.$log.debug ('Turn %s to %s', ha4usObject.topic, targetVal, ha4usObject);
          if (ha4usObject.type === 'boolean') {
            return this.$states.set(ha4usObject.topic, targetVal);
          }
        }).toArray().toPromise();

      return PowerController.createResponse('Response', 'Alexa', PowerController.VERSION);

    } else {
      throw (new Ha4usError(400, `can't handle ${req.directive.header.name}`))
    }

  }
}
