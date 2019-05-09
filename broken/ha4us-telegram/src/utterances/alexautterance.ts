import {IUtterance, TUtteranceMatch, Utterance} from './utterances';
import * as alexaUtterances from 'alexa-utterances';
import * as Debug from 'debug';
const debug = Debug('ha4us:telegram');
export class AlexaUtterance implements IUtterance {

  protected _utterance: string;
  protected _slots: string[];

  protected _utterances: Utterance[];

  constructor (utterance: string) {
    this.utterance = utterance;
  }

  set utterance (utterance: string) {
    this._utterance = utterance;
    this._utterances = alexaUtterances(utterance)
      .map ((utt: string) => (new Utterance(utt)));
    this._slots = this._utterances[0].slots;
  }
  get utterance (): string {
    return this._utterance;

  }

  get slots(): string[] {
    return this._slots;
  }

  public test(test: string): boolean {
    let retVal = false;
    this._utterances.find((utt: Utterance) => {
      retVal = utt.test(test);
      return retVal;
    });
    return retVal;
  }

  public match(test: string): TUtteranceMatch {
    let retVal: TUtteranceMatch = null;
    this._utterances.find((utt: Utterance) => {
      debug ('Testing %s', utt.utterance);
      retVal = utt.match(test);
      return (retVal !== null);
    });
    return retVal;
  }

}
