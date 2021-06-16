const fs = require('fs')
const DefaultComponent = fs.readFileSync(
    'FrameWork/utils/scripts/vNodeExtractor/defaultFiles/DefaultComponent.txt',
    'utf-8'
)
const DefaultVNode = fs.readFileSync(
    'FrameWork/utils/scripts/vNodeExtractor/defaultFiles/DefaultVNode.txt',
    'utf-8'
)

module.exports = function createComponent(adress, name, vNodes) {
    let _adress = adress + '/' + name + 'Component'
    fs.mkdirSync(_adress, { recursive: true })

    //создание дефолтного класса
    const currentComponent = DefaultComponent.replace(
        'Component1',
        `${name}Component`
    )

    fs.writeFileSync(`${_adress}/${name}Component.ts`, currentComponent)
    for (let vNode of vNodes) {
        if (vNode.name && vNode.name.replace('Component ', '') == name) {
            let cloneVNode = JSON.parse(JSON.stringify(vNode))
            delete cloneVNode.name
            currentVNode = DefaultVNode + JSON.stringify(cloneVNode)

            fs.mkdirSync(_adress, { recursive: true })

            fs.writeFileSync(`${_adress}/initialVNode.ts`, currentVNode)
        }
    }
    return `${name}Component`
}
