export enum Msg {
    NOTEXISTING = 0,
    Ok = 200,
    FileNotFound = 404,
    Duplicate = 409,

    ObjectCreated = 1000,
    ObjectUpdated,
    ObjectDeleted,

    DeleteReally = 2000,
    CancelEdit = 2001,
}
