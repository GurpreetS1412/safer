import { DataManager } from "./modules/dataManager.js"
import { UIManager } from "./modules/uiManager.js"
import { ThemeManager } from "./modules/themeManager.js"
import { LinkingManager } from "./modules/linkingManager.js"
import { ModalManager } from "./modules/modalManager.js"

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x200?text=No+Image"

class ProductsApp {
  constructor() {
    this.dataManager = new DataManager("data/products.json")
    this.uiManager = new UIManager()
    this.themeManager = new ThemeManager()
    this.products = []
    this.filteredProducts = []
    this.linkingManager = null
    this.modalManager = new ModalManager()

    this.init()
  }

  async init() {
    await this.loadData()
    const chemicalsData = await fetch("data/chemicals.json").then(r => r.json()).catch(() => [])
    this.linkingManager = new LinkingManager(chemicalsData, this.products)
    this.setupEventListeners()
    this.renderProducts()
    this.themeManager.init()
  }

  async loadData() {
    try {
      this.products = await this.dataManager.loadData()
      this.filteredProducts = [...this.products]
    } catch (error) {
      console.error("Error loading products:", error)
      this.products = []
      this.filteredProducts = []
    }
  }

  setupEventListeners() {
    const searchInput = document.getElementById("searchInput")
    const sortSelect = document.getElementById("sortSelect")
    const addBtn = document.getElementById("addProductBtn")
    const modal = document.getElementById("addModal")
    const closeBtn = document.getElementById("closeModal")
    const cancelBtn = document.getElementById("cancelBtn")
    const addProductBtn = document.getElementById("addBtn")

    searchInput.addEventListener("input", (e) => {
      this.filterProducts(e.target.value, sortSelect.value)
    })

    sortSelect.addEventListener("change", (e) => {
      this.filterProducts(searchInput.value, e.target.value)
    })

    addBtn.addEventListener("click", () => modal.classList.add("active"))

    const closeModal = () => {
      modal.classList.remove("active")
      document.getElementById("jsonInput").value = ""
    }

    closeBtn.addEventListener("click", closeModal)
    cancelBtn.addEventListener("click", closeModal)

    addProductBtn.addEventListener("click", () => this.addProduct())
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal()
    })
  }

  filterProducts(searchTerm, sortBy) {
    let filtered = [...this.products]
    const term = searchTerm.toLowerCase()

    if (term) {
      filtered = filtered.filter(product =>
        product.productName.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.productId.toLowerCase().includes(term)
      )
    }

    filtered.sort((a, b) => {
      if (sortBy === "productName") return a.productName.localeCompare(b.productName)
      if (sortBy === "category") return a.category.localeCompare(b.category)
      return 0
    })

    this.filteredProducts = filtered
    this.renderProducts()
  }

  renderProducts() {
    const grid = document.getElementById("productsGrid")
    const emptyState = document.getElementById("emptyState")
    const template = document.getElementById("productCardTemplate")

    grid.innerHTML = ""

    if (!this.filteredProducts.length) {
      emptyState.style.display = "block"
      return
    }

    emptyState.style.display = "none"

    this.filteredProducts.forEach((product) => {
      const card = template.content.cloneNode(true)

      const img = card.querySelector(".product-image")
      img.src = product.image?.trim() ? product.image : PLACEHOLDER_IMAGE
      img.alt = product.productName
      img.onerror = () => {
        img.src = PLACEHOLDER_IMAGE
      }

      card.querySelector(".product-name").textContent = product.productName
      card.querySelector(".product-category").textContent = product.category
      card.querySelector(".product-id-value").textContent = product.productId
      card.querySelector(".product-description").textContent = product.description

      const ingredientsList = card.querySelector(".ingredients-list")
      ingredientsList.textContent = Array.isArray(product.ingredients) ? product.ingredients.join(", ") : "Not specified"

      const safetyScore = this.linkingManager.calculateSafetyScore(product)
      const scoreColor = safetyScore >= 80 ? "var(--success)" : safetyScore >= 60 ? "var(--warning)" : "var(--error)"
      const safetySection = document.createElement("div")
      safetySection.className = "safety-score"
      safetySection.innerHTML = `
        <div class="detail-item">
          <strong>Safety Score:</strong>
          <span style="color: ${scoreColor}; font-weight: 600;">${safetyScore}/100</span>
        </div>
      `
      card.querySelector(".product-details").appendChild(safetySection)

      if (product.harmfulChemicals?.length) {
        const chemicalsSection = document.createElement("div")
        chemicalsSection.className = "harmful-chemicals"
        chemicalsSection.innerHTML = `
          <div class="detail-item">
            <strong>Harmful Chemicals:</strong>
            <div class="chemical-links">
              ${product.harmfulChemicals.map(chemical => `
                <span class="chemical-link" data-chemical-name="${chemical}">
                  <i class="fas fa-exclamation-triangle"></i> ${chemical}
                </span>`).join("")}
            </div>
          </div>
        `
        card.querySelector(".product-details").appendChild(chemicalsSection)

        chemicalsSection.querySelectorAll(".chemical-link").forEach((link) => {
          link.addEventListener("click", (e) => this.showChemicalModal(e.currentTarget.dataset.chemicalName))
        })
      }

      const alternatives = this.linkingManager.getAlternativeProducts(product.productId)
      if (alternatives.length) {
        const alternativesSection = document.createElement("div")
        alternativesSection.className = "alternatives"
        alternativesSection.innerHTML = `
          <div class="detail-item">
            <strong>Safer Alternatives:</strong>
            <div class="alternative-links">
              ${alternatives.slice(0, 3).map(alt => `
                <span class="alternative-link" data-product-id="${alt.productId}">
                  <i class="fas fa-leaf"></i> ${alt.productName}
                </span>`).join("")}
            </div>
          </div>
        `
        card.querySelector(".product-details").appendChild(alternativesSection)

        alternativesSection.querySelectorAll(".alternative-link").forEach(link => {
          link.addEventListener("click", (e) => this.showProductModal(e.currentTarget.dataset.productId))
        })
      }

      grid.appendChild(card)
    })
  }

  async addProduct() {
    const jsonInput = document.getElementById("jsonInput")
    const modal = document.getElementById("addModal")

    try {
      const productData = JSON.parse(jsonInput.value)

      const requiredFields = ["productId", "productName", "category", "description"]
      for (const field of requiredFields) {
        if (!productData[field]) throw new Error(`Missing required field: ${field}`)
      }

      productData.image = productData.image || ""
      productData.ingredients = productData.ingredients || []
      productData.isOrganic = productData.isOrganic || false

      this.products.push(productData)
      await this.dataManager.saveData(this.products)
      this.filteredProducts = [...this.products]
      this.renderProducts()

      modal.classList.remove("active")
      jsonInput.value = ""
      this.uiManager.showNotification("Product added successfully!", "success")
    } catch (error) {
      this.uiManager.showNotification(`Error adding product: ${error.message}`, "error")
    }
  }

  showChemicalModal(chemicalName) {
    const chemical = this.linkingManager.getChemicalByName(chemicalName)
    if (chemical) this.modalManager.showChemicalModal(chemical, this.linkingManager)
  }

  showProductModal(productId) {
    const product = this.linkingManager.getProductById(productId)
    if (product) this.modalManager.showProductModal(product, this.linkingManager)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ProductsApp()
})
