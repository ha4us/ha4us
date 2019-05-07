export interface IValueMap<T, R> {
  name: string
  description?: string
  type?: string
  ifthens: IValueIfStatement<T, R>[]
  else?: R
}

export interface IValueIfStatement<T, R> {
  if: IValueCondition<T>
  then: R
}

export type TValueOperator =
  | '='
  | '!='
  | '>='
  | '>'
  | '<'
  | '<='
  | 'isBetween'
  | 'contains'
  | 'matches'

export interface IValueCondition<T> {
  op: TValueOperator
  value: T[]
}

export class ValueMap<T, R> {
  protected _ifthens: {
    if: ValueCondition<T>
    then: R
  }[]

  public static from<T, R>(map: IValueMap<T, R>) {
    return new ValueMap<T, R>(
      map.ifthens,
      map.else,
      map.name,
      map.description,
      map.type
    )
  }
  constructor(
    public ifthens: IValueIfStatement<T, R>[],
    protected elseVal?: R,
    public name?: string,
    public description?: string,
    public type?: string
  ) {
    this._ifthens = ifthens.map(item => ({
      if: ValueCondition.from(item.if),
      then: item.then,
    }))
    if (!type) {
      this.type = typeof elseVal
    }
  }

  map(val: T): R {
    const matchIdx = this._ifthens.findIndex(item => item.if.test(val))
    if (matchIdx > -1) {
      return this._ifthens[matchIdx].then
    } else {
      return this.elseVal
    }
  }

  public toJSON(): IValueMap<T, R> {
    return {
      name: this.name,
      description: this.description,
      ifthens: this._ifthens.map(ifthen => ({
        if: ifthen.if.toJSON(),
        then: ifthen.then,
      })),
      else: this.elseVal,
      type: this.type,
    }
  }
}

export class ValueCondition<T> {
  protected _testFn: (val: T) => boolean

  public get type(): string {
    return typeof this._values[0]
  }

  protected _values: T[]

  public static getParamCount(op: TValueOperator): number {
    switch (op) {
      case 'isBetween':
        return 2
      default:
        return 1
    }
  }

  public static from<T>(ifstat: IValueCondition<T>) {
    return new ValueCondition(ifstat.op, ...ifstat.value)
  }

  constructor(protected op: TValueOperator, ...compValues: T[]) {
    this._values = compValues

    this.setOp(op)
  }

  public setOp(anOp: TValueOperator) {
    if (ValueCondition.getParamCount(anOp) !== this._values.length) {
      throw new Error(
        `please supply ${ValueCondition.getParamCount(
          anOp
        )} parameters for operator '${anOp}'`
      )
    }
    switch (anOp) {
      case '=':
        this._testFn = (val: T) => val === this._values[0]
        break
      case '!=':
        this._testFn = (val: T) => val !== this._values[0]
        break
      case '>=':
        this._testFn = (val: T) => val >= this._values[0]
        break
      case '>':
        this._testFn = (val: T) => val > this._values[0]
        break
      case '<':
        this._testFn = (val: T) => val < this._values[0]
        break
      case '<=':
        this._testFn = (val: T) => val <= this._values[0]
        break
      case 'isBetween':
        this._testFn = (val: T) =>
          val >= this._values[0] && val < this._values[1]
        break
      case 'contains':
        this._testFn = (val: T) => {
          const value: string = val.toString()
          const compValue: string = this._values[0].toString()
          return value.indexOf(compValue) > -1
        }
        break
      case 'matches':
        this._testFn = (val: T) => {
          const value: string = val.toString()
          return new RegExp(this._values[0].toString()).test(value)
        }
        break

      /* istanbul ignore next*/
      default:
        throw new Error(`${anOp} is not a valid operator`)
    }
  }

  public test(value: T) {
    return this._testFn(value)
  }

  public toJSON(): IValueCondition<T> {
    return {
      op: this.op,
      value: this._values,
    }
  }
}
