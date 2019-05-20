/**
 * @module thing2Thin2
 * @preferred
 *
 * This comment will be used to document the "thing2" module.
 */

const SPRINTF_PATTERN = /%(.*?)(s|f|%)/g
// const SPRINTF_PARAMETER = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/
const SPRINTF_PAR_F = /^([,.])?(\d)*$/

const IDX_NAME = /(.+?\W)(\d+)$/

import _get = require('lodash/get')
import _merge = require('lodash/merge')
import _union = require('lodash/union')
import _defaultsDeep = require('lodash/defaultsDeep')
import _isEqual = require('lodash/isEqual')

/**
 * Converts a number to a hexadecimal representation with 10 digits in uppercase
 * e.g. 123456 gets 000001E240
 */
export function dezTo10h(num: number) {
  const s = '000000000' + num.toString(16)
  return s.substr(s.length - 10).toUpperCase()
}

/**
 * normalizes a telefonnumber by adding country- and areacode
 */
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
/**
 * generates a random string with a given length in uppercase letters
 * @param bits the base for the conversion (=36 means alphabetic)
 */
export function randomString(length: number, bits: number = 36) {
  let outStr = ''
  let newStr
  while (outStr.length < length) {
    newStr = Math.random()
      .toString(bits)
      .slice(2)
    outStr += newStr.slice(0, Math.min(newStr.length, length - outStr.length))
  }
  return outStr.toUpperCase()
}

/**
 * generates a uuid
 */
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

/**
 * converts a Uint8Array message to an object
 */
export function convertBuffer(message: Uint8Array): any {
  let retVal: string = Buffer.from(message).toString()

  try {
    retVal = JSON.parse(retVal)
  } catch {}
  return retVal
}

/**
 * simple implementation of a sprintf function
 * following formats are usable
 * * %% gives an % sign
 * * %,2f converst 1.234 to 1,23
 * @param format format string (currently only conversion floating is allowed)
 * @param args dunno
 */
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
        // tslint:disable-next-line
        let [_, separator, precision] = params.match(SPRINTF_PAR_F)

        result = parseFloat(result)

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
/**
 * Increments an name number
 * e.g. input name is file it return file 1, if name is "file 2" it returns file 3
 * @param name the name to increment
 */
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
  // tslint:disable-next-line
  while ((matches = TAG_PATTERN.exec(text)) !== null) {
    result.push(matches[1])
  }
  return result
}
/**
 * Groups a array by a predication function and returns an grouped object
 * @param array array with values to group
 */
export function groupBy<T>(
  array: T[],
  predicate: (item: T) => string | number
): { [key: string]: T[] } {
  return array.reduce((grouped: { [key: string]: T[] }, value: T) => {
    const key = predicate(value)
    if (grouped.hasOwnProperty(key)) {
      grouped[key].push(value)
    } else {
      grouped[key] = [value]
    }
    return grouped
  }, {})
}

/**
 * Returns only unqiue values of an array
 * @param values array of values
 */
export function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values)) as T[]
}

/**
 * converts a wildcarded string to search regular expression
 * @param wildcarded the string with wildcards *
 */
export function convertWildcarded(wildcarded: string): RegExp {
  wildcarded = wildcarded
    .replace(/[-[\]{}()+?.,\\/^$|#\s]/g, '\\$&')
    .replace(/\*/g, '.*')

  return new RegExp('^' + wildcarded + '$', 'i')
}

/**
 * merges to object - the object will be overridden
 */
export function merge<T1, T2>(object: T1, second: T2): T1 & T2 {
  return _merge<T1, T2>(object, second)
}
/**
 * compiles a union of all given arrays
 */
export function union<T>(...arrays: ArrayLike<T | null | undefined>[]): T[] {
  return _union<T>(...arrays)
}

export function defaultsDeep<T>(
  object: Partial<T>,
  ...sources: Partial<T>[]
): T {
  return _defaultsDeep(object, ...sources)
}

/**
 * Gets the property value at path of object. If the resolved value is undefined the defaultValue is used
 * in its place.
 *
 * @param object The object to query.
 * @param path The path of the property to get.
 * @param defaultValue The value returned if the resolved value is undefined.
 * @return Returns the resolved value.
 */
export function get<T>(
  object: any,
  path: string | number | symbol | string[],
  defaultValue?: T
): any {
  return _get(object, path, defaultValue)
}

/**
 * This method compares deeply to values for equality.
 * Arrays and objects are all supported
 * @param value the value
 * @param other the value to compare with
 */
export function isEqual(value: any, other: any) {
  return _isEqual(value, other)
}

export function distinctDeep<T>(array: T[], property?: string): string[] {
  return unique(
    array.reduce((acc: string[], cur: T, idx: number) => {
      return (acc = [...acc, ...get(cur, property)])
    }, [])
  )
}
