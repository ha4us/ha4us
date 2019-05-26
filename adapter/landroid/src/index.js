"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("rxjs/operators");
const adapter_1 = require("@ha4us/adapter");
const core_1 = require("@ha4us/core");
const landroid_1 = require("./landroid");
const ADAPTER_OPTIONS = {
    name: 'landroid',
    path: __dirname + '/..',
    args: {
        ip: {
            demandOption: true,
            describe: 'id of the landroid api',
            type: 'string',
            alias: 'ip',
        },
        pin: {
            demandOption: true,
            describe: 'pin for accessing the api',
            type: 'string',
            alias: 'pin',
        },
        poll: {
            demandOption: false,
            default: 5,
            describe: 'polling intervall in sec.',
            type: 'number',
        },
    },
    imports: ['$log', '$args', '$states', '$objects'],
};
function Adapter($log, $args, $states, $objects) {
    let sub;
    function $onInit() {
        return __awaiter(this, void 0, void 0, function* () {
            //  `http://${$args.landroidIp}:80/jsondata.cgi`,
            const landi = new landroid_1.Landroid($args.landroidIp, $args.landroidPin);
            yield $objects.install(null, { role: 'adapter/landroid' }, adapter_1.CreateObjectMode.create);
            yield $objects.install('landroid', { role: 'Device/Landroid' }, adapter_1.CreateObjectMode.create);
            yield $objects.install('landroid/battery', {
                role: 'Value/System/Battery',
                type: core_1.Ha4usObjectType.Number,
                can: { read: false, write: false, trigger: true },
            }, adapter_1.CreateObjectMode.create);
            yield $objects.install('landroid/state', {
                role: 'Mode/Landroid/State',
                type: core_1.Ha4usObjectType.String,
                can: { read: false, write: false, trigger: true },
            }, adapter_1.CreateObjectMode.create);
            yield $objects.install('landroid/error', {
                role: 'Value/Landroid/Errortext',
                type: core_1.Ha4usObjectType.String,
                can: { read: false, write: false, trigger: true },
            }, adapter_1.CreateObjectMode.create);
            yield $objects.install('landroid/start', {
                role: 'Action/PressShort',
                type: core_1.Ha4usObjectType.Boolean,
                can: { read: false, write: true, trigger: true },
            }, adapter_1.CreateObjectMode.create);
            yield $objects.install('landroid/stop', {
                role: 'Action/PressShort',
                type: core_1.Ha4usObjectType.Boolean,
                can: { read: false, write: true, trigger: true },
            }, adapter_1.CreateObjectMode.create);
            landi.observe().subscribe(data => {
                $log.debug('Work req', data.data.workReq);
                $states.status('$landroid/battery', data.debug.landroid.battery.percentage, true);
                $states.status('$landroid/state', data.debug.landroid.state, true);
                $states.status('$landroid/error', data.data.message !== 'none' ? data.data.message : '', true);
            });
            $states
                .observe('/$set/landroid/start')
                .pipe(operators_1.filter(msg => msg.val === true || msg.val === 'true'))
                .subscribe(msg => {
                landi.start();
            });
            $states
                .observe('/$set/landroid/stop')
                .pipe(operators_1.filter(msg => msg.val === true || msg.val === 'true'))
                .subscribe(msg => {
                landi.stop();
            });
            /* publish('distance', data.distance);
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
            publish('borderCut', data.enab_bordo === 1);*/
            /*
        
            await $objects.install(
              'sun',
              {
                role: 'value/sunposition',
                can: { read: false, write: false, trigger: true },
              },
              CreateObjectMode.create
            )*/
            /*  sub.add(
              $states
                .observe('/$set/+/state')
                .pipe(
                  switchMap(msg => {
                    const [scriptName] = msg.match.params
                    $log.debug(`Setting state of ${scriptName} to ${msg.val}`)
        
                    const storedScript = scripts.get(
                      MqttUtil.join($args.name, scriptName)
                    )
        
                    return of(storedScript).pipe(
                      mergeMap(aScript => {
                        if (aScript) {
                          if (msg.val === true) {
                            return aScript.compile().then(() => aScript.start())
                          } else {
                            return aScript.stop()
                          }
                        } else {
                          throw new Ha4usError(
                            404,
                            `script ${scriptName} does not exists`
                          )
                        }
                      }),
                      catchError(e => {
                        $log.error(
                          `Error setting state of ${scriptName} to ${msg.val} because ${
                            e.message
                          }`
                        )
                        return never()
                      })
                    )
                  })
                )
                .subscribe(
                  (script: Ha4usScript) => {
                    $log.info(
                      `script ${script.name} is ${
                        script.running ? 'running' : 'stopped'
                      }`
                    )
                  },
                  e => {
                    $log.error(`BUMMER`, e)
                  },
                  () => {
                    $log.error('Script STATE Listener completed')
                  }
                )
            )*/
            $states.connected = 2;
            return true;
        });
    }
    function $onDestroy() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    return {
        $onInit,
        $onDestroy,
    };
}
adapter_1.ha4us(ADAPTER_OPTIONS, Adapter);
/*function loadDir(dir) {
    async function destroyScript(name: string): Promise<Ha4usScript> {
      if (!scripts.has(name)) {
        throw new Ha4usError(404, `script ${name} does not exist`)
      }
      const script = scripts.get(name)
      $log.info('Stopping script', script.name)
      // run cleanup
      try {
        script.destroy()
      } catch (e) {
        $log.error('Probles cleaning up script', e)
        throw e
      } finally {
        scripts.delete(name)
      }

      return script
    }

    dir = path.resolve(dir)
    $log.debug('Loading dir', dir)
    const watch = chokidar.watch(dir + '/*.js')
    watch.on('ready', () => {
      $log.debug('Watching', watch.getWatched())
    })
    watch.on('add', (file: string, _?: fs.Stats) => {
      $log.info('Loading and Run script', file)
      installScript(new Ha4usScript(file), file)
    })
    watch.on('change', (file: string, _?: fs.Stats) => {
      $log.info('Script %s changed', file)
      //reloadScript(file)
    })
    watch.on('unlink', (file: string) => {
      $log.info('Script %s deleted', file)
      destroyScript(file)
    })
  }*/
//# sourceMappingURL=index.js.map