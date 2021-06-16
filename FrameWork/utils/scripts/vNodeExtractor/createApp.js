const fs = require('fs')
const extractComponents = require('./extractComponents')
const createVNode = require('./createVNode')
const createComponent = require('./createComponent')
const createPage = require('./createPage')
const DefaultHTML = fs.readFileSync(
    'FrameWork/utils/scripts/vNodeExtractor/defaultFiles/DefaultHTML.txt',
    'utf-8'
)
const DefaultIndexTS = fs.readFileSync(
    'FrameWork/utils/scripts/vNodeExtractor/defaultFiles/DefaultIndexTS.txt',
    'utf-8'
)
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

const HTMLadress = 'src/HTML'
const HTMLcontent = DefaultHTML
const SCSSadress = 'src/SCSS'
const TypeScriptsadress = 'src/TypeScripts'
fs.mkdirSync(HTMLadress, { recursive: true })
fs.mkdirSync(SCSSadress, { recursive: true })
fs.mkdirSync(TypeScriptsadress, { recursive: true })
fs.writeFileSync(`${HTMLadress}/template.html`, HTMLcontent)
if (settingsData.styles) {
    const SCSScontent = fs.readFileSync(settingsData.styles, 'utf-8')
    fs.writeFileSync(`${SCSSadress}/index.scss`, SCSScontent)
} else {
    fs.writeFileSync(`${SCSSadress}/index.scss`, '')
}

//массив для хранения компонентов
const componentsArray = extractComponents(fileContent)
const vNodes = componentsArray.map(createVNode)

//создать файловую систему из сохраненных json для страницы и компонента и скрипты для из удаления и добавить нотацию в хтмл для извлечения страниц
//файл настроек в нем указываем какие компоненты на каких страницах и желаемую файловую систему

//создание компонента navigation
createComponent(
    settingsData.navigation.adress,
    settingsData.navigation.Component,
    vNodes
)
//создаем папку для компонента

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

let indexTScontent = DefaultIndexTS.replace(
    'IMPORT_STYLES',
    'import "../SCSS/index.scss"\n'
)
indexTScontent = indexTScontent.replace(
    'IMPORT_NAVIGATION',
    `import { ${settingsData.navigation.Component}Component } from "./${settingsData.navigation.Component}Component/${settingsData.navigation.Component}Component"`
)
let importPAGES = ''
let createPAGES = ''
let addLinks = ''
settingsData.pages.forEach((page) => {
    importPAGES += `import { ${page.name}Page } from "./${page.name}Page/${page.name}Page"\n`
    createPAGES += `const ${page.name} = new  ${page.name}Page('${page.name}')\n`
    addLinks += `{ path: '${page.link}', page: ${page.name} }, \n`
})

indexTScontent = indexTScontent.replace('IMPORT_PAGES', importPAGES)
indexTScontent = indexTScontent.replace('CREATE_PAGES', createPAGES)
indexTScontent = indexTScontent.replace(' LINKS', addLinks)

if (settingsData.navigation) {
    let createNavigationComponent = `const navigation = new ${settingsData.navigation.Component}Component(true)\n`

    indexTScontent = indexTScontent.replace(
        'CREATE_NAVIGATION',
        createNavigationComponent
    )
} else {
    indexTScontent = indexTScontent.replace('CREATE_NAVIGATION', '')
}
fs.writeFileSync(`${TypeScriptsadress}/index.ts`, indexTScontent)
