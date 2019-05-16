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

import * as TelegramBot from 'node-telegram-bot-api'
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

const TELEGRAM_ALL = '@all'

/*

// replace the value below with the Telegram token you receive from @BotFather
const token = 'YOUR_TELEGRAM_BOT_TOKEN';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

/
 */

function Adapter(
  $log: Ha4usLogger,
  $args: Ha4usArguments,
  $states: StateService,
  $users: UserService,
  $yaml: YamlService,
  $injector: DIContainer,
  $objects: ObjectService,
  $os: StatefulObjectsService
) {
  const sessions = new Map<number, Ha4usUser>()
  let bot: TelegramBot = null

  async function auth(msg: TelegramBot.Message) {
    if (sessions.has(msg.chat.id)) {
      return true
    }

    const users = await $users.getByProperty('telegram-userid', msg.chat.id)

    if (users.length > 0) {
      sessions.set(msg.chat.id, users[0])
      $log.info('%s logged in with %n', users[0].username, msg.chat.id)
      return true
    } else {
      $log.warn('Unauthorized', msg.chat)
      return false
    }
  }

  async function $onInit() {
    $log.info('Starting telegram')

    $injector.awilix.register('showIntent', asClass(ShowIntent))
    $injector.awilix.register('turnOnIntent', asClass(TurnOnIntent))

    await $users.connect()

    // $states.establishCache('$#');
    bot = new TelegramBot($args.telegramBotkey, { polling: true })

    bot.on('polling_error', e => {
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

    bot.onText(/\/start/i, async (msg, match) => {
      $log.debug(
        'Starting for in User %s with id %n',
        msg.chat.username,
        msg.chat.id
      )
      if (await auth(msg)) {
        bot.sendMessage(
          msg.chat.id,
          `Logged in as ${sessions.get(msg.chat.id).username}`
        )
      } else {
        bot.sendMessage(msg.chat.id, 'Not allowed')
      }
    })

    bot.on('left_chat_member', msg => {
      $log.debug('Someone left chat', msg)
    })

    bot.on('text', async msg => {
      if (!(await auth(msg))) {
        return
      }
      const chatId = msg.chat.id
      $log.debug(
        'onText *%s* %j',
        msg.text,
        msg.entities,
        msg.chat.id,
        msg.chat.username
      )

      if (msg.text) {
        if (
          !sessions.has(chatId) &&
          (msg.text && !msg.text.match(/^\/start/i))
        ) {
          bot.sendMessage(chatId, 'Bitte anmelden mit /start')
          return
        }

        const idx = utterances.find(item => {
          const params: IIntentParams = item.utterance.match(msg.text)
          if (params) {
            $log.debug(params)
            const defaultedParams = defaultsDeep(
              params,
              item.definition.slotDefaults || {}
            )
            $log.debug(defaultedParams)

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
                  bot.sendMessage(chatId, res.text, { parse_mode: 'Markdown' })
                })
                .catch(e => {
                  $log.error('Error in intent handler %s', item.intent, e)
                  bot.sendMessage(
                    chatId,
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
        if (idx < 0) {
          bot.sendMessage(chatId, 'Habe nicht verstanden')
        }
      }

      // send a message to the chat acknowledging receipt of their message
      // bot.sendMessage(chatId, 'Received your message');
    })

    bot.on('channel_post', post => {
      $log.info('Channel Post', post)
    })

    bot.on('photo', message => {
      $log.info('Foto', message)
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
      .subscribe(([chatId, event]: [string, Ha4usTelegramMessage]) => {
        bot.sendMessage(chatId, event.msg)
      })

    return true
  }

  async function $onDestroy() {
    $log.info('Destroying Telgram Bot')
  }

  return {
    $onInit,
    $onDestroy,
  }
}

ha4us(ADAPTER_OPTIONS, Adapter).catch(e => {
  console.log(e)
})
