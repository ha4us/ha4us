import * as Debug from 'debug'

const debug = Debug('ha4us:di')
import 'reflect-metadata'

import {
    asClass,
    asFunction,
    asValue,
    createContainer,
    InjectionMode,
    AwilixContainer,
} from 'awilix'

/*function getArgs(func) {
    // First match everything inside the function argument parens.
    const args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1]

    // Split the arguments string into an array comma delimited.
    return args
        .split(',')
        .map(function(arg) {
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, '').trim()
        })
        .filter(function(arg) {
            // Ensure no undefined values are added.
            return arg
        })
}*/

export type ServiceConstructor<T> = new (...args: any[]) => T

export type FactoryFunction<T> = (...args: any[]) => T

export class DIContainer {
    protected static _instance: DIContainer

    protected _container: AwilixContainer

    static getContainer(): DIContainer {
        DIContainer._instance = DIContainer._instance || new DIContainer()
        return DIContainer._instance
    }

    public get cradle() {
        return this._container.cradle
    }

    constructor() {
        if (DIContainer._instance) {
            throw new Error(
                'singleton - please user DIContainer.getContainer()'
            )
        }

        this._container = createContainer({
            injectionMode: InjectionMode.CLASSIC,
        })
    }

    public destroy() {
        this._container.dispose()
        DIContainer._instance = undefined
    }

    public registerValue<T>(tag: string | symbol, value: T) {
        debug('registerValue', tag, value)
        this._container.register(tag, asValue(value))
    }

    public registerFactory<T>(
        tag: string | symbol,
        factory: FactoryFunction<T>
    ) {
        debug('registerFactory', tag, typeof factory)

        this._container.register(tag, asFunction(factory).singleton())
    }

    public registerService<T extends object>(
        tag: string | symbol,
        Class: ServiceConstructor<T>
    ) {
        debug('registerClass', Class, typeof Class)
        this._container.register(tag, asClass(Class).singleton())
    }

    public resolve<T>(tag: string | symbol): T {
        return this._container.resolve(tag)
    }
}

/*

export function inject(name: string) {
    function inject(target: any, key: string, index: number) {
        debug('INJECT', target, key, index, name)
    }

    return inject
}

export function service(name: string) {
    function classDecorator<T extends { new (...args: any[]): {} }>(
        constructor: T
    ) {
        debug('Decorating service', constructor.name, name)
        debug(Reflect.getOwnMetadataKeys(constructor))

        const types = Reflect.getOwnMetadata('design:paramtypes', constructor)
        // const types = Reflect.getOwnMetadata('design:paramtypes', constructor)
        debug(types)
        const s = types.map(a => `${a.name}:${a}`).join(',')
        // this._container.registerService(name, constructor)
        debug(`param types: ${s}`)

        return class extends constructor {
            newProperty = 'new property'
            hello = 'override'
        }
    }

    return classDecorator
}*/
