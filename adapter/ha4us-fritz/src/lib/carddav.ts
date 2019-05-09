const debug = require('debug')('ha4us:fritz:carddav')

import { URL } from 'url'

import { parsePhoneNumber, CountryCode } from 'libphonenumber-js/max'

import {
  createAccount,
  transport,
  Credentials,
  syncAddressBook,
  syncCarddavAccount,
  Account,
  createCard,
  VCard,
} from 'dav'
import * as vcard from 'vcard-parser'

import * as vcf from 'vcf'

export interface Card {
  tel?: string
  fn: string
  photo: {
    type: string;
    data: Buffer;
  }
}

export type RawVCard = any

export class CardDav {
  public readonly uri: string

  protected xhr: transport.Basic
  protected account: Account

  protected records: Set<Card> = new Set()

  protected telIndex: Map<string, Card> = new Map()

  protected cc: CountryCode = 'DE'

  constructor(config: { uri: string; countryCode: CountryCode }) {
    const url = new URL(config.uri)
    this.uri = [url.origin, url.pathname, url.username, '/'].join('')
    debug('Initialised with uri', this.uri)
    this.xhr = new transport.Basic(
      new Credentials({ username: url.username, password: url.password })
    )
    this.cc = config.countryCode
    this.records = new Set()
  }

  add2Index(number: string, card: vcf) {
    let converted: string
    try {
      const phoneNumber = parsePhoneNumber(number, this.cc)
      converted = phoneNumber.format('E.164')
      debug('Adding to index', converted, card.get('fn').valueOf())
      this.telIndex.set(converted, card)
    } catch (e) {
      debug('Problem', card.get('fn').valueOf(), number, e.message)
    }
  }

  async sync() {
    /*return createAccount({
      server: this.uri,
      xhr: this.xhr,
      accountType: 'carddav',
      loadObjects: true,
    })*/

    if (!this.account) {
      this.account = await createAccount({
        server: this.uri,
        xhr: this.xhr,
        accountType: 'carddav',
      })
    }

    return syncCarddavAccount(this.account, { xhr: this.xhr }).then(account => {
      debug('Account', account.addressBooks.length)
      if (!account.addressBooks) {
        throw new Error('no addressbooks found')
      }
      this.records = new Set()
      this.telIndex = new Map()
      account.addressBooks.forEach(addressbook => {
        debug('addressbook', addressbook.objects.length)
        addressbook.objects.forEach(object => {
          const card = new vcf().parse(object.addressData)

          const telefonEntries = card.get('tel')

          if (telefonEntries) {
            if (telefonEntries.length) {
              telefonEntries.forEach(tel => {
                this.add2Index(tel.valueOf(), card)
              })
            } else {
              this.add2Index(telefonEntries.valueOf(), card)
            }
          }
        })
      })

      return true
    })
  }

  protected convertToCard(raw: RawVCard): Card {
    if (!raw) {
      return undefined
    }
    const fn = raw.get('fn').valueOf()
    let photo
    if (raw.get('photo')) {
      const data = Buffer.from(raw.get('photo').valueOf(), 'base64')
      photo = {
        data,
        type: raw.get('photo').type,
      }
    }
    return {
      fn,
      photo,
    }
  }

  findByNumber(number: string): Card {
    let card: Card
    try {
      const phoneNumber = parsePhoneNumber(number, this.cc)
      number = phoneNumber.format('E.164')
    } catch (e) {
      debug(`Error converting ${number} - ${e.message}`)
    }
    card = this.convertToCard(this.telIndex.get(number))
    if (card) {
      card.tel = number
    } else {
      card = {
        tel: number,
        fn: undefined,
        photo: undefined,
      }
    }
    return card
  }
}
