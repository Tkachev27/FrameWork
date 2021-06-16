import { IUserEventEmitter, VNode } from './interfaces'
import { updateAttributes } from './utils/VNode/updateAttributes'

export class Component {
    parent: HTMLElement
    prevNode: VNode
    dynamic: boolean
    userEventEmitter: IUserEventEmitter
    name: string
    componentPlace: number = 0

    constructor(dynamic: boolean = true) {
        this.dynamic = dynamic
    }

    patch(
        nextVnode: VNode,
        $element: any = this.prevNode.$element,
        prevVNode: VNode = this.prevNode
    ) {
        if (this.dynamic) {
            if (!nextVnode.attributes['data-component-id']) {
                nextVnode['data-component-id'] = (
                    Math.floor(Math.random() * (100000000 - 1)) + 1
                ).toString()
            }

            if (
                prevVNode.attributes['data-component-id'] !=
                nextVnode.attributes['data-component-id']
            ) {
                this.install(nextVnode, $element.parentNode)
                this.unInstall($element)
            } else {
                updateAttributes(nextVnode, $element, prevVNode)

                //если значение дочернего элемента стало либо строкой либо числом, если значение не равно значению предыдущего состояния то вставляем новое значение'
                if (
                    typeof nextVnode.children === 'string' ||
                    typeof nextVnode.children === 'number'
                ) {
                    if (prevVNode.children !== nextVnode.children) {
                        $element.textContent = nextVnode.children.toString()
                    }
                } else {
                    //работаем со случаем, когда новое значение дочерних элементов не строка

                    //если раньше была строка а стал массив обьектов то просто отрисовываем обьект вместо строки
                    if (
                        typeof prevVNode.children === 'string' ||
                        typeof prevVNode.children === 'number'
                    ) {
                        $element.textContent = ''
                        for (let item of nextVnode.children) {
                            this.install(item, $element)
                        }
                    } else {
                        //если раньше был массив обьектов и он изменился
                        //с циклом можно управлять с рекурсией

                        //проверяю кто удален, был в старом но нет в новом

                        for (let i = 0; i < prevVNode.children.length; i++) {
                            let idx = nextVnode.children.findIndex(
                                (el) =>
                                    el.attributes['data-component-id'] ==
                                    prevVNode.children[i].attributes[
                                        'data-component-id'
                                    ]
                            )

                            if (idx == -1) {
                                prevVNode.children.splice(i, 1)
                                this.unInstall($element.children[i])

                                i = i - 1
                            }
                        }
                        let updateChildID = []

                        for (let i = 0; i < nextVnode.children.length; i++) {
                            let indx = prevVNode.children.findIndex(
                                (el) =>
                                    el.attributes['data-component-id'] ==
                                    nextVnode.children[i].attributes[
                                        'data-component-id'
                                    ]
                            )

                            let duplicate =
                                updateChildID.indexOf(
                                    nextVnode.children[i].attributes[
                                        'data-component-id'
                                    ]
                                ) != -1

                            if (indx != -1 && indx == i && !duplicate) {
                                updateChildID.push(
                                    nextVnode.children[i].attributes[
                                        'data-component-id'
                                    ]
                                )

                                //если в исходном массиве есть элемент по индексу i  и его id совподает с измененным то отправляем на патч
                                this.patch(
                                    nextVnode.children[i],
                                    $element.children[i],
                                    prevVNode.children[i]
                                )
                            } else if (indx != -1 && indx != i && !duplicate) {
                                //переставляем элемент и обновляем

                                let tempNode =
                                    $element.children[indx].cloneNode(true)
                                this.unInstall($element.children[indx])
                                $element.insertBefore(
                                    tempNode,
                                    $element.children[i]
                                )
                                let tempEl = prevVNode.children[indx]
                                prevVNode.children.splice(indx, 1)
                                prevVNode.children.splice(i, 0, tempEl)
                                updateChildID.push(
                                    nextVnode.children[i].attributes[
                                        'data-component-id'
                                    ]
                                )
                                this.patch(
                                    nextVnode.children[i],
                                    $element.children[i],
                                    prevVNode.children[i]
                                )
                            } else if (indx == -1 || duplicate) {
                                //переставляем элемент и обновляем

                                if (
                                    nextVnode.children[
                                        i
                                    ].attributes.hasOwnProperty(
                                        'data-component-id'
                                    )
                                )
                                    delete nextVnode.children[i].attributes[
                                        'data-component-id'
                                    ]

                                this.install(nextVnode.children[i], $element, i)

                                prevVNode.children.splice(
                                    i,
                                    0,
                                    nextVnode.children[i]
                                )
                                updateChildID.push(
                                    nextVnode.children[i].attributes[
                                        'data-component-id'
                                    ]
                                )
                            }
                        }
                    }
                }
            }
            if ($element.parentNode == this.parent) {
                this.prevNode = JSON.parse(JSON.stringify(nextVnode))
                this.prevNode.$element = $element
            }
        } else {
            return () => {
                throw new Error('Component is not dynamic')
            }
        }
    }

    install(
        node: VNode,
        container: any = this.parent,
        place: number = this.componentPlace
    ) {
        //Создаем новый корневой элемент с указанным тегом
        ////console.log(this.parentId)

        const element: HTMLElement = document.createElement(node.tag)

        //При первой установке проверяем есть ли дети и есть ли у них атрибут id
        //ели найдется корневой ребенок то проставляем атрибут id всем родителям

        //Устанавливаем переданные атрибуты
        for (const key in node.attributes) {
            element.setAttribute(key, node.attributes[key])
        }

        if (this.dynamic) {
            let id = (
                Math.floor(Math.random() * (100000000 - 1)) + 1
            ).toString()
            element.setAttribute('data-component-id', id)
            node.attributes['data-component-id'] = id
        }

        //Если дочерний элемент является строкой то вставляем текст в эемент
        if (
            typeof node.children === 'string' ||
            typeof node.children === 'number'
        ) {
            element.textContent = node.children.toString()
        }
        //Иначе рекурсивно проходим по дочерним элементам в качестве корневых
        else {
            node.children.forEach((child) => {
                this.install(child, element, null)
            })
        }

        //Вставляем полученный элемент в переданный контейнер
        if (place) {
            container.insertBefore(element, container.children[place])
        } else {
            container.appendChild(element)
        }

        //Создаем поле $element у корневого элемента и записываем туда
        node.$element = element
        // return node
        if (container == this.parent) {
            this.prevNode = JSON.parse(JSON.stringify(node))
            this.prevNode.$element = node.$element
        }
    }

    unInstall($element) {
        $element.parentNode.removeChild($element)
        //this.parent.textContent = ''
    }
    setParametrs(
        eventEmitter: IUserEventEmitter,
        parent: HTMLElement,
        name: string,
        place: number
    ) {
        this.parent = parent
        this.userEventEmitter = eventEmitter
        this.name = name
        this.componentPlace = place
    }

    init() {
        throw new Error('Component must be initialized')
    }
}
