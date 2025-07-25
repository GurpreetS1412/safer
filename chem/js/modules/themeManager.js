export class ThemeManager {
  constructor() {
    this.themes = ["auto", "light", "dark", "amoled"]
    this.currentTheme = localStorage.getItem("theme") || "auto"
    this.systemTheme = this.getSystemTheme()
    this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  }

  init() {
    this.applyTheme(this.currentTheme)
    this.setupThemeToggle()
    this.setupSystemThemeListener()
  }

  getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }

  setupSystemThemeListener() {
    this.mediaQuery.addEventListener("change", (e) => {
      this.systemTheme = e.matches ? "dark" : "light"
      if (this.currentTheme === "auto") {
        this.applyTheme("auto")
      }
    })
  }

  setupThemeToggle() {
    const themeToggle = document.getElementById("themeToggle")
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        this.cycleTheme()
      })
    }
  }

  cycleTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme)
    const nextIndex = (currentIndex + 1) % this.themes.length
    this.currentTheme = this.themes[nextIndex]
    this.applyTheme(this.currentTheme)
    localStorage.setItem("theme", this.currentTheme)
  }

  applyTheme(theme) {
    let actualTheme = theme

    if (theme === "auto") {
      actualTheme = this.systemTheme
    }

    document.documentElement.setAttribute("data-theme", actualTheme)

    const themeIcon = document.querySelector(".theme-icon")
    if (themeIcon) {
      this.updateThemeIcon(theme, themeIcon)
    }

    this.updateThemeTooltip(theme)
  }

  updateThemeIcon(theme, iconElement) {
    const icons = {
      auto: "fas fa-circle-half-stroke",
      light: "fas fa-sun",
      dark: "fas fa-moon",
      amoled: "fas fa-mobile-alt",
    }

    iconElement.className = `${icons[theme]} theme-icon`
  }

  updateThemeTooltip(theme) {
    const themeToggle = document.getElementById("themeToggle")
    if (themeToggle) {
      const tooltips = {
        auto: "Auto (System)",
        light: "Light Theme",
        dark: "Dark Theme",
        amoled: "AMOLED Theme",
      }
      themeToggle.title = tooltips[theme]
    }
  }

  getCurrentTheme() {
    return this.currentTheme
  }

  getActualTheme() {
    return this.currentTheme === "auto" ? this.systemTheme : this.currentTheme
  }
}
