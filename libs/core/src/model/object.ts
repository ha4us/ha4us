export enum Ha4usObjectType {
  'Boolean' = 'boolean',
  'Number' = 'number',
  'String' = 'string',
  'Object' = 'object',
  'Any' = 'any',
  'Mixed' = 'mixed',
  'Config' = 'config',
}
export type TObjectType = Ha4usObjectType

export enum Ha4usRole {
  'GenericAdapter' = 'Adapter',
  'ScriptAdapter' = 'Adapter/script',
  'Script' = 'Script',
  'Config' = 'config',
  'Controller' = 'controller',
  'PowerController' = 'controller/power',
  'PowerLevelController' = 'controller/powerLevel',
  'LockController' = 'controller/lock',
  'ThermostatController' = 'controller/thermostat',
  'TemperatureSensor' = 'sensor/temperature',
  'PowerSensor' = 'sensor/power',
  'PercentageController' = 'controller/percentage',
  'ColorController' = 'controller/color',
  'BrightnessController' = 'controller/brightness',
  'ColorTemperatureController' = 'controller/color',
  'CameraStreamController' = 'controller/cameraStream',
  'ChannelController' = 'controller/channel',
  'InputController' = 'controller/input',
  'PlaybackController' = 'controller/playback',
  'StepSpeaker' = 'stepSpeaker',
  'Speaker' = 'speaker',
}

export class Ha4usObjectDisplay {
  label?: string
  image?: string
  color?: string
  backgroundColor?: string
  hidden?: boolean
  template?: string
}

export class Ha4usObject extends Ha4usObjectDisplay {
  _id?: string
  urn?: string
  type: Ha4usObjectType = Ha4usObjectType.Any // the type of the state
  role?: string // the role of object,
  tags: string[] = []
  min?: number
  max?: number
  unit?: string
  can: {
    read?: boolean;
    write?: boolean;
    trigger?: boolean;
  }
  native: {
    [props: string]: any;
  }

  constructor(public topic: string) {
    super()
  }
}

export const HA4US_OBJECT: Ha4usObject = {
  topic: 'undefined',
  type: Ha4usObjectType.Any,
  tags: [],
  can: {
    read: false,
    write: false,
    trigger: false,
  },
  native: {},
}

export interface Ha4usObjectEvent {
  action: 'insert' | 'update' | 'delete'
  object: Ha4usObject
}
