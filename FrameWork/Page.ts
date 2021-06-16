import { IUserEventEmitter } from './interfaces'

export class Page {
    parent: HTMLElement
    eventEmitter: IUserEventEmitter
    name: string

    //класс страница получает корневой элемент и создает для каждого компанента родительский
    constructor(name: string) {
        this.name = name
    }

    setParametrs(parent: HTMLElement, eventEmitter: IUserEventEmitter) {
        this.parent = parent
        this.eventEmitter = eventEmitter
    }
    componentInit(componentList) {
        for (let i = 0; i < componentList.length; i++) {
            componentList[i].setParametrs(
                this.eventEmitter,
                this.parent,
                `${this.name}-${i}`,
                i
            )
            componentList[i].init()
        }
    }

    createComponents() {
        throw new Error('Components on page must be initialized')
    }
}
