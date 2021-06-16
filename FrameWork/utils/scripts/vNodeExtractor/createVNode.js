module.exports = function createVNode(component) {
    //создаем корневой элемент для компонента
    let VNode = {
        tag: '',
        attributes: {},
        children: [],
        name: component.componentName,
    }

    //создае переменную для хранения содержимого компонента
    const node = component.componentContent
    //создаем массив для тегов
    let tags = []
    //создаем массив для текста

    let i = 0
    //пробегаем по всему содержимому компонента
    while (i < node.length) {
        //определяем начало тега
        const start = node.indexOf('<', i)

        //если есть начало тега
        if (start != -1) {
            //ищем конец тега
            let end = node.indexOf('>', i)

            //в параметтрах храним строку с атрибутами
            let params = node.slice(start + 1, end)

            //в переменной tag храниться названия тега
            let tag = node.slice(
                start + 1,
                node.indexOf(' ', start) != -1 && node.indexOf(' ', start) < end
                    ? node.indexOf(' ', start)
                    : end
            )

            //в параметрах удаляем сам тег и пробелы по краям строки атрибутов
            params = params.replace(tag, '').trim()

            //проверяем тег открывающий или закрывающий
            const open = node[start + 1] != '/'
            //если тег закрывающий
            if (!open) {
                //удаляем закрывающий элемент
                tag = tag.slice(1, tag.length)
            }
            //добавляем тег в массив тегов
            tags.push({
                start,
                end,
                children: [],
                tag,
                open,
                params,
                attributes: {},
            })
            //увеличиваем итератор на конец тега + 1
            i = end + 1
        } else {
            //если начала тегов нет то окончание цикла
            break
        }
    }

    tags.map((tag, idx) => {
        //проверяем есть ли текст после открытого тега, если есть то добавляем текст в дочерний элемент
        if (tags[idx + 1] && tag.open) {
            if (/[a-z]/.exec(node.slice(tag.end + 1, tags[idx + 1].start)))
                tag.children = node.slice(tag.end + 1, tags[idx + 1].start)
        }
        //преобразовываем params в обьект атрибутов
        //если есть буквы в атрибутах
        let i = 0
        while (/[a-z]/.exec(tag.params.slice(i, tag.params.length))) {
            //индекс первой буквы
            const textStart =
                /[a-z]/.exec(tag.params.slice(i, tag.params.length)).index + i
            const equalityPosition = tag.params.indexOf('=', textStart)
            if (equalityPosition == -1) {
                //если нет знака =, а затем проверка если есть пробел
                const textEnd =
                    tag.params.indexOf(' ', textStart) != -1
                        ? tag.params.indexOf(' ', textStart)
                        : tag.params.length
                tag.attributes[tag.params.slice(textStart, textEnd)] = ''

                if (textEnd == tag.params.length) break
                else i = textEnd + 1
            } else {
                //есть знак равенства
                if (tag.params.indexOf(' ', textStart) == -1) {
                    //если больше нет пробелов и есть знак равенства то один атрибут
                    const textEnd = equalityPosition
                    const openQuotesIndex = tag.params.indexOf('"', i)
                    const closeQuotesIndex = tag.params.indexOf(
                        '"',
                        openQuotesIndex + 1
                    )
                    tag.attributes[
                        tag.params.slice(textStart, textEnd)
                    ] = tag.params.slice(openQuotesIndex + 1, closeQuotesIndex)
                    i = closeQuotesIndex + 1
                } else {
                    //если есть пробелы и знак равенства
                    if (equalityPosition < tag.params.indexOf(' ', textStart)) {
                        const textEnd = equalityPosition
                        const openQuotesIndex = tag.params.indexOf('"', i)
                        const closeQuotesIndex = tag.params.indexOf(
                            '"',
                            openQuotesIndex + 1
                        )
                        tag.attributes[
                            tag.params.slice(textStart, textEnd)
                        ] = tag.params.slice(
                            openQuotesIndex + 1,
                            closeQuotesIndex
                        )

                        i = closeQuotesIndex + 1
                    } else {
                        const textEnd = tag.params.indexOf(' ', textStart)
                        tag.attributes[tag.params.slice(textStart, textEnd)] =
                            ''
                        i = textEnd + 1
                    }
                }
            }
        }
        delete tag.params
    })

    //назначаем корневому элементу тег и атрибуты
    VNode.tag = tags[0].tag
    VNode.attributes = tags[0].attributes

    //если есть дочерние элементы
    if (tags.length > 2) {
        //проходим по всем тегам
        for (let i = 1; i < tags.length - 1; i++) {
            //если тег закрывающий
            if (!tags[i].open) {
                //проверяем закрывает ли он предыдущий тег
                if (tags[i].tag == tags[i - 1].tag) {
                    //если закрывает, то удаляем рабочие поля тега
                    delete tags[i - 1].start
                    delete tags[i - 1].end
                    delete tags[i - 1].open
                    //добавляем в родительский элемент открывающий тег
                    tags[i - 2].children.push(tags[i - 1])
                    //удаляем из массива тегов обработанные теги
                    tags.splice(i - 1, 2)
                    //возвращаем итератор согласно удаленным значениям
                    i = i - 2
                } else if (
                    tags[i - 1].tag == 'img' ||
                    tags[i - 1].tag == 'input' ||
                    tags[i - 1].tag == 'br'
                ) {
                    //если теги самозакрывающиеся
                    delete tags[i - 1].start
                    delete tags[i - 1].end
                    delete tags[i - 1].open
                    delete tags[i - 2].start
                    delete tags[i - 2].end
                    delete tags[i - 2].open
                    tags[i - 2].children.push(tags[i - 1])
                    tags[i - 3].children.push(tags[i - 2])
                    tags.splice(i - 2, 3)
                    i = i - 3
                }
            }
        }
    }
    //добавляем дочерние элементы корневому
    VNode.children = tags[0].children

    return VNode
}
