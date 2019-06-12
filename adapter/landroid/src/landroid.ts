import axios from 'axios'
import { interval, combineLatest, of } from 'rxjs'
import { switchMap, combineAll, map, catchError } from 'rxjs/operators'
export type LandroidState =
  | 'home'
  | 'start sequence'
  | 'leaving house'
  | 'grass cutting'
  | 'trapped recovery'
  | 'lift recovery'
  | 'searching wire'
  | 'searching home'
  | 'following wire'
  | 'idle'

export type LandroidReq =
  | 'scheduler req grass cut'
  | 'landroid req manual homing'
  | 'user req grass cut'

export type LandroidBatState = 'idle' | 'charging'

export type LandroidMessage =
  | 'close door to cut grass'
  | 'outside wire'
  | 'trapped'
  | 'wire missing'
  | 'raining'
  | 'none'

export interface LandroidData {
  versione_fw: number
  lingua: number
  ore_funz: number[]
  ora_on: number[]
  min_on: number[]
  /**
   *  [0] "Blade blocked"
   *  [1] "Repositioning error"
   *  [2] "Outside wire" ("Outside working area")
   *  [3] "Blade blocked"
   *  [4] "Outside wire" ("Outside working area")
   *  [5] "Mower lifted" ("Lifted up")
   *  [6] "error"
   *  [7] "error" (Set when "Lifted up" - "Upside down"?)
   *  [8] "error"
   *  [9] "Collision sensor blocked"
   *  [10] "Mower tilted"
   *  [11] "Charge error" (Set when "Lifted up"?)
   *  [12] "Battery error"
   *
   */
  allarmi: number[]

  settaggi: number[]
  mac: number[]

  time_format: number
  date_format: number
  rit_pioggia: number
  area: number
  enab_bordo: number
  percent_programmatore: number
  indice_area: number
  tempo_frenatura: number
  perc_rallenta_max: number
  canale: number
  num_ricariche_batt: number
  num_aree_lavoro: number
  dist_area: number[]
  perc_per_area: number[]
  area_in_lavoro: number
  email: string
  perc_batt: string
  ver_proto: number
  state: LandroidState
  workReq: LandroidReq
  message: LandroidMessage
  batteryChargerState: LandroidBatState
  distance: number
}

export interface LandroidDebug {
  landroid: {
    state: LandroidState;
    boardTemperature: number;
    distance: number;
    wheelLeftDistance: number;
    wheelRightDistance: number;
    angle: number;
    rainSensor: number;
    aree: { index: number; vet: number[] };
    battery: {
      percentage: number;
      voltage: number;
      temperature: number;
      ntcResistance: number;
    };
    batteryCharger: { state: LandroidBatState; chargeCurrent: number };
    accelerometer: { gravity: number[]; angle: number[] };
    gyroscope: { angularSpeed: number[]; angle: number[] };
    motor: [
      {
        speed: number;
        maxSpeed: number;
        speedReduction: number;
        rpm: number;
        feedbackError: number;
        acceleration: number;
        deceleration: number;
        fault: boolean;
      },
      {
        speed: number;
        maxSpeed: number;
        speedReduction: number;
        rpm: number;
        feedbackError: number;
        acceleration: number;
        deceleration: number;
        fault: boolean;
      },
      {
        speed: number;
        maxSpeed: number;
        speedReduction: number;
        rpm: number;
        feedbackError: number;
        acceleration: number;
        deceleration: number;
        fault: boolean;
      }
    ];
    guide: {
      straightSpeed: number;
      turningSpeed: number;
      measuredWheelDeltaDistance: number;
      requiredWheelDeltaDistance: number;
      deltaSpeedCorrection: number;
    };
  }
  id: {
    stop1: boolean;
    stop2: boolean;
    lift1: boolean;
    lift2: boolean;
    trappedLeft: boolean;
    trappedRight: boolean;
    door1: boolean;
    door2: boolean;
  }

  dipSw: { sw1: boolean; sw2: boolean; sw3: boolean; sw4: boolean }
  wireSensor: {
    fwVer: number;
    left: 'inside' | 'outside';
    right: 'outside' | 'inside';
  }
}

export class Landroid {
  constructor(protected ip: string, protected pin: string) {}

  async readDebug(): Promise<LandroidDebug> {
    return this.doGet<LandroidDebug>('Debug')
  }

  async readData(): Promise<LandroidData> {
    return this.doGet<LandroidData>('data')
  }

  async doGet<T>(what: 'Debug' | 'data'): Promise<T> {
    return axios
      .get<T>(`http://${this.ip}:80/json${what}.cgi`, {
        auth: {
          username: 'admin',
          password: this.pin,
        },
      })
      .then(data => {
        return data.data
      })
      .catch(e => {
        if (e.response.status === 404) {
          throw new Error(`landroid not found (${this.ip})`)
        }
        throw e
      })
  }

  async doPost(request: string) {
    return axios
      .post<LandroidData>(`http://${this.ip}:80/jsondata.cgi`, request, {
        headers: {
          'content-length': request.length,
          'content-type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        auth: {
          username: 'admin',
          password: this.pin,
        },
      })
      .then(result => result.data.state)
  }
  start() {
    return this.doPost('data=[["settaggi", 11, 1]]')
  }

  stop() {
    return this.doPost('data=[["settaggi", 12, 1]]')
  }

  observe(anInterval = 5) {
    return interval(anInterval * 1000).pipe(
      switchMap(() => {
        return combineLatest([this.readData(), this.readDebug()]).pipe(
          map(data => ({ data: data[0], debug: data[1] })),
          catchError(e => of(`landroid not reachable (${this.ip})`))
        )
      })
    )
  }
}
