export enum Msg {
  NOTEXISTING = 0,
  Ok = 200,
  FileNotFound = 404,
  Duplicate = 409,

  ObjectCreated = 1000,
  ObjectUpdated,
  ObjectDeleted,

  UserCreated = 1100,
  UserUpdated,
  UserDeleted,

  DeleteReally = 2000,
  CancelEdit = 2001,
}

export enum MessageType {
  'debug',
  'info',
  'warn',
  'error',
}

export const MESSAGES = {
  [Msg.NOTEXISTING]: {
    msg: 'Meldung mit Nummer %d existiert nicht',
    type: MessageType.warn,
  },
  [Msg.Ok]: {
    msg: 'ok.',
    type: MessageType.info,
  },
  [Msg.FileNotFound]: {
    msg: '%s wurde nicht gefunden',
    type: MessageType.warn,
  },
  [Msg.Duplicate]: {
    msg: '%s existiert bereits',
    type: MessageType.error,
  },
  [Msg.ObjectCreated]: {
    msg: 'Objekt %s wurde erfolgreich angelegt',
    type: MessageType.info,
  },
  [Msg.ObjectUpdated]: {
    msg: 'Objekt %s wurde erfolgreich gespeichert',
    type: MessageType.info,
  },
  [Msg.ObjectDeleted]: {
    msg: 'Objekt %s wurde gelöscht',
    type: MessageType.info,
  },
  [Msg.UserCreated]: {
    msg: 'Benutzer %s wurde erfolgreich angelegt',
    type: MessageType.info,
  },
  [Msg.UserUpdated]: {
    msg: 'Benutzer %s wurde erfolgreich gespeichert',
    type: MessageType.info,
  },
  [Msg.UserDeleted]: {
    msg: 'Benutzer %s wurde gelöscht',
    type: MessageType.info,
  },
  [Msg.DeleteReally]: {
    msg: 'Wirklich %s löschen?',
    type: MessageType.info,
  },
}
