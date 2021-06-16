import { IUserEventEmitter } from './interfaces'
import { UserEventEmitter } from './UserEventEmitter'

export class Router {
    //доступные роуты со списком соответствующих страниц
    routes: Array<any> = []
    parent: HTMLElement
    emitter: IUserEventEmitter
    constructor(navigation, routes: Array<any>) {
        this.routes = routes
        this.emitter = new UserEventEmitter()
        navigation.setParametrs(this.emitter, document.body, 'nav')
        navigation.init()
        let parentElement: HTMLElement = document.createElement('div')
        parentElement.setAttribute('class', 'app')

        document.body.append(parentElement)

        this.parent = parentElement

        //инициализация компонента навигации и создание родителя для страниц

        //когда HTML загружен и обработан, DOM документа полностью построен и доступен, то начинаем слушать клики по ссылкам=
        document.addEventListener('DOMContentLoaded', () => {
            //Добавляем общего слушателя кликов и при клике на ссылку с атрибутом data-link добавляем в историю новое состояние
            document.body.addEventListener('click', (e: any) => {
                if (e.target.matches('[data-link]')) {
                    //предотвращаем действие по клику на ссылку по умолчанию
                    e.preventDefault()

                    //добавляем запись в историю браузера
                    history.pushState(null, null, e.target.href)

                    //запускаем обработку перехода
                    this.routeTransition()
                }
            })

            this.routeTransition()
        })
    }
    routeTransition() {
        //Проверка каждого роута на потенциальное совпадение с текущим положением
        const potentialMatches = this.routes.map((route) => {
            return {
                route: route,
                result: location.pathname.match(this.pathToRegex(route.path)),
            }
        })

        //Определяется роут у которого выявлено совпадение с текущей страницей
        let match = potentialMatches.find(
            (potentialMatch) => potentialMatch.result !== null
        )
        //если ничего не совпало то идет навигация на роут по умолчанию, обычно передается первым в масссив
        if (!match) {
            match = {
                route: this.routes[0],
                result: [location.pathname],
            }
        }

        //Общий родитель очищается и начинается отрисовка соответствующей страницы

        this.parent.textContent = ''

        let currentPage = match.route.page

        currentPage.setParametrs(this.parent, this.emitter)
        currentPage.createComponents()
        currentPage.componentInit()
    }

    addRoute(route: any) {
        this.routes.push(route)
    }

    removeRoute(route: any) {
        const idx = this.routes.findIndex((p) => p == route)
        if (idx != -1) this.routes.splice(idx, 1)
    }
    pathToRegex = (path) =>
        new RegExp(
            '^' + path.replace(/\//g, '\\/').replace(/:\w+/g, '(.+)') + '$'
        )
}
