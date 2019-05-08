'use strict';

const ha4us = require('ha4us')
  .ha4us;
const elasticsearch = require('elasticsearch');
const Rx = require('rxjs/Rx');
const ADAPTER_OPTIONS = {

  //h,m,u,p,l,n
  name: 'elastic',
  path: __dirname,
  args: {
    'url': {
      alias: 'url',
      demandOption: true,
      describe: 'connection url to elastic',
      type: 'string'
    }
  },
  imports: ['$log', '$args', '$states']
};

function Adapter($log, $args, $states) {



  async function $onInit() {
    $log.info('Starting elastic bridge');

    var client = new elasticsearch.Client({
      host: $args.url,
      log: 'warning'
    });
    Rx.Observable.from($states.observe('/+/status/#'))
      .filter(msg => (!msg.retain))
      .mergeMap(msg => {
        const body = {
          topic: msg.topic,
          ts: msg.ts
        }
        const dataType = typeof msg.val;
        body['val_' + dataType] = msg.val;

        return client.index({
            "index": $args.name,
            "type": dataType,
            "body": body
          })
          .catch(e => {
            $log.error('Error inserting', e);
          });
        // ...
      })
      .subscribe(msg => {
        $log.debug('Message', msg);
      });

    $states.connected = 2;


    return true;
  }

  function $onDestroy() {
    $log.info('Destroying elastic');
  }


  return {
    $onInit: $onInit,
    $onDestroy: $onDestroy
  }


}

ha4us(ADAPTER_OPTIONS, Adapter);
