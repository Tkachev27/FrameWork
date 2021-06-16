export interface VNode {
    tag: string
    attributes: { [key: string]: string }
    $element?: HTMLElement | Node
    children: VNode[] | any
}

export interface IUserEventEmitter {
    listeners: { [key: string]: any }
    emit(eventName: string, ...args: any): boolean
    subscribe(eventName: string, func: any): any
}
