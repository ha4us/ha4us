import { Ha4usLogger, MqttUtil, Ha4usObject, Ha4usObjectType, Ha4usError } from 'ha4us/core';

import {
  ha4us, Ha4usArguments,
  ObjectService,
  StateService,
  ArgumentFactory,
  YamlService, CreateObjectMode
} from 'ha4us/adapter';

import { getIp } from 'ha4us/adapter/helper';


const xmlrpc = require('homematic-xmlrpc');
const binrpc = require('binrpc');
import * as yaml from 'js-yaml';
import * as iconv from 'iconv-lite';
import * as got from 'got';

import { Observable, from, zip, empty } from 'rxjs';

import { mergeMap, count, toArray, map, distinct, tap } from 'rxjs/operators';



import { unescape } from 'querystring';
import { HMJson } from './hmjson';

const HM_PROTOCOLS = {
  'BidCos-Wired': 'binrpc',
  'BidCos-RF': 'binrpc',
  CUxD: 'binrpc',
  'HmIP-RF': 'xmlrpc',
  System: 'binrpc'
};

const DEVICES_SCRIPT = `
string sD;
string sC;
string id;
foreach (sD, root.Devices().EnumUsedIDs()) {
    object oD   = dom.GetObject(sD);
    if (oD.ReadyConfig()) {
        WriteLine('- address: ' # oD.Address());
        Write    ('  name: ' # oD.Name()); WriteLine('');
        Write    ('  id: ' # oD.ID()); WriteLine('');
        Write    ('  type: ' # oD.HssType()); WriteLine('');
        Write    ('  channels: '); WriteLine('');
        foreach(sC, oD.Channels()) {
          object oC = dom.GetObject(sC);
          WriteLine('   - address: ' # oC.Address());
          Write ('     name: ' # oC.Name()); WriteLine('');
          Write ('     id: ' # oC.ID()); WriteLine('');
          Write    ('     type: ' # oC.HssType()); WriteLine('');
          Write    ('     tags: '); WriteLine('');
          foreach(id, oC.ChnFunction()) {
            Write  ('     - "#' # dom.GetObject(id) # '"'); WriteLine('');
          }
          foreach(id, oC.ChnRoom()) {
            Write    ('     - "@' # dom.GetObject(id) # '"'); WriteLine('');
          }
        }
    }
}
`;

const HM_TYPEMAP = {
  BOOL: 'boolean',
  ACTION: 'boolean',
  FLOAT: 'number',
  INTEGER: 'number',
  ENUM: 'string',
  STRING: 'string'
};


// those channels are used for virtual groups, so imho they should not be controller by ha4us
const IGNORE_TYPES = [
  'WEATHER_RECEIVER',
  'CLIMATECONTROL_RECEIVER',
  'WINDOW_SWITCH_RECEIVER',
  'CLIMATECONTROL_RT_RECEIVER',
  'REMOTECONTROL_RECEIVER',
  'VIRTUAL_DIMMER',
  'CONDITION_POWER',
  'CONDITION_CURRENT',
  'CONDITION_VOLTAGE',
  'CONDITION_FREQUENCY',
  'SWITCH_TRANSMIT'
];


