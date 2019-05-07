export interface Ha4usMedia {
  id: string
  urn?: string
  filename: string
  description: string
  tags: string[]
  contentType?: string
  length: number
  expires?: Date
  uploadDate?: Date
  owner?: string
  md5?: string
}

export interface Ha4usMediaDefinition {
  id?: string
  filename?: string
  tags: string[]
  owner: string
  dtl: number
  description: string
  native?: { [prop: string]: any }
  contentType?: string
}
