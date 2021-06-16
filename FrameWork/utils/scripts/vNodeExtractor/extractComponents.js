module.exports = function extractComponents(content) {
    let componentsArray = []

    //создаю итератор
    let i = 0

    //собираю массив компонентов
    while (i < content.length) {
        //начинаем поиск нового компонентас i-го значения
        const componentStart = content.indexOf('<!-- $#Component', i)
        //если нашли начало компонента по тексту то создаем компонент
        if (componentStart !== -1) {
            //индекс начала имени компонента (8 - расстояние от символов до названия)
            const componentNameStart = componentStart + 7

            //индекс конца названия компонента
            const componentNameEnd = content.indexOf('-->', componentStart)

            //извлекаем имя компонента
            const componentName = content.slice(
                componentNameStart,
                componentNameEnd - 1
            )

            //индекс начала контента компонента
            const componentContentStart = componentNameEnd + 3

            //индекс конца контента компонента
            const componentContentEnd = content.indexOf(
                '<!-- /$#',
                componentContentStart
            )

            //извлекаем содержание компонента

            //удаляем табуляцию и перенос на новую строку
            const reg = /[\t\n\r]/gi

            const componentContent = content
                .slice(componentContentStart, componentContentEnd)
                .replace(reg, '')

            componentsArray.push({ componentName, componentContent })

            i = componentContentEnd
        } else {
            break
        }
    }
    return componentsArray
}