const DEV_ROLE_MAP = {
  'POWERMETER': 'Device/PowerSensor',
  'VIRTUAL_KEY': 'Channel/Button',
  'BLIND': 'Device/Blind',
  'THERMALCONTROL_TRANSMIT': 'Device/Thermostat',
  'WEATHER_TRANSMIT': 'Device/ClimateSensor',
  'SWITCH': 'Device/Switch',
  'SHUTTER_CONTACT': 'Device/ShutterContact',
  'ROTARY_HANDLE_SENSOR': 'Device/RotaryHandleSensor',
  'WEATHER': 'Device/ClimateSensor',
  'DIMMER': 'Device/Dimmer',
  'CLIMATECONTROL_RT_TRANSCEIVER': 'Device/Thermostat',
  'MOTION_DETECTOR': 'Device/MotionSensor',
  'TILT_SENSOR': 'Device/TiltSensor',
  'KEY': 'Channel/Button',
  'HM-RCV-50': 'Device/Remote/50',
  'HM-ES-PMSw1-Pl': 'Device/Switch',
  'HM-LC-Dim1L-Pl-2': 'Device/Dimmer',
  'HM-Sec-SCo': 'Device/ShutterContact',
  'HM-LC-Sw1PBU-FM': 'Device/Switch',
  'HM-PB-6-WM55': 'Device/Remote/6',
  'HM-LC-Sw1-Pl-2': 'Device/Switch/2',
  'HM-RC-4-2': 'Device/Remote/4',
  'HM-LC-Sw1-SM': 'Device/Switch',
  'HM-WDS10-TH-O': 'Device/ClimateSensor',
  'HM-LC-Sw1-FM': 'Device/Switch',
  'HM-WDS40-TH-I': 'Device/ClimateSensor',
  'HM-Sec-TiS': 'Device/TiltSensor',
  'HM-LC-Sw2-FM': 'Device/Switch/2',
  'HM-Sec-MDIR-2': 'Device/MotionSensor',
  'HM-LC-Dim1TPBU-FM': 'Device/Dimmer',
  'HM-PB-2-WM55': 'Device/Remote/2',
  'HM-WDS40-TH-I-2': 'Device/ClimateSensor',
  'HM-RC-2-PBU-FM': 'Device/Remote/2',
  'HM-Sec-SC': 'Device/ShutterContact',
  'HM-PBI-4-FM': 'Device/Remote/4',
  'HM-Sec-SC-2': 'Device/ShutterContact',
  'HM-CC-RT-DN': 'Device/Thermostat',
  'HM-LC-Bl1PBU-FM': 'Device/Blind',
  'HM-TC-IT-WM-W-EU': 'Device/Thermostat',
  'HM-Sec-RHS': 'Device/RotaryHandleSensor',
}


const DP_ROLE_MAP = {
  'ACTUAL_HUMIDITY': 'Value/Climate/Humidity',
  'ACTUAL_TEMPERATURE': 'Value/Climate/Temperature',
  'AES_KEY': 'Value/System/AESKey',
  'AUTO_MODE': 'Action/Heating/Auto',
  'BATTERY_STATE': 'Value/System/Battery',
  'BOOST_MODE': 'Action/Heating/Boost',
  'BOOST_STATE': 'Value/Heating/BoostTime',
  'BOOT': 'Indicator/System/Boot',
  'BRIGHTNESS': 'Value/Brightness',
  'COMFORT_MODE': 'Action/Heating/Comfort',
  'COMMUNICATION_REPORTING': 'Indicator/System/Communication',
  'CONFIG_PENDING': 'Indicator/System/Config',
  'CONTROL_MODE': 'Value/Heating/Mode',
  'CURRENT': 'Value/Electricity/Current',
  'DEVICE_IN_BOOTLOADER': 'Indicator/System/Boot',
  'BLIND.DIRECTION': 'Value/Blind/Direction',
  'DIMMER.DIRECTION': 'Value/Light/Direction',
  'DUTYCYCLE': 'Indicator/System/Duty',
  'ENERGY_COUNTER': 'Value/Electricity/Energy',
  'ENTER_BOOTLOADER': 'Indicator/System/Bootloader',
  'ERROR': 'Value/System/Error',
  'ERROR_OVERHEAT': 'Indicator/System/Overheat',
  'ERROR_OVERLOAD': 'Indicator/System/Overload',
  'ERROR_REDUCED': 'Indicator/System/Error',
  'FAULT_REPORTING': 'Value/System/FaultReport',
  'FREQUENCY': 'Value/Electricity/Frequency',
  'HUMIDITY': 'Value/Climate/Humidity',
  'INHIBIT': 'Toggle/System/Lock',
  'INSTALL_MODE': 'Indicator/System/Install',
  'INSTALL_TEST': 'Action/System/Test',
  'BLIND.LEVEL': 'Range/BlindLevel',
  'DIMMER.LEVEL': 'Range/PowerLevel',
  'VIRTUAL_KEY.LEVEL': 'Range/PowerLevel',
  'LEVEL_REAL': 'Value/PowerLevel',
  'LOWBAT': 'Indicator/System/Battery',
  'LOWBAT_REPORTING': 'Indicator/System/Battery',
  'LOWERING_MODE': 'Action/Heating/Lowering',
  'MANU_MODE': 'Range/Heating/Manual',
  'MOTION': 'Indicator/Motion',
  'OLD_LEVEL': 'Value/PowerLevel',
  'ON_TIME': 'Range/System/OnTime',
  'PARTY_MODE_SUBMIT': 'Input/Heating/Party/Submit',
  'PARTY_START_DAY': 'Range/Heating/Party/StartDay',
  'PARTY_START_MONTH': 'Range/Heating/Party/StartMonth',
  'PARTY_START_TIME': 'Range/Heating/Party/StartTime',
  'PARTY_START_YEAR': 'Range/Heating/Party/StartYear',
  'PARTY_STOP_DAY': 'Range/Heating/Party/StopDay',
  'PARTY_STOP_MONTH': 'Range/Heating/Party/StopMonth',
  'PARTY_STOP_TIME': 'Range/Heating/Party/StopTime',
  'PARTY_STOP_YEAR': 'Range/Heating/Party/StopYear',
  'PARTY_TEMPERATURE': 'Range/Heating/Party/Temperature',
  'POWER': 'Value/Electricity/Power',
  'PRESS_CONT': 'Action/PressCont',
  'PRESS_LONG': 'Action/PressLong',
  'PRESS_LONG_RELEASE': 'Action/ReleaseLong',
  'PRESS_SHORT': 'Action/PressShort',
  'RAMP_STOP': 'Action/RampStop',
  'RAMP_TIME': 'Value/System/Ramptime',
  'RSSI_DEVICE': 'Value/System/RssiDevice',
  'RSSI_PEER': 'Value/System/RssiPeer',
  'SET_TEMPERATURE': 'Range/Heating/Temperature',
  'SHUTTER_CONTACT.STATE': 'Indicator/Open',
  'SWITCH.STATE': 'Toggle/PowerState',
  'TILT_SENSOR/STATE': 'Indicator/Tilt',
  'ROTARY_HANDLE_SENSOR.STATE': 'Value/RotaryHandleState',
  'STICKY_UNREACH': 'Indicator/System/StickyUnreach',
  'STOP': 'Action/Stop',
  'TEMPERATURE': 'Value/Climate/Temperature',
  'UNREACH': 'Indicator/System/Unreach',
  'UPDATE_PENDING': 'Indicator/System/UpdatePending',
  'VALVE_STATE': 'Value/ValveLevel',
  'VOLTAGE': 'Value/Electricity/Voltage',
  'WINDOW_OPEN_REPORTING': 'Indicator/Open',
  'WORKING': 'Indicator/System/Working',
}


