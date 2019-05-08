
import {
  ha4us,
  MqttUtil
} from 'ha4us';

import {
  asClass, asFunction, asValue, createContainer, Lifetime, ResolutionMode,
  AwilixContainer
} from 'awilix';

import {
  IHa4usLogger,
  IHa4usArguments,
  StatesService,
  ObjectService,
  YamlService,
  MapService,
  DBMediaService, IHa4usMedia, UserService, StatefulObjects
} from 'ha4us/adapter/index'

import * as TelegramBot from 'node-telegram-bot-api';
import {AlexaUtterance} from './utterances/alexautterance';

import {IIntentParams, AbstractIntent} from './intents';

const ADAPTER_OPTIONS = {
  name: 'telegram',
  path: __dirname + '/..',
  needsDb: true,
  needsMedia: false,
  args: {
    'botkey': {
      demandOption: true,
      describe: 'the bot key of telegram',
      type: 'string'
    }
  }
};

/*

// replace the value below with the Telegram token you receive from @BotFather
const token = 'YOUR_TELEGRAM_BOT_TOKEN';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

/
 */

function Adapter($log: IHa4usLogger, $args: IHa4usArguments, $states: StatesService
  , $users: UserService, $yaml: YamlService, $injector: AwilixContainer,
  $objects: ObjectService, $os: StatefulObjects, $maps: MapService, $o: any ) {

  const sessions: {[chatId: string]: any} = {};
  let bot = null;
  function login (username: string, password: string, chatId: number) {
    if (sessions.hasOwnProperty(chatId)) {
      return true;
    }
    return $users.verify(username, password)
       .then(user => {
         sessions[chatId] = {user: user};
         return true;
       })
       .catch (e => {
         $log.warn ('Unauthorized %s', username, e);
         delete sessions[chatId];
         return false;
       })
  }




  $injector.loadModules([
  'intents/*.js'
  ], {
    cwd: __dirname,
  registrationOptions: {
    lifetime: Lifetime.SINGLETON,
    register: asClass
  }
})


  async function $onInit() {
    $log.info('Starting telegram');

    // $states.establishCache('$#');
    bot = new TelegramBot( $args.telegramBotkey,  {polling: true});

    await $maps.load();
    const myConfig = await $yaml.load(__dirname + '/../utterances.yml');
    const utterances: any[] = [];

    myConfig.forEach(item => {
      item.utterances.forEach(utt => {
        $log.debug ('Answers', item)
        utterances.push({utterance: new AlexaUtterance(utt),
          definition: item});
      })
    })

     bot.onText(/\/start(?:\s*?(\S+))?(?:\s+?(\S+))?/i, async (msg, match) => {
       $log.debug ('Start with password', msg, match);
       let [, username, password] = match;
       if (!password) {
         password = username;
         username = msg.from.username;
       }
       $log.debug ('Logging in User %s with password %s', username, password);
       if (await login(username, password, msg.chat.id)) {
         bot.sendMessage(msg.chat.id, `Logged in as ${username}`);
       } else {
         bot.sendMessage(msg.chat.id, 'Not allowed');
       }
     });

     bot.on('left_chat_member', (msg) => {
       $log.debug ('Someone left chat', msg);
     })
    // Listen for any kind of message. There are different kinds of
    // messages.
    bot.on('message', (msg) => {




      const chatId = msg.chat.id;
      $log.debug ('onMessage *%s* %j', msg.text, msg.entities);

      if (!sessions.hasOwnProperty(chatId) && !msg.text.match(/^\/start/i)) {
        bot.sendMessage(chatId, 'Bitte anmelden mit /start');
        return;
      }

      const idx = utterances.find(item => {
        const params: IIntentParams = item.utterance.match(msg.text);
        if (params) {
          const defaultedParams = $o.clone(item.definition.slotDefaults || {});
          $o.extend(defaultedParams, params)
          $log.debug ('Execute %s with', item.definition.intent, defaultedParams);

          try {
            const handler: AbstractIntent = $injector.resolve(item.definition.intent);
            const res = {text: null};
            const req = {slots: defaultedParams};
            handler.handleRequest(req, res )
              .then (() => {
                bot.sendMessage(chatId, res.text, {parse_mode: 'Markdown'});
              })
              .catch (e => {
                $log.error ('Error in intent handler %s', item.intent, e);
                bot.sendMessage(chatId, 'Da lief was schief! Frage meinen Erschaffer!');
              });

          } catch (e) {
            $log.error ('Error resolving intent handler', e.message);
          }
          return true;
        }
        return false;
      });

      if (idx < 0) {
        bot.sendMessage('Habe nicht verstanden');
      }
      // send a message to the chat acknowledging receipt of their message
      // bot.sendMessage(chatId, 'Received your message');
    });

    bot.on ('channel_post', (post) => {
      $log.info ('Channel Post', post);
    });

    return true;
  }

  function $onDestroy() {
    $log.info('Destroying Telgram Bot');
  }

  return {
    $onInit: $onInit,
    $onDestroy: $onDestroy
  }
}


ha4us(ADAPTER_OPTIONS, Adapter)
  .catch(e => {
    console.log(e)
  });
