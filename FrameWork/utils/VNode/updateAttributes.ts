import { VNode } from '../../interfaces'

export function updateAttributes(nextVnode: VNode, $element, prevNode: VNode) {
    if (Object.keys(nextVnode.attributes).length == 1) {
        //console.log('1 атрибут у нового состояния')
        for (let i = $element.attributes.length; i-- > 1; )
            if ('data-component-id' != $element.attributes[i])
                $element.removeAttributeNode($element.attributes[i])
    } else if (Object.keys(prevNode.attributes).length == 1) {
        //console.log('1 атрибут у предыдущего состояния')
        for (const key in nextVnode.attributes) {
            $element.setAttribute(key, nextVnode.attributes[key])
        }
    } else {
        //console.log('атрибутов у нового и предыдущего состояния несколько')
        for (let attributeNameNext in nextVnode.attributes) {
            //в новой ноде хранятся новые атрибуты, обьект со старыми храниться в старой ноде, нужно произвести действия с элементами в новой ноде

            //если атрибут присутствует в старой ноде то проверяем его значение на совпадение
            if (attributeNameNext != 'data-component-id') {
                if (prevNode.attributes[attributeNameNext]) {
                    //установка атрибутов с измененным значением

                    if (
                        prevNode.attributes[attributeNameNext] !=
                        nextVnode.attributes[attributeNameNext]
                    ) {
                        //console.log(
                        //     `у предыдущего состояния значение  атрибута ${attributeNameNext}  не равно значению нового ${prevNode.attributes[attributeNameNext]} , ${nextVnode.attributes[attributeNameNext]}`
                        // )

                        $element.setAttribute(
                            attributeNameNext,
                            nextVnode.attributes[attributeNameNext]
                        )
                    }
                } else {
                    //добавление нового атрибута, которого нет в старой ноде

                    $element.setAttribute(
                        attributeNameNext,
                        nextVnode.attributes[attributeNameNext]
                    )
                }
            }
        }

        for (let attributeNamePrev in prevNode.attributes) {
            if (attributeNamePrev != 'data-component-id') {
                //если элемент был в старой ноде но нет в новой то удаляем атрибут
                if (!nextVnode.attributes[attributeNamePrev]) {
                    $element.removeAttribute(attributeNamePrev)
                }
            }
        }
    }

    prevNode.attributes = nextVnode.attributes
}