const ADAPTER_OPTIONS = {
  name: 'hm',
  path: __dirname + '/..',
  imports: [
    '$log',
    '$args',
    '$yaml',
    '$states',
    '$objects'
  ],
  args: {
    address: {
      alias: 'a',
      demandOption: false,
      describe: 'ip of the homematic ccu',
      type: 'string',
      default: '192.168.1.10'
    },
    interfaces: {
      alias: 'i',
      demandOption: false,
      describe: 'interfaces of host system',
      type: 'string',
      default: 'eth0,utun0,en0,br0'
    },
    file: {
      alias: 'file',
      demandOption: false,
      describe: 'mapping configuration (yml-file)',
      type: 'string',
      implies: 'names',
      requiresArg: false
    },
    names: {
      alias: 'names',
      choices: ['read', 'write'],
      demandOption: false,
      describe: 'read or write names from/to ccu',
      type: 'string',
      implies: 'hm-file',
      requiresArg: false
    },
    // hmPingIntervall
    // ,
    pingInterval: {
      alias: 'ping',
      demandOption: false,
      describe: 'ping interval to hm',
      type: 'number',
      default: 30
    },
    // hmipReconnectInterval
    reconnect: {
      alias: 'r',
      demandOption: false,
      describe: 'reconnect intervall to hm',
      type: 'number',
      default: 30
    },

    // binrpcListenPort
    binrpcListenPort: {
      alias: 'blp',
      demandOption: false,
      describe: 'listenport for binrpc',
      type: 'number',
      default: 2127
    },
    // hm Host Ip: Used for docker where we're masking the ip in bridged network
    hostIp: {
      demandOption: false,
      describe: 'ip of listening host',
      type: 'string',

    },
    // hmipReconnectInterval
    listenPort: {
      alias: 'lp',
      demandOption: false,
      describe: 'listenport for xmlrpc',
      type: 'number',
      default: 2126
    },
    // hmipReconnectInterval
    user: {
      alias: 'user',
      demandOption: false,
      describe: 'user for hmjson access',
      type: 'string',
      default: 'Admin'
    },
    password: {
      alias: 'password',
      demandOption: false,
      describe: 'password for hmjson access',
      type: 'string',
      default: ''
    }
  }
};

