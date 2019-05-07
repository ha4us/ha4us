export interface Ha4usEventOptions {
  data?: any;
  image?: string;
  audio?: string;
  generateTTS: boolean;
  volume?: number;
  storeDb: boolean;
  destinationTags?: string[];
  instances?: string[];
  adapters?: string[];
}

export const DEFAULT_EVENT_OPTIONS: Ha4usEventOptions = {
  generateTTS: false,
  volume: 50,
  storeDb: true,
};
