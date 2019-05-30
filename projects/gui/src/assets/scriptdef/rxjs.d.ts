/**
 * A representation of any set of values over any amount of time. This is the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
declare class Subscription implements SubscriptionLike {
  /**
   * @param {function(): void} [unsubscribe] A function describing how to
   * perform the disposal of resources when the `unsubscribe` method is called.
   */
  constructor(unsubscribe?: () => void)
  /** @nocollapse */
  static EMPTY: Subscription
  /**
   * A flag to indicate whether this Subscription has already been unsubscribed.
   * @type {boolean}
   */
  closed: boolean
  /** @internal */
  protected _parent: Subscription
  /** @internal */
  protected _parents: Subscription[]
  /** @internal */
  private _subscriptions
  /** @internal */
  private _addParent
  /**
   * Disposes the resources held by the subscription. May, for instance, cancel
   * an ongoing Observable execution or cancel any other type of work that
   * started when the Subscription was created.
   * @return {void}
   */
  unsubscribe(): void
  /**
   * Adds a tear down to be called during the unsubscribe() of this
   * Subscription. Can also be used to add a child subscription.
   *
   * If the tear down being added is a subscription that is already
   * unsubscribed, is the same reference `add` is being called on, or is
   * `Subscription.EMPTY`, it will not be added.
   *
   * If this subscription is already in an `closed` state, the passed
   * tear down logic will be executed immediately.
   *
   * When a parent subscription is unsubscribed, any child subscriptions that were added to it are also unsubscribed.
   *
   * @param {TeardownLogic} teardown The additional logic to execute on
   * teardown.
   * @return {Subscription} Returns the Subscription used or created to be
   * added to the inner subscriptions list. This Subscription can be used with
   * `remove()` to remove the passed teardown logic from the inner subscriptions
   * list.
   */
  add(teardown: TeardownLogic): Subscription
  /**
   * Removes a Subscription from the internal list of subscriptions that will
   * unsubscribe during the unsubscribe process of this Subscription.
   * @param {Subscription} subscription The subscription to remove.
   * @return {void}
   */
  remove(subscription: Subscription): void
}

interface Unsubscribable {
  unsubscribe(): void
}
declare type TeardownLogic = Unsubscribable | Function | void
interface SubscriptionLike extends Unsubscribable {
  readonly closed: boolean
  unsubscribe(): void
}
declare type SubscribableOrPromise<T> =
  | Subscribable<T>
  | Subscribable<never>
  | PromiseLike<T>
  | InteropObservable<T>
/** OBSERVABLE INTERFACES */
interface Subscribable<T> {
  subscribe(observer?: PartialObserver<T>): Unsubscribable
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(
    next: null | undefined,
    error: null | undefined,
    complete: () => void
  ): Unsubscribable
  /** @deprecated Use an observer instead of an error callback */
  subscribe(
    next: null | undefined,
    error: (error: any) => void,
    complete?: () => void
  ): Unsubscribable
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(
    next: (value: T) => void,
    error: null | undefined,
    complete: () => void
  ): Unsubscribable
  subscribe(
    next?: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void
  ): Unsubscribable
}
declare type ObservableInput<T> =
  | SubscribableOrPromise<T>
  | ArrayLike<T>
  | Iterable<T>
/** @deprecated use {@link InteropObservable } */
declare type ObservableLike<T> = InteropObservable<T>
declare interface InteropObservable<T> {
  [Symbol.observable]: () => Subscribable<T>
}
/** OBSERVER INTERFACES */
interface NextObserver<T> {
  closed?: boolean
  next: (value: T) => void
  error?: (err: any) => void
  complete?: () => void
}
interface ErrorObserver<T> {
  closed?: boolean
  next?: (value: T) => void
  error: (err: any) => void
  complete?: () => void
}
interface CompletionObserver<T> {
  closed?: boolean
  next?: (value: T) => void
  error?: (err: any) => void
  complete: () => void
}
declare type PartialObserver<T> =
  | NextObserver<T>
  | ErrorObserver<T>
  | CompletionObserver<T>
interface Observer<T> {
  closed?: boolean
  next: (value: T) => void
  error: (err: any) => void
  complete: () => void
}
/** SCHEDULER INTERFACES */
interface SchedulerLike {
  now(): number
  schedule<T>(
    work: (this: SchedulerAction<T>, state?: T) => void,
    delay?: number,
    state?: T
  ): Subscription
}
interface SchedulerAction<T> extends Subscription {
  schedule(state?: T, delay?: number): Subscription
}
declare type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never

declare class Observable<T> implements Subscribable<T> {

  /**
   * @constructor
   * @param {Function} subscribe the function that is called when the Observable is
   * initially subscribed to. This function is given a Subscriber, to which new values
   * can be `next`ed, or an `error` method can be called to raise an error, or
   * `complete` can be called to notify of a successful completion.
   */
  constructor(
    subscribe?: (this: Observable<T>, subscriber: any) => TeardownLogic
  )
  /**
   * Creates a new cold Observable by calling the Observable constructor
   * @static true
   * @owner Observable
   * @method create
   * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
   * @return {Observable} a new cold observable
   * @nocollapse
   * @deprecated use new Observable() instead
   */
  static create: Function
  /** Internal implementation detail, do not use directly. */
  _isScalar: boolean
  /**
   * Creates a new Observable, with this Observable as the source, and the passed
   * operator defined as the new observable's operator.
   * @method lift
   * @param {Operator} operator the operator defining the operation to take on the observable
   * @return {Observable} a new observable with the Operator applied
   */

  subscribe(observer?: PartialObserver<T>): Subscription
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(
    next: null | undefined,
    error: null | undefined,
    complete: () => void
  ): Subscription
  /** @deprecated Use an observer instead of an error callback */
  subscribe(
    next: null | undefined,
    error: (error: any) => void,
    complete?: () => void
  ): Subscription
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(
    next: (value: T) => void,
    error: null | undefined,
    complete: () => void
  ): Subscription
  subscribe(
    next?: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void
  ): Subscription

  /**
   * @method forEach
   * @param {Function} next a handler for each value emitted by the observable
   * @param {PromiseConstructor} [promiseCtor] a constructor function used to instantiate the Promise
   * @return {Promise} a promise that either resolves on observable completion or
   *  rejects with the handled error
   */
  forEach(
    next: (value: T) => void,
    promiseCtor?: PromiseConstructorLike
  ): Promise<void>
  /** @internal This is an internal implementation detail, do not use. */

  /**
   * @nocollapse
   * @deprecated In favor of iif creation function: import { iif } from 'rxjs';
   */

  /**
   * @nocollapse
   * @deprecated In favor of throwError creation function: import { throwError } from 'rxjs';
   */

  pipe(): Observable<T>

  toPromise<T>(this: Observable<T>): Promise<T>
  toPromise<T>(this: Observable<T>, PromiseCtor: typeof Promise): Promise<T>
  toPromise<T>(
    this: Observable<T>,
    PromiseCtor: PromiseConstructorLike
  ): Promise<T>
}