function Adapter(
  $log: Ha4usLogger,
  $yaml: YamlService,
  $args: Ha4usArguments,
  $states: StateService,
  $objects: ObjectService
) {
  let hmjson: HMJson;



  let localAddress;

  const rpcClient = {};
  const rpcServer = {};
  const lastEvent = {};

  const address2object = {};
  const topic2object = {};
  let knownDevices = [];
  const objects: Ha4usObject[] = [];
  let ignored = [];

  function registerObject(object: Ha4usObject) {
    address2object[object.native.address + '/' + object.native.dp] = object;
    topic2object[object.topic] = object;
    objects.push(object);
  }

  function rpcType(val, object) {
    switch (object.native.type) {
      case 'BOOL':
      // eslint-disable-line no-fallthrough
      case 'ACTION':
        // OMG this is so ugly...
        if (val === 'false') {
          val = false;
        } else if (!isNaN(val)) {
          // Make sure that the string "0" gets casted to boolean false
          val = Number(val);
        }
        val = Boolean(val);
        break;
      case 'FLOAT':
        val = parseFloat(val);
        if (val < object.min) {
          val = object.min;
        } else if (val > object.max) {
          val = object.max;
        }
        if (object.native.factor) {
          val = val / object.native.factor;
        }
        val = { explicitDouble: val };
        break;
      case 'ENUM':
        if (typeof val === 'string') {
          if (object.native.enum && object.native.enum.indexOf(val) !== -1) {
            val = object.native.enum.indexOf(val);
          }
        }
      // tslint:disable-next-line:no-switch-case-fall-through
      case 'INTEGER':
        val = parseInt(val, 10);

        if (val < object.native.min) {
          val = object.native.min;
        } else if (val > object.native.max) {
          val = object.native.max;
        }
        break;
      case 'STRING':
        val = String(val);
        break;
      default:
    }

    return val;
  }

  function set(topic, value) {
    $log.debug('Setting %s to %s', topic, value);

    const object = topic2object[topic];
    if (!object) {
      $log.info('Object not found', topic);
      return;
    }

    $log.debug('Found object', object.topic);
    if (!object.can.write) {
      $log.info('Object %s is not writable', object.topic);
      return;
    }
    const val = rpcType(value, object);

    $log.debug(
      'rpc %s.%s.%s > setValue',
      object.native.interface,
      object.native.address,
      object.native.dp,
      val
    );
    rpcClient[object.native.interface].methodCall(
      'setValue',
      [object.native.address, object.native.dp, val],
      err => {
        if (err) {
          $log.error(err);
        }
      }
    );
  }

  function get(topic) {
    $log.debug('Getting %s to %s', topic);

    const object = topic2object[topic];
    if (!object) {
      $log.info('Object not found', topic);
      return;
    }

    $log.debug('Found object', object.topic);
    if (!object.can.read) {
      $log.info('Object %s is not readable', object.topic);
      return;
    }

    $log.debug(
      'rpc %s.%s.%s > getValue',
      object.native.interface,
      object.native.address,
      object.native.dp
    );
    rpcClient[object.native.interface].methodCall(
      'getValue',
      [object.native.address, object.native.dp],
      (err, data) => {
        if (err) {
          $log.error(err);
        }
        $log.debug('Got', data);

        if (object.native.factor) {
          data = data * object.native.factor;
        }

        const retain = object.native.type !== 'ACTION';

        $states.status(object.topic, data, retain);
      }
    );
  }

  function checkInit(iface, protocol) {
    const now = new Date().getTime();
    const elapsed = Math.ceil((now - (lastEvent[iface] || 0)) / 1000);
    if (iface === 'hmip' && $args.hmReconnect) {
      if (elapsed >= $args.hmReconnect) {
        initIface(iface, protocol);
      }
    } else if (elapsed >= $args.hmPingInterval * 2) {
      initIface(iface, protocol);
    } else if (elapsed >= $args.hmPingInterval) {
      $log.debug('rpc', iface, '> ping');
      rpcClient[iface].methodCall('ping', ['ha4us-hm'], err => {
        if (err) {
          $log.error(err);
        }
      });
    }
  }

  function createIface(name, protocol, port) {
    $log.debug('createIface', name, protocol, port);
    if (!rpcServer[protocol]) {
      rpcServer[protocol] = createServer(protocol);
    }
    rpcClient[name] = createClient(protocol, port);
    initIface(name, protocol);
  }

  const stopIface = {};

  function initIface(name, protocol) {
    let url;
    if (protocol === 'binrpc') {
      url = 'xmlrpc_bin://' + $args.hmHostIp + ':' + $args.hmBinrpcListenPort;
    } else {
      url = 'http://' + $args.hmHostIp + ':' + $args.hmListenPort;
    }
    const params = [url, $args.name + '_' + name];
    $log.info('Initializing interface', name);
    $log.debug('rpc', name, '> init', params);
    lastEvent[name] = new Date().getTime();
    rpcClient[name].methodCall('init', params, (err, res) => {
      if (err) {
        $log.error(`initialization failed`, err);
      } else {
        $log.debug('rpc', name, '< init', JSON.stringify(res));
      }
      stopIface[name] = async () => {
        const stopParams = [url, ''];
        $log.info('Stopping interface %s', name);
        $log.debug('rpc', name, '> init', stopParams);
        return new Promise(resolve => {
          rpcClient[name].methodCall('init', stopParams, (err2, res2) => {
            $log.debug('rpc', name, '< init', err2, JSON.stringify(res2));
            resolve();
          });
        });
      };
    });
  }

  function createClient(protocol, port) {
    let client;
    const options = {
      host: $args.hmAddress,
      port,
      path: '/'
    };
    if (protocol === 'binrpc') {
      client = binrpc.createClient(options);
    } else {
      client = xmlrpc.createClient(options);
    }
    return client;
  }

  function ifaceName(id) {
    return id.replace(new RegExp(`^${$args.name}_`), '');
  }
  function getParamsetDescription(
    iface: string,
    address: string,
    paramset: string
  ) {
    return new Promise(resolve => {
      rpcClient[iface].methodCall(
        'getParamsetDescription',
        [address, paramset],
        (err, res) => {
          if (!err) {
            resolve(res);
          } else {
            $log.warn('Error retrieving paramset', err);
            resolve(res);
          }
        }
      );
    });
  }

  const rpcMethods: any = {
    notFound: method => {
      $log.warn('rpc < Method ' + method + ' does not exist');
    },
    'system.multicall': (err, params, callback) => {
      if (err) {
        $log.error(err);
        return;
      }
      const res = [];
      params[0].forEach(c => {
        if (rpcMethods[c.methodName]) {
          rpcMethods[c.methodName](err, c.params);
        } else {
          rpcMethods.notFound(c.methodName);
        }
        res.push('');
      });
      return callback(null, res);
    },
    'system.listMethods': (err, params, callback) => {
      if (err) {
        $log.error(err);
        return;
      }
      $log.debug('rpc < system.listMethods', params);
      return callback(null, Object.keys(rpcMethods));
    },
    event: (err, params, callback) => {
      if (err) {
        $log.error(err);
        return;
      }
      $log.debug('rpc < event', JSON.stringify(params));
      const name = ifaceName(params[0]);
      const ts = new Date().getTime();
      lastEvent[name] = ts;

      if (params[1] === 'CENTRAL' && params[2] === 'PONG') {
        if (typeof callback === 'function') {
          return callback(null, '');
        }
        return;
      }

      const object = address2object[params[1] + '/' + params[2]];
      if (!object) {
        $log.warn('Unknown device %s or datapoint %s', params[1], params[2]);
        return;
      }
      $log.debug('Found object for %s with topic %s', params[1], object.topic);

      let val = params[3];

      if (object.native.factor) {
        val = val * object.native.factor;
      }

      const retain = object.native.type !== 'ACTION';

      $states.status(object.topic, params[3], retain);

      if (typeof callback === 'function') {
        return callback(null, '');
      }
    },
    listDevices: (err, params, callback) => {
      if (err) {
        $log.error(err);
        return;
      }
      $log.debug('rpc < listDevices', params);
      const name = ifaceName(params[0]);
      const ret = knownDevices
        .filter(dev => dev.INTERFACE === name)
        .map(({ ADDRESS, VERSION }) => ({ ADDRESS, VERSION }));

      $log.debug('>', ret.length);
      return callback(null, ret);
    },
    deleteDevices: (err, params, callback) => {
      if (err) {
        $log.error(err);
        return;
      }
      $log.debug('rpc < deleteDevices', params[1].length);
      const name = ifaceName(params[0]);
      const obj2Del = objects.filter(obj => {
        return params[1].indexOf(obj.native.address) > -1;
      });

      $log.info('Deleting %d objects', obj2Del.length);

      from(obj2Del)
        .pipe(mergeMap(obj => $objects.delete(obj.topic), 1))
        .subscribe(res => {
          $log.debug('Deleted', res);
        });

      return callback(null, '');
    },
    newDevices: async (err, params, callback) => {
      if (err) {
        $log.error(err);
        return;
      }
      $log.debug('rpc < newDevices', params[1].length);

      const iname = ifaceName(params[0]);

      const newDevices =
        params[1].filter((device: any) => {
          if (
            // take if
            // theres is a VALUES Paramset
            device.PARAMSETS.indexOf('VALUES') > -1 &&
            // the device has a parent
            device.PARENT !== '' &&
            // the device type is not listed in the blacklist
            IGNORE_TYPES.indexOf(device.TYPE) === -1
          ) {
            return true;
          } else {
            if (
              IGNORE_TYPES.indexOf(device.TYPE) === -1
            ) {
              $log.warn(`Device ${device.ADDRESS}-${device.TYPE} ignored. Parent=${device.PARENT} PARAMSETS=${device.PARAMSETS.join(',')}`)
            }
            ignored.push({
              ADDRESS: device.ADDRESS,
              VERSION: device.VERSION,
              INTERFACE: iname
            });
            return false;
          }
        })
      const names = {};
      if (newDevices.length > 0) {
        // now fetchall names via rega
        $log.debug(`Fetching Rega Information for all devices`)
        const regaInfo = await regaYaml(DEVICES_SCRIPT);

        regaInfo.forEach(device => {
          device.channels
            .forEach((channel, idx, arr) => {
              names[channel.address] = channel;
              names[channel.address].model = device.type;
              if (idx === 0) {
                names[channel.address].name = device.name;
              }

            });
        });


      }
      $log.debug(`${newDevices.length} devices to be processed - ${ignored.length} will be ignored`);

      from(newDevices).pipe(
        mergeMap((device: any) => {
          const info = names[device.ADDRESS];
          if (!info) {
            $log.warn(`No rega information for ${device.ADDRESS}`);
            return empty();
          }




          const object: Ha4usObject = {
            topic: info.name,
            label: info.name.replace(/\//g, ' '),
            type: Ha4usObjectType.Object,
            tags: info.tags,
            role: DEV_ROLE_MAP[device.TYPE] ? DEV_ROLE_MAP[device.TYPE] : DEV_ROLE_MAP[info.model],
            can: {
              // tslint:disable
              read: false,
              write: false,
              trigger: false
              // tslint:enable
            },
            native: {
              address: device.ADDRESS,
              version: device.VERSION,
              interface: iname,
              devType: device.TYPE,
              model: info.model,
            }
          };

          if (!object.role) {
            $log.warn(`Type ${device.TYPE} and model ${info.model} not known - please contact developer`);
          }


          return $objects.install(object.topic, object, CreateObjectMode.force)
            .then(() =>
              getParamsetDescription(ifaceName(params[0]),
                device.ADDRESS,
                'VALUES')).then(values => ({ device, values, info }))
        }, 10),

        mergeMap(({ device, values, info }) => {
          return from(
            Object.keys(values)
              .map(valueKey => {

                const value = values[valueKey];
                const role = DP_ROLE_MAP[value.ID] ? DP_ROLE_MAP[value.ID] : DP_ROLE_MAP[[info.type, value.ID].join('.')]
                if (!role) {
                  $log.warn(`Datapoint ${value.ID} for type ${info.type} not known - please contact developer`);
                }

                const obj: Ha4usObject = {
                  topic: MqttUtil.join(info.name, value.ID),
                  label: info.name.replace(/\//g, ' '),
                  type: HM_TYPEMAP[value.TYPE],
                  min: value.MIN,
                  max: value.MAX,
                  unit: value.UNIT === '�C' ? '°C' : value.UNIT,
                  tags: info.tags,
                  role,
                  can: {
                    // tslint:disable
                    read: (value.OPERATIONS & 1) !== 0,
                    write: (value.OPERATIONS & 2) !== 0,
                    trigger: (value.OPERATIONS & 4) !== 0
                    // tslint:enable
                  },
                  native: {
                    address: device.ADDRESS,
                    version: device.VERSION,
                    interface: iname,
                    dp: value.ID,
                    type: value.TYPE,
                    min: value.MIN,
                    max: value.MAX,
                    factor: null,
                    id: info.id,
                    devType: info.type,
                  }
                };
                if (value.UNIT === '100%') {
                  obj.unit = '%';
                  obj.native.factor = 100;
                  obj.max = 100;
                }
                return obj;
              })
          );

        }),
        mergeMap((object: Ha4usObject) => {
          // $log.debug(`Installing object ${object.topic}`)
          return $objects.install(object.topic, object, CreateObjectMode.force).then(registerObject);
        }),
        count()
      )
        .subscribe(res => {
          $log.info('%d objects handled (%d ignored)', res, ignored.length);
          $objects.install(
            $args.name, {
              native: {
                ignored: ignored
              }
            },
            CreateObjectMode.force
          );
        })




      return callback(null, '');
    }
  };

  rpcMethods.NotFound = rpcMethods.notFound;

  function createServer(protocol) {
    let server;
    if (protocol === 'binrpc') {
      server = binrpc.createServer({
        host: localAddress,
        port: $args.hmBinrpcListenPort
      });
    } else {
      server = xmlrpc.createServer({
        host: localAddress,
        port: $args.hmListenPort
      });
    }
    Object.keys(rpcMethods).forEach(method => {
      server.on(method, rpcMethods[method]);
    });
    return server;
  }
  function regaYaml(script): any {
    const url = `http://${$args.hmAddress}:8181/rega.exe`;
    return got
      .post(url, {
        body: script,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': script.length
        },
        encoding: null
      })
      .then(result => {
        const yml = iconv.decode(new Buffer(result.body), 'ISO-8859-1');
        return yaml.safeLoad(yml.substr(0, yml.indexOf('<xml>')));
      });
  }

  async function namings() {
    if ($args.names === 'write') {
      $log.debug('Writing names to ccu');
      const names = await $yaml.load($args.file);
      const devices = await regaYaml(DEVICES_SCRIPT);
      const renames = [];
      devices.forEach(device => {
        let newDevName = names[device.address];
        if (newDevName && newDevName !== device.name) {
          $log.debug('%s -> %s', device.name, newDevName);
          renames.push({
            method: 'Device.setName',
            params: { id: device.id, name: newDevName }
          });
        } else {
          newDevName = device.name;
        }
        device.channels
          .filter(channel => IGNORE_TYPES.indexOf(channel.type) === -1)
          .forEach((channel, idx, arr) => {
            let newChName: string;

            if (idx === 0) {
              newChName = newDevName + ':0';
            } else if (idx > 0 && arr.length === 2) {
              newChName = newDevName;
            } else if (names[channel.address]) {
              newChName = names[channel.address];
            } else {
              newChName = newDevName + '/' + idx;
            }

            if (channel.name !== newChName) {
              $log.debug('%s -> %s', channel.name, newChName);
              renames.push({
                method: 'Channel.setName',
                params: { id: channel.id, name: newChName }
              });
            } else {
              $log.debug(
                'Channel not renamed',
                channel.name,
                idx,
                arr.length,
                newChName
              );
            }
          });
      });

      const result = await from(renames)
        .pipe()
        .toPromise();

      $log.info('Finished', result);
    } else {
      $log.debug('Reading names from ccu');
      const result = {};
      const names = await regaYaml(DEVICES_SCRIPT);
      $log.debug('Names', names);
      names.forEach(device => {
        result[device.address] = device.name;

        device.channels
          .filter(channel => IGNORE_TYPES.indexOf(channel.type) === -1)
          .forEach((channel, idx, arr) => {
            // only export channel name definition
            // channel 0 is not labeled according to devicname
            if (
              (idx === 0 && channel.name !== device.name + ':0') ||
              // we have only one productive channel, that is not namen equal to the device
              (arr.length <= 2 && idx === 1 && channel.name !== device.name) ||
              // or we have multiple channel
              (arr.length > 2 && idx !== 0)
            ) {
              result[channel.address] = channel.name;
            } else {
              $log.debug('Ignoring channel %s', channel.name);
            }
          });
      });
      await $yaml.save(result, $args.file);
    }
    return;
  }

  async function $onInit(): Promise<boolean> {
    $log.info('Starting hm as %s', $args.name);

    hmjson = new HMJson($log, $args)
    $log.info('Looking for local IPs', $args.hmInterfaces)
    localAddress = getIp($args.hmInterfaces, 'IPv4');
    if (typeof localAddress !== 'string' && !$args.hmHostIp) {
      $log.error('No valid IP discovered', localAddress);
      throw (new Ha4usError(500, `Can't determine host ip at ${$args.hmInterfaces}`))

    }
    $args.hmHostIp = $args.hmHostIp || localAddress;
    $log.info(`Masking server ip with ${$args.hmHostIp}`);

    const data = await $objects
      .observe(MqttUtil.join($args.name, '#'))
      .pipe(

        map((object: Ha4usObject) => {
          registerObject(object);
          return {
            ADDRESS: object.native.address,
            VERSION: object.native.version,
            INTERFACE: object.native.interface
          };
        }),
        distinct(({ ADDRESS, VERSION }) => ADDRESS + VERSION),
        toArray(),
        mergeMap((devices: any[]) => {
          return $objects.observe($args.name).pipe(
            map(obj => {

              ignored = obj.native.ignored || [];
              return ignored.concat(devices);
            })
          );
        })
      )
      .toPromise();



    if (data) {
      $log.info(
        'Loaded %d known devices (%d currently ignored)',
        data.length,
        ignored.length
      );
      knownDevices = data;
    } else {
      knownDevices = [];
    }

    if ($args.names) {
      $log.info(namings)
      return false
    }

    const interfaces = (await hmjson.sendCommand('Interface.listInterfaces')).map(
      iface => {
        iface.protocol = HM_PROTOCOLS[iface.name];
        return iface;
      }
    );

    $log.debug('Using interfaces', interfaces.map(iface => iface.name).join(','));

    interfaces.forEach(iface => {
      $log.info(
        'Accessing %s at  %s://%s:%d',
        iface.name,
        iface.protocol,
        $args.hmAddress,
        iface.port
      );
      createIface(iface.name, iface.protocol, iface.port);
      if (iface.name === 'HmIP-RF' && $args.hmReconnect) {
        setInterval(() => {
          checkInit(iface.name, iface.protocol);
        }, $args.hmReconnect * 1000);
      } else if ($args.hmPingIntervall) {
        setInterval(() => {
          checkInit(iface.name, iface.protocol);
        }, $args.hmPingIntervall * 1000);
      }
    });

    $states.connected = 2;

    $states.establishCache('$#');

    $states.observe('/$set/#').subscribe(message => {
      set(MqttUtil.join($args.name, message.match.params[0]), message.val);
    });
    $states.observe('/$get/#').subscribe(message => {
      get(MqttUtil.join($args.name, message.match.params[0]));
    });

    return true;
  }

  async function $onDestroy() {
    $log.info('Destroying hm Adapter');
    await hmjson.logout();
    const cmdQueue = [];
    Object.keys(stopIface).forEach(iface => {
      cmdQueue.push(stopIface[iface]());
    });
    // await $p.timeout(Promise.all(cmdQueue), 2500, 'Timeout stopping interfaces');
    await Promise.all(cmdQueue);
    $states.connected = 0;

    return;
  }

  return {
    $onInit: $onInit,
    $onDestroy: $onDestroy
  };
}

ha4us(ADAPTER_OPTIONS, Adapter).catch(e => {
  console.log(e);
});
