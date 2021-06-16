const fs = require('fs')
const extractComponents = require('./extractComponents')
const createVNode = require('./createVNode')
const createComponent = require('./createComponent')
const createPage = require('./createPage')

/*

	<!-- $# SecondArticle Component static-->
	<!-- /$# SubscribeForm Component -->
    атрибут static сделает компонент статичным и построит один раз синглтоном и будет отдавать клон ноды
    в ссылках надо указать отрибут 'data-link' который будет преобразован в  'data-link': 'true'
    1)CamelCase в названии компонентов(без тире)
    2)текст обернут в спан если есть другие дочерние компоненты
    3)мужду кавычками, равно и классом нет пробелов

 */
const settingsData = JSON.parse(fs.readFileSync('FWsettings.json', 'utf-8'))

const fileContent = fs.readFileSync(settingsData['template'], 'utf-8')
const fileContent = fs.readFileSync('input data/template.html', 'utf-8')

//массив для хранения компонентов
const componentsArray = extractComponents(fileContent)
const vNodes = componentsArray.map(createVNode)

vNodes.map((node, idx) => {
    fs.writeFileSync(`output data/${idx}Component.ts`, JSON.stringify(node))
})
settingsData.pages.forEach((page) => {
    let componentList = []
    //создание новых папок
    fs.mkdirSync(page.adress, { recursive: true })

    //наполнение папок файлами дефолтных страниц

    //создание папок для компонентов
    page.components.forEach((component) => {
        //создаем папку для компонента
        componentList.push(createComponent(page.adress, component, vNodes))
    })

    createPage(page.name, componentList, page.adress)
})
