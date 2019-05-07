const _template = require('lodash/template');
const _templateSettings = require('lodash/templateSettings');
import { sprintf } from './helper';
export type HelperFunction = (...args: any[]) => string;

import { DateTime } from 'luxon';

const _DEFAULT_HELPERS_ = {
  $upper,
  $currency,
  $date,
  $format: sprintf,
};
let _HELPERS_ = {};
Object.assign(_HELPERS_, _DEFAULT_HELPERS_);

export interface TemplateHelpers {
  [helperName: string]: HelperFunction;
}

function $upper(input: string): string {
  return input.toUpperCase();
}

function $currency(amount: number, currency = '€') {
  return sprintf('%,2f ' + currency, amount);
}

function convertDate(date: string | Date): DateTime {
  if (typeof date === 'string') {
    return DateTime.fromISO(date);
  } else {
    return DateTime.fromJSDate(date);
  }
}

function $date(date: string | Date, format = 'dd.MM.yyyy HH:mm:ss'): string {
  return convertDate(date).toFormat(format);
}

export function addTemplateHelpers(...funcs: HelperFunction[]) {
  funcs.forEach(func => {
    _HELPERS_[func.name] = func;
  });
}

export function resetTemplateHelpers() {
  _HELPERS_ = {};
  Object.assign(_HELPERS_, _DEFAULT_HELPERS_);
}

export function compile(
  template: string,
  helperFuncs: TemplateHelpers = _HELPERS_
): (data: any) => string {
  return _template(template, {
    escape: /\${([\s\S]+?)\}/g,
    interpolate: /%{([\s\S]+?)}/g,
    evaluate: /<%([\s\S]+?)%>/g, // setting a never match regex
    imports: helperFuncs,
    // variable: 'data',
  });
}

export function render(template: string, data: any = {}): string {
  return compile(template)(data);
}
