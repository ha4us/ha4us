import { EventEmitter } from 'events';

export interface ISonosBackup {
  player: ISonosPlayer;
  group?: string;
  preset: ISonosPreset;
}

export interface ISonosService {
  id: number;
  capabililties: number;
  type: number;
}
export interface ISonosSystem extends EventEmitter {
  applyPreset: (preset: ISonosPreset) => Promise<any>;
  zones: ISonosZone[];
  availableServices: {
    [label: string]: ISonosService;
  };
  players: ISonosPlayer[];
  getPlayer: (roomName: string) => ISonosPlayer;
  dispose: () => void;
}
export interface IVolumeChange {
  uuid: string; // 'RINCON_5CAAFD998AA601400',
  previousVolume: number;
  newVolume: number;
  roomName: string; // 'Hannover'
}
export interface IMuteChange {
  uuid: string; // 'RINCON_5CAAFD998AA601400',
  previousMute: boolean;
  newMute: boolean;
  roomName: string; // 'Hannover'
}
export interface ISonosPlayMode {
  repeat?: string;
  shuffle?: boolean;
  crossfade?: boolean;
}
export interface ISonosPreset {
  players: { roomName: string; volume: number }[];
  playMode?: { repeat: string };
  uri?: string;
  state?: string;
  favorite?: string;
  pauseOthers?: boolean;
  sleep?: number;
  metadata?: string;
  elapsedTime?: number;
  group?: string;
  trackNo?: number;
}

export interface ISonosZone {
  coordinator: ISonosPlayer;
  members: ISonosPlayer[];
  uuid: string;
  id: string;
}

export interface ISonosPlayer extends EventEmitter {
  roomName: string;
  volume: number;
  setVolume: (vol: number) => void;
  mute: () => void;
  unMute: () => void;
  pause: () => void;
  play: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  coordinator: ISonosPlayer;
  system: ISonosSystem;
  uuid: string;
  state: ISonosTransport;
  avTransportUri: string;
  avTransportUriMetadata: string;
  baseUrl: URL;
}
export interface ISonosTrackInfo {
  artist: string;
  title: string;
  album: string;
  albumArtUri: string;
  duration: number;
  uri: string;
  type: string;
  stationName: string;
  absoluteAlbumArtUri: string;
}
export interface ISonosTransport {
  volume: number;
  mute: boolean;
  equalizer: {
    bass: number;
    treble: number;
    loudness: boolean;
  };
  currentTrack: ISonosTrackInfo;
  nextTrack: ISonosTrackInfo;
  trackNo: number;
  elapsedTime: number;
  elapsedTimeFormatted: string;
  playbackState: 'STOPPED' | 'PLAYING';
  playMode: ISonosPlayMode;
}

export interface ITransportChange {
  roomName: string;
  newChange: ISonosTransport;
}
