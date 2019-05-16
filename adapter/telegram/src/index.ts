import {
  asClass,
  asFunction,
  asValue,
  createContainer,
  Lifetime,
} from 'awilix'

import {
  ha4us,
  Ha4usArguments,
  StateService,
  ObjectService,
  YamlService,
  DBMediaService,
  UserService,
  StatefulObjectsService,
  CreateObjectMode,
} from '@ha4us/adapter'

import { DIContainer } from '@ha4us/adapter/dist/lib/di'

import {
  Ha4usMedia,
  Ha4usLogger,
  defaultsDeep,
  MqttUtil,
  Ha4usUser,
  Ha4usObjectType,
} from '@ha4us/core'

import { ContextMessageUpdate, Middleware, Telegraf } from 'telegraf'

// tslint:disable-next-line
const Graf = require('telegraf');
const extra = require('telegraf/extra')

import { AlexaUtterance } from './utterances/alexautterance'

import { ShowIntent, TurnOnIntent } from './intents'

import { IIntentParams, AbstractIntent } from './intents'
import { map, mergeMap, filter } from 'rxjs/operators'
import { from, of } from 'rxjs'
import { unregisterDecorator } from 'handlebars'

const ADAPTER_OPTIONS = {
  name: 'telegram',
  path: __dirname + '/..',
  args: {
    botkey: {
      demandOption: true,
      describe: 'the bot key of telegram',
      type: 'string',
    },
    allchannel: {
      demandOption: false,
      describe: 'the chat id of then channel to use for @all',
      type: 'number',
    },
  },
  imports: [
    '$log',
    '$args',
    '$states',
    '$yaml',
    '$objects',
    '$users',
    '$media',
    '$injector',
    '$os',
  ],
}

export interface Ha4usTelegramMessage {
  msg: string
  target: string[]
}

export interface Ha4usBotContext extends ContextMessageUpdate {
  user: Ha4usUser
}

const TELEGRAM_ALL = '@all'

function Adapter(
  $log: Ha4usLogger,
  $args: Ha4usArguments,
  $states: StateService,
  $users: UserService,
  $yaml: YamlService,
  $injector: DIContainer,
  $objects: ObjectService,
  $os: StatefulObjectsService,
  $media: DBMediaService
) {
  const sessions = new Map<number, Ha4usUser>()

  let bot: Telegraf<Ha4usBotContext> = null

  async function auth(
    ctx: Ha4usBotContext,
    next?: (ctx: Ha4usBotContext) => any
  ) {
    if (sessions.has(ctx.chat.id)) {
      return next(ctx)
    }

    $log.debug('Checking auth for ', ctx.chat)

    const users = await $users.getByProperty('telegram-chatid', ctx.chat.id)

    if (users.length > 0) {
      sessions.set(ctx.chat.id, users[0])
      $log.info('%s logged in with %n', users[0].username, ctx.chat.id)
      return next(ctx)
    } else {
      $log.warn('Unauthorized', ctx.chat)
      return ctx.reply('Unauthorized!')
    }
  }

  async function $onInit() {
    $log.info('Starting telegram')

    $injector.awilix.register('showIntent', asClass(ShowIntent))
    $injector.awilix.register('turnOnIntent', asClass(TurnOnIntent))

    await $users.connect()
    await $media.connect()

    // $states.establishCache('$#');
    bot = new Graf($args.telegramBotkey)

    bot.catch(e => {
      $log.error('Polling Error', e)
    })

    // await $maps.load()
    const myConfig = await $yaml.load(__dirname + '/../utterances.yml')
    const utterances: any[] = []

    myConfig.forEach(item => {
      item.utterances.forEach(utt => {
        $log.debug('Answers', item)
        utterances.push({
          utterance: new AlexaUtterance(utt),
          definition: item,
        })
      })
    })

    bot.use(auth)

    bot.start(async ctx => {
      $log.debug(
        'Starting for in User %s with id %n',
        ctx.chat.username,
        ctx.chat.id
      )
      ctx.reply(`Logged in as ${sessions.get(ctx.chat.id).username}`)
    })

    bot.on('text', async ctx => {
      if (ctx.message.text) {
        $log.debug('Checking message', ctx.message.text)
        const idx = utterances.find(item => {
          const params: IIntentParams = item.utterance.match(ctx.message.text)
          if (params) {
            const defaultedParams = defaultsDeep(
              params,
              item.definition.slotDefaults || {}
            )

            $log.debug(
              'Execute %s with',
              item.definition.intent,
              defaultedParams
            )

            try {
              const handler: AbstractIntent = $injector.resolve(
                item.definition.intent
              )
              const res = { text: null }
              const req = { slots: defaultedParams }
              handler
                .handleRequest(req, res)
                .then(() => {
                  return ctx.reply(res.text, extra.markdown())
                })
                .catch(e => {
                  $log.error('Error in intent handler %s', item.intent, e)
                  return ctx.reply(
                    'Da lief was schief! Frage meinen Erschaffer!'
                  )
                })
            } catch (e) {
              $log.error('Error resolving intent handler', e.message)
            }
            return true
          }
          return false
        })
        if (!idx) {
          const request = ctx.message.text
          ctx.reply(
            `Ich habe _${request}_ leider nicht verstanden`,
            extra.markdown()
          )
        }
      }

      // send a message to the chat acknowledging receipt of their message
      // bot.sendMessage(chatId, 'Received your message');
    })

    $objects.install(
      'send/message',
      {
        role: 'Value/TextMessage',
        type: Ha4usObjectType.Object,
        can: { read: false, write: true, trigger: false },
      },
      CreateObjectMode.create
    )

    async function getChatId(target: string): Promise<number> {
      if (target === TELEGRAM_ALL) {
        return $args.telegramAllchannel
      } else {
        $log.debug(`Looking for *${target.substr(1).toLowerCase()}*`)
        return $users
          .get(target.substr(1).toLowerCase())
          .then(user => {
            if (user.hasOwnProperty('properties')) {
              return user.properties['telegram-chatid']
            }
          })
          .catch(e => undefined)
      }
    }

    $states
      .observe('/$set/send/message')
      .pipe(
        map(msg => {
          const event: Ha4usTelegramMessage =
            typeof msg.val === 'string'
              ? { msg: msg.val, target: [TELEGRAM_ALL] }
              : (msg.val as Ha4usTelegramMessage)
          return event
        }),
        mergeMap(event => from(event.target.map(target => [target, event]))),
        mergeMap(async ([target, event]) => {
          const chatId = await getChatId(target as string)
          $log.debug(`Found chatId ${chatId} for target ${target}`)
          if (!chatId) {
            $log.warn(`Can't find chatId for target ${target}`)
          }
          return [chatId, event]
        }),
        filter(([chatId, event]) => !!chatId)
      )
      .subscribe(async ([chatId, event]: [string, Ha4usTelegramMessage]) => {
        bot.telegram.sendMessage(chatId, event.msg, { parse_mode: 'Markdown' })

        /* const media = await $media.getById('5c6425564f1e30b866f411b0')

        const stream = ($media.getReadStream(
          media
        ) as unknown) as NodeJS.ReadableStream

        const msg = await bot.telegram.sendPhoto(
          chatId,
          { source: stream },
          {
            caption: 'Testbild',
          }
        )*/
      })

    bot.launch({})
    return true
  }

  async function $onDestroy() {
    $log.info('Destroying Telgram Bot')
    bot.stop()
  }

  return {
    $onInit,
    $onDestroy,
  }
}

ha4us(ADAPTER_OPTIONS, Adapter).catch(e => {
  console.log(e)
})
