
const UTT_PARS_REGEXP = /\\\{(.*?)\\\}/g

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export type TUtteranceMatch = { [any: string]: string } | null

export interface IUtterance {
  utterance: string;
  slots: string[];
  test: (testString: string) => boolean;
  match: (testString: string) => TUtteranceMatch;
}

export class Utterance implements IUtterance {

  protected _utt: string;
  protected _regexp: RegExp;
  protected _slots: string[];

  constructor(utterance: string) {
    this.utterance = utterance;

  }

  set utterance(utterance: string) {
    this._utt = utterance;
    this._slots = [];
    this._genRegexp((utterance));

  }
  get utterance() {
    return this._utt;
  }
  get slots(): string[] {
    return this._slots;
  }


  protected _genRegexp(utterance: string) {
    utterance = escapeRegExp(this._prepareString(utterance));
    utterance = utterance.replace(UTT_PARS_REGEXP, (match, captureGroup, idx, text) => {
      this._slots.push(captureGroup);
      return '(.*)';
    })
    this._regexp = new RegExp('^' + utterance + '$');
  }

  protected _prepareString(test: string): string {
    const retVal = test
      .toLowerCase()
      .replace(/ö/g, 'oe')
      .replace(/ä/g, 'ae')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'sz')
      .replace(/\b(der|die|das|den|dem|ein|eine|einem|einer)\b/g, '')
      .replace(/ +(?= )/g, '')
    return retVal;
  }

  public test(test: string): boolean {
    return this._regexp.test(this._prepareString(test));
  }

  public match(test: string): TUtteranceMatch {
    const result = this._regexp.exec(this._prepareString(test));
    if (!result) {
      return null;
    }
    const retVal: TUtteranceMatch = {};
    this._slots.forEach((slot, idx, arr) => {
      retVal[slot] = result[idx + 1];
    })
    return retVal;
  }
}
