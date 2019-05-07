const SELECTOR = /^([^\[]*)(\[[^\]\[]*\])?$/;

import {Matcher} from './matcher';

export class Objectselector {

  protected _pattern: Matcher = undefined;
  protected _tags: string[] = undefined;
  protected _valid: boolean;

  constructor(selector: string = '#') {


    const match = selector.match(SELECTOR);
    if (match) {
      this._valid = true;

      if (match[1] && match[1] !== '') {
        this._pattern = new Matcher(match[1]);
      } else {
        this._pattern = new Matcher('#');
      }
      if (match[2]) {
      this._tags = match[2]
        .replace(/([\[\]])/g, '')
        .split(',')
        .map((item) => item.trim())
        .filter(tag => (tag !== ''));
    }
    } else {
      this._valid = false;
    }

  }

  valid() {
    return this._valid;
  }

  get pattern() {
    return this._pattern.pattern;
  }

  get topicRegex() {
    return this._pattern.regexp;
  }

  get tags(): string[] {

    return this._tags;
  }

}
