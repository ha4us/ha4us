import { test } from 'ava'

import { CardDav } from './carddav'

const URI = process.env.HA4US_FRITZ_CARDDAV_URI
test('can initialize', t => {
  const c = new CardDav({ uri: URI, countryCode: 'DE' })

  t.is(typeof c, 'object')
})

test('can sync', async t => {
  const c = new CardDav({ uri: URI, countryCode: 'DE' })
  t.log('Sync 1')
  const result = await c.sync()

  // t.deepEqual(c.findByNumber('+49407923632'), {});
  const card = c.findByNumber('+4940123456789')
  t.not(card, undefined)

  t.is(card.fn, 'Paul Testmann')
  t.is(card.photo.type, 'png')

  // t.deepEqual(card.photo[0].meta, 'test');
  t.true(result)
})
