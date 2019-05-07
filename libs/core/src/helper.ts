const SPRINTF_PATTERN = /%(.*?)(s|f|%)/g
// const SPRINTF_PARAMETER = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/
const SPRINTF_PAR_F = /^([,.])?(\d)*$/

const IDX_NAME = /(.+?\W)(\d+)$/

export function dezTo10h(num) {
  const s = '000000000' + num.toString(16)
  return s.substr(s.length - 10).toUpperCase()
}

export function normalizeNumber(
  aNumber: string,
  aCountryCode = '+49',
  anAreaCode = '40'
) {
  return aNumber
    .replace(/[^0-9+]/g, '')
    .replace(/^(?=([1-9]))/, aCountryCode + anAreaCode)
    .replace(/^00/, '+')
    .replace(/^0/, aCountryCode)
}

export function randomString(len: number, bits: number = 36) {
  let outStr = ''
  let newStr
  while (outStr.length < len) {
    newStr = Math.random()
      .toString(bits)
      .slice(2)
    outStr += newStr.slice(0, Math.min(newStr.length, len - outStr.length))
  }
  return outStr.toUpperCase()
}

export function uuid(): string {
  const retVal =
    randomString(8, 16) +
    '-' +
    randomString(4, 16) +
    '-' +
    randomString(4, 16) +
    '-' +
    randomString(4, 16) +
    '-' +
    randomString(12, 16)
  return retVal.toLowerCase()
}

export function convertBuffer(message: Uint8Array): any {
  let retVal: string = Buffer.from(message).toString()

  try {
    retVal = JSON.parse(retVal)
  } finally {
    return retVal
  }
}

export function sprintf(format: string, ...args: any[]): string {
  let counter = 0

  return format.replace(SPRINTF_PATTERN, (_: string, ...match: any[]) => {
    const [params, formFunc] = match
    let result = args[counter++]
    switch (formFunc) {
      case '%':
        result = '%'
        counter--
        break
      case 'f':
        let precision
        let separator
        result = parseFloat(result)
          ; [, separator, precision] = params.match(SPRINTF_PAR_F)
        separator = separator || ','
        if (precision) {
          result = result.toFixed(precision)
        }
        result = result.toString().replace('.', separator)
        break
      default:
    }
    return result
  })
}

export function incName(name: string): string {
  const idxMatch = name.match(IDX_NAME)
  if (idxMatch) {
    const newIdx = parseInt(idxMatch[2], 0) + 1
    return [idxMatch[1], newIdx].join('')
  } else {
    return [name, '1'].join(' ')
  }
}
/**
 * extranct all tags starting with @#_! from text and removes them from the string
 * @param  text text with tags
 * @return      array with the result. at index 0, the resulting text is returned
 */
export function extractTags(text: string, tags: string = '!#@_'): string[] {
  const TAG_PATTERN = new RegExp(`([${tags}][a-zA-Z0-9_]+)(?:\\s+)`, 'g')

  const result = [text.replace(TAG_PATTERN, '')]
  let matches
  while ((matches = TAG_PATTERN.exec(text)) !== null) {
    result.push(matches[1])
  }
  return result
}

export function groupBy<T>(array: T[], predicate: (item: T) => any): { [key: string]: T[] } {

  return array.reduce((grouped: { [key: string]: T[] }, value: T) => {
    const key = predicate(value);
    if (grouped.hasOwnProperty(key)) {
      grouped[key].push(value)
    } else {
      grouped[key] = [value];
    }
    return grouped
  }, {})
}

export function unique(values: any[]): any[] {
  return Array.from(new Set(values))
}

export function distinctDeep<T>(array: T[], property?: string): string[] {
  return unique(array.reduce((acc: string[], cur: T, idx: number) => {
    return acc = [...acc, ...get(cur, property)];
  }, []))
}

export function convertWildcarded(wildcarded: string): RegExp {
  wildcarded = wildcarded
    .replace(/[-[\]{}()+?.,\\/^$|#\s]/g, '\\$&')
    .replace(/\*/g, '.*')

  return new RegExp('^' + wildcarded + '$', 'i')
}

export const isEqual = require('lodash/isEqual')
export const get = require('lodash/get')
export const merge = require('lodash/merge')
export const union = require('lodash/union')
export const defaultsDeep = require('lodash/defaultsDeep')
