export declare type LandroidState = 'home' | 'start sequence' | 'leaving house' | 'grass cutting' | 'trapped recovery' | 'lift recovery' | 'searching wire' | 'searching home' | 'following wire' | 'idle';
export declare type LandroidReq = 'scheduler req grass cut' | 'landroid req manual homing' | 'user req grass cut';
export declare type LandroidBatState = 'idle' | 'charging';
export declare type LandroidMessage = 'close door to cut grass' | 'outside wire' | 'trapped' | 'wire missing' | 'raining' | 'none';
export interface LandroidData {
    versione_fw: number;
    lingua: number;
    ore_funz: number[];
    ora_on: number[];
    min_on: number[];
    allarmi: number[];
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
     **/
    settaggi: number[];
    mac: number[];
    time_format: number;
    date_format: number;
    rit_pioggia: number;
    area: number;
    enab_bordo: number;
    percent_programmatore: number;
    indice_area: number;
    tempo_frenatura: number;
    perc_rallenta_max: number;
    canale: number;
    num_ricariche_batt: number;
    num_aree_lavoro: number;
    dist_area: number[];
    perc_per_area: number[];
    area_in_lavoro: number;
    email: string;
    perc_batt: string;
    ver_proto: number;
    state: LandroidState;
    workReq: LandroidReq;
    message: LandroidMessage;
    batteryChargerState: LandroidBatState;
    distance: number;
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
        aree: {
            index: number;
            vet: number[];
        };
        battery: {
            percentage: number;
            voltage: number;
            temperature: number;
            ntcResistance: number;
        };
        batteryCharger: {
            state: LandroidBatState;
            chargeCurrent: number;
        };
        accelerometer: {
            gravity: number[];
            angle: number[];
        };
        gyroscope: {
            angularSpeed: number[];
            angle: number[];
        };
        motor: [{
            speed: number;
            maxSpeed: number;
            speedReduction: number;
            rpm: number;
            feedbackError: number;
            acceleration: number;
            deceleration: number;
            fault: boolean;
        }, {
            speed: number;
            maxSpeed: number;
            speedReduction: number;
            rpm: number;
            feedbackError: number;
            acceleration: number;
            deceleration: number;
            fault: boolean;
        }, {
            speed: number;
            maxSpeed: number;
            speedReduction: number;
            rpm: number;
            feedbackError: number;
            acceleration: number;
            deceleration: number;
            fault: boolean;
        }];
        guide: {
            straightSpeed: number;
            turningSpeed: number;
            measuredWheelDeltaDistance: number;
            requiredWheelDeltaDistance: number;
            deltaSpeedCorrection: number;
        };
    };
    id: {
        stop1: boolean;
        stop2: boolean;
        lift1: boolean;
        lift2: boolean;
        trappedLeft: boolean;
        trappedRight: boolean;
        door1: boolean;
        door2: boolean;
    };
    dipSw: {
        sw1: boolean;
        sw2: boolean;
        sw3: boolean;
        sw4: boolean;
    };
    wireSensor: {
        fwVer: number;
        left: 'inside' | 'outside';
        right: 'outside' | 'inside';
    };
}
export declare class Landroid {
    protected ip: string;
    protected pin: string;
    constructor(ip: string, pin: string);
    readDebug(): Promise<LandroidDebug>;
    readData(): Promise<LandroidData>;
    doGet<T>(what: 'Debug' | 'data'): Promise<T>;
    doPost(request: string): Promise<LandroidState>;
    start(): Promise<LandroidState>;
    stop(): Promise<LandroidState>;
    observe(anInterval?: number): import("rxjs").Observable<{
        data: LandroidData;
        debug: LandroidDebug;
    }>;
}
