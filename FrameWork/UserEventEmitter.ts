import { IUserEventEmitter } from './interfaces'

export class UserEventEmitter implements IUserEventEmitter {
    listeners: { [key: string]: any }

    constructor() {
        this.listeners = {}
    }

    emit(eventName: string, ...args: any) {
        if (!Array.isArray(this.listeners[eventName])) {
            return false
        }
        this.listeners[eventName].forEach((lisner: any) => {
            lisner(...args)
        })
        return true
    }

    subscribe(eventName: string, func: any) {
        this.listeners[eventName] = this.listeners[eventName] || []
        this.listeners[eventName].push(func)
    }
}
