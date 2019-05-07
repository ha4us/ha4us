import { Ha4usMedia } from 'ha4us/core'

export interface Ha4usMediaCaching extends Ha4usMedia {
    cache?: string
}

export interface MediaSearchEvent {
    mimeType: string
    tags: string[]
    fileName: string
}
