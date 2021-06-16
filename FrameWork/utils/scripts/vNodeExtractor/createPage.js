const fs = require('fs')
const DefaultPage = fs.readFileSync(
    'FrameWork/utils/scripts/vNodeExtractor/defaultFiles/DefaultPage.txt',
    'utf-8'
)

module.exports = function createPage(name, components, adress) {
    let imports = ''
    let creations = ''
    components.forEach((component) => {
        imports += `import { ${component} } from "./${component}/${component}"\n`
        creations += `this.componentList.push(new ${component}(true))\n`
    })
    let currentPage = DefaultPage.replace('Page1', `${name}Page`)
    currentPage = currentPage.replace('IMPORT', `${imports}`)
    currentPage = currentPage.replace('CREATIONS', `${creations}`)

    fs.writeFileSync(`${adress}/${name}Page.ts`, currentPage)
}
