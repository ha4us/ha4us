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
} from '@ha4us/adapter'

import { DIContainer } from '@ha4us/adapter/dist/lib/di'

import { Ha4usMedia, Ha4usLogger, defaultsDeep, MqttUtil } from '@ha4us/core'

import * as TelegramBot from 'node-telegram-bot-api'
import { AlexaUtterance } from './utterances/alexautterance'

import { IIntentParams, AbstractIntent } from './intents'

const ADAPTER_OPTIONS = {
  name: 'telegram',
  path: __dirname + '/..',
  args: {
    botkey: {
      demandOption: true,
      describe: 'the bot key of telegram',
      type: 'string',
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
  const sessions: { [chatId: string]: any } = {}
  let bot: TelegramBot = null
  function login(username: string, password: string, chatId: number) {
    if (sessions.hasOwnProperty(chatId)) {
      return true
    }
    return $users
      .verify(username, password)
      .then(user => {
        sessions[chatId] = { user }
        return true
      })
      .catch(e => {
        $log.warn('Unauthorized %s', username, e)
        delete sessions[chatId]
        return false
      })
  }
  console.log($injector)
  $injector.loadModules(['intents/*.js'])

  async function $onInit() {
    $log.info('Starting telegram')

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

    bot.onText(/\/start(?:\s*?(\S+))?(?:\s+?(\S+))?/i, async (msg, match) => {
      $log.debug('Start with password', msg, match)
      let [, username, password] = match
      if (!password) {
        password = username
        username = msg.from.username
      }
      $log.debug('Logging in User %s with password %s', username, password)
      if (await login(username, password, msg.chat.id)) {
        bot.sendMessage(msg.chat.id, `Logged in as ${username}`)
      } else {
        bot.sendMessage(msg.chat.id, 'Not allowed')
      }
    })

    bot.on

    bot.on('left_chat_member', msg => {
      $log.debug('Someone left chat', msg)
    })
    // Listen for any kind of message. There are different kinds of
    // messages.
    bot.on('text', msg => {
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
          !sessions.hasOwnProperty(chatId) &&
          (msg.text && !msg.text.match(/^\/start/i))
        ) {
          bot.sendMessage(chatId, 'Bitte anmelden mit /start')
          return
        }

        const idx = utterances.find(item => {
          const params: IIntentParams = item.utterance.match(msg.text)
          if (params) {
            const defaultedParams = defaultsDeep(
              {},
              item.definition.slotDefaults || {}
            )
            defaultsDeep()(params, item.definition.slotDefaults || {})
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
