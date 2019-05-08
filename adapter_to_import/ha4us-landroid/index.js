'use strict';

const ha4us = require('ha4us').ha4us;
const request = require('request');

const ALARMS_TXT = [
  'bladeBlocked',
  'repositioningError',
  'outsideWorkingArea',
  'bladeBlocked2',
  'outsideWorkingArea2',
  'liftedUp',
  'error',
  'upsideDown',
  'error',
  'collisionSensorBlocker',
  'mowerTilted',
  'chargeError',
  'batteryError'
];

const ADAPTER_OPTIONS = {
  name: 'landroid',
  path: __dirname,
  needsDb: false,
  args: {
    'ip': {
      demandOption: true,
      describe: 'id of the landroid api',
      type: 'string',
      alias: 'ip'
    },
    'pin': {
      demandOption: true,
      describe: 'pin for accessing the api',
      type: 'string',
      alias: 'pin'
    },
    'poll': {
      demandOption: false,
      default: 5,
      describe: 'polling intervall in sec.',
      type: 'number'
    }

  },
  imports:['$o','$states']
};

function Adapter($log,$args,$o,$states) {

  let interval;
  let mower = {};

  function doPost(postData) {
    let options = {
      url: "http://" + $args.landroidIp + ":80/jsondata.cgi",
      async: true,
      method: 'POST',
      cache: false,
      body: postData,
      headers: {
        'Content-length': postData.length,
        'Content-type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        "Authorization": 'Basic ' + new Buffer('admin:' + $args.landroidPin)
          .toString('base64')
      }
    }

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        $log.info ('Return', body);
        /*data = JSON.parse(body);
        evaluateResponse();*/
      }
    });
  }

  function getRequest(url) {
    let getOptions = {
      url: "http://" + $args.landroidIp + ":80/"+url,
      type: "GET",
      headers: {
        "Authorization": 'Basic ' + new Buffer('admin:' + $args.landroidPin)
          .toString('base64')
      }
    };

    return new Promise((resolve, reject) => {
      request(getOptions, function (error, response, body) {

        if (!error && response.statusCode == 200) {
          let data = JSON.parse(body);
          resolve(data);
        }
        else {
          reject(error || response.statusCode);
        }
      });
    });
  }

  async function getStatus() {
    let data = await getRequest('jsondata.cgi');
    let debug = await getRequest('jsonDebug.cgi');

    return {data,debug};
  }

  function publish(prop, value) {
    if ($o.setProp(mower, prop, value)) {
      $log.debug ('Publishing %s:', prop,value);
      $states.status('$'+prop, value,true);
    }
  }

  function parseResponse(readData) {


    let {data,debug} = readData;
    $log.debug ('Data received',data);
    $log.debug ('debug received',debug);

    if (Object.keys(data).length < 2) {
      $log.error ('Wrong Pin code');
      publish('error', 'wrongpin');
      $states.connected = 1;
      return;
    }


    $states.connected = 2;

    publish('distance', data.distance);
    publish('battery/state', data.batteryChargerState );
    publish('battery/percentage',debug.landroid.battery.percentage);
    publish('work_request', data.workReq);
    publish('error', data.message);
    publish('firmware', data.versione_fw);
    publish('waitAfterRain', data.rit_pioggia );
    publish('rain', debug.landroid.rainSensor );
    publish('area/total', data.num_aree_lavoro);
    publish('area/current', data.area);
    publish('area/computed', debug.landroid.aree.vet[debug.landroid.aree.index]);
    publish('borderCut', data.enab_bordo === 1);


    //now the alarms data.allarmi

    data.allarmi.forEach ((val,idx) => {
      if (idx < 13) {
        publish('alarm/'+ALARMS_TXT[idx], val === 1);
      }
    });


    publish('taggi', data.settaggi.join(''));
    publish('state', data.state);
    if (data.state !== debug.landroid.state) {
      $log.warn ('States different', data.state, debug.landroid.state);
    }

    $states.status('debug', readData,false);
    $log.debug ('Mower overview', mower);

  }

  function startMower() {
    $log.info("Start Landroid");
    doPost('data=[["settaggi", 11, 1]]');
  }

  function stopMower() {
    $log.info("Stop Landroid");
    doPost('data=[["settaggi", 12, 1]]');
  }


  function updateStatus() {
    getStatus()
      .then (parseResponse)
      .catch (() => {
        $states.connected = 1;
        publish('error', 'disconnected');
      });
  }


  async function $onInit() {
    $log.info('Starting landroid');
    $states.establishCache('$#');


    $states.observe ('/$set/state').subscribe((msg) => {
      $log.debug ('Set state received', msg.topic, msg.val);
      if (msg.val === false) {
        stopMower();
      }
      else if (msg.val ===true) {
        startMower();
      }

    });

    updateStatus();

    interval = setInterval(updateStatus, $args.landroidPoll * 1000 );

    return true;


  }

  function $onDestroy() {
    $log.info('Destroying LANDROID Adapter');
    clearInterval(interval);
  }

  return {
    $onInit: $onInit,
    $onDestroy: $onDestroy
  }


}

ha4us(ADAPTER_OPTIONS, Adapter);
