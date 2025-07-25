export class DataManager {
  constructor(dataPath) {
    this.dataPath = dataPath
  }

  async loadData() {
    try {
      const response = await fetch(this.dataPath)
      if (!response.ok) {
        if (response.status === 404) {
          return []
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.warn(`Could not load data from ${this.dataPath}:`, error)
      return []
    }
  }

  async saveData(data) {
    try {
      const key = this.dataPath.replace("data/", "").replace(".json", "")
      localStorage.setItem(key, JSON.stringify(data))
      console.log(`Data saved to localStorage with key: ${key}`)
    } catch (error) {
      console.error("Error saving data:", error)
      throw error
    }
  }

  async loadFromStorage() {
    try {
      const key = this.dataPath.replace("data/", "").replace(".json", "")
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn("Could not load from localStorage:", error)
      return []
    }
  }
}
