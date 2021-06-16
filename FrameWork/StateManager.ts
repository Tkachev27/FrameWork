export class StateManager {
    static setToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data))
    }
    static getDataFromStorage(key) {
        return JSON.parse(localStorage.getItem(key))
    }

    static removeFromStarage(key) {
        localStorage.removeItem(key)
    }

    static clearStorage() {
        localStorage.clear()
    }
}
