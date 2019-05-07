## Objects

Objects are the representation of datapoints in the ha4us system.

They could be stored in the database and have the following interface

```ts
export interface IHa4usObject {
  _id?: string, //the mongodb id
  topic: string, // the mqtt topic (without command word)
  name?: string, // a descriptive name to search for
  type?: TObjectType, //s. below types
  tags?: string[], //s. below tags
  can?: {
    read: boolean, //can be read (get operationn supported)
    write: boolean, //can be written (set operation)
    trigger: boolean //sends status updated
  }
}
```

### Tagging

Tags are basically an array of string - they're case insensitive and used for searching. The prefixes **@** and **#** have a special meaning and are indicating the *room* respectively the *function* of the datapoint. E.g. a ceiling light in the living room of first floor would be tagged with ```#Light,#CeilingLight,@1stFloor,@LivingRoom```, so one can search for ```@Light,@1stFloor```when looking for all lights of the first floor.
