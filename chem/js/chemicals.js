import { DataManager } from "./modules/dataManager.js"
import { UIManager } from "./modules/uiManager.js"
import { ThemeManager } from "./modules/themeManager.js"
import { LinkingManager } from "./modules/linkingManager.js"
import { ModalManager } from "./modules/modalManager.js"

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x200?text=No+Image"

class ChemicalsApp {
  constructor() {
    this.dataManager = new DataManager("data/chemicals.json")
    this.uiManager = new UIManager()
    this.themeManager = new ThemeManager()
    this.chemicals = []
    this.filteredChemicals = []
    this.linkingManager = null
    this.modalManager = new ModalManager()
    this.init()
  }

  async init() {
    await this.loadData()
    const productsData = await fetch("data/products.json").then(r => r.json()).catch(() => [])
    this.linkingManager = new LinkingManager(this.chemicals, productsData)
    this.setupEventListeners()
    this.renderChemicals()
    this.themeManager.init()
  }

  async loadData() {
    try {
      this.chemicals = await this.dataManager.loadData()
      this.filteredChemicals = [...this.chemicals]
    } catch (error) {
      console.error("Error loading chemicals:", error)
      this.chemicals = []
      this.filteredChemicals = []
    }
  }

  setupEventListeners() {
    const searchInput = document.getElementById("searchInput")
    const sortSelect = document.getElementById("sortSelect")
    const addBtn = document.getElementById("addChemicalBtn")
    const modal = document.getElementById("addModal")
    const closeBtn = document.getElementById("closeModal")
    const cancelBtn = document.getElementById("cancelBtn")
    const addChemicalBtn = document.getElementById("addBtn")

    searchInput.addEventListener("input", e => this.filterChemicals(e.target.value, sortSelect.value))
    sortSelect.addEventListener("change", e => this.filterChemicals(searchInput.value, e.target.value))
    addBtn.addEventListener("click", () => modal.classList.add("active"))

    const closeModal = () => {
      modal.classList.remove("active")
      document.getElementById("jsonInput").value = ""
    }

    closeBtn.addEventListener("click", closeModal)
    cancelBtn.addEventListener("click", closeModal)
    addChemicalBtn.addEventListener("click", () => this.addChemical())
    modal.addEventListener("click", e => { if (e.target === modal) closeModal() })
  }

  filterChemicals(searchTerm, sortBy) {
    let filtered = [...this.chemicals]
    const term = searchTerm.toLowerCase()

    if (term) {
      filtered = filtered.filter(chemical =>
        chemical.name.toLowerCase().includes(term) ||
        chemical.type.toLowerCase().includes(term) ||
        chemical.description.toLowerCase().includes(term)
      )
    }

    filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "type") return a.type.localeCompare(b.type)
      return 0
    })

    this.filteredChemicals = filtered
    this.renderChemicals()
  }

  renderChemicals() {
    const grid = document.getElementById("chemicalsGrid")
    const emptyState = document.getElementById("emptyState")
    const template = document.getElementById("chemicalCardTemplate")

    grid.innerHTML = ""

    if (!this.filteredChemicals.length) {
      emptyState.style.display = "block"
      return
    }

    emptyState.style.display = "none"

    this.filteredChemicals.forEach((chemical) => {
      const card = template.content.cloneNode(true)

      const img = card.querySelector(".chemical-image")
      img.src = chemical.image?.trim() ? chemical.image : PLACEHOLDER_IMAGE
      img.alt = chemical.name
      img.onerror = () => { img.src = PLACEHOLDER_IMAGE }

      card.querySelector(".chemical-name").textContent = chemical.name
      card.querySelector(".chemical-type").textContent = chemical.type
      card.querySelector(".chemical-description").textContent = chemical.description
      card.querySelector(".common-uses").textContent = chemical.commonUses
      card.querySelector(".regulatory-status").textContent = chemical.regulatoryStatus

      const statusToggle = card.querySelector(".status-toggle")
      statusToggle.innerHTML = chemical.preservative
        ? '<i class="fas fa-check-circle" style="color: var(--success);"></i>'
        : '<i class="fas fa-times-circle" style="color: var(--error);"></i>'

      const linkedProducts = this.linkingManager.getProductsWithChemical(chemical.name)
      if (linkedProducts.length) {
        const linkedSection = document.createElement("div")
        linkedSection.className = "linked-products"
        linkedSection.innerHTML = `
          <div class="detail-item">
            <strong>Found in Products:</strong>
            <div class="product-links">
              ${linkedProducts.map(product => `
                <span class="product-link" data-product-id="${product.productId}">
                  <i class="fas fa-external-link-alt"></i> ${product.productName}
                </span>`).join("")}
            </div>
          </div>
        `
        card.querySelector(".chemical-details").appendChild(linkedSection)

        linkedSection.querySelectorAll(".product-link").forEach(link => {
          link.addEventListener("click", e => this.showProductModal(e.currentTarget.dataset.productId))
        })
      }

      grid.appendChild(card)
    })
  }

  async addChemical() {
    const jsonInput = document.getElementById("jsonInput")
    const modal = document.getElementById("addModal")

    try {
      const chemicalData = JSON.parse(jsonInput.value)

      const requiredFields = ["name", "type", "commonUses", "description", "regulatoryStatus"]
      for (const field of requiredFields) {
        if (!chemicalData[field]) throw new Error(`Missing required field: ${field}`)
      }

      chemicalData.image = chemicalData.image || ""
      chemicalData.preservative = chemicalData.preservative || false

      this.chemicals.push(chemicalData)
      await this.dataManager.saveData(this.chemicals)

      this.filteredChemicals = [...this.chemicals]
      this.renderChemicals()

      modal.classList.remove("active")
      jsonInput.value = ""

      this.uiManager.showNotification("Chemical added successfully!", "success")
    } catch (error) {
      this.uiManager.showNotification(`Error adding chemical: ${error.message}`, "error")
    }
  }

  showProductModal(productId) {
    const product = this.linkingManager.getProductById(productId)
    if (product) this.modalManager.showProductModal(product, this.linkingManager)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ChemicalsApp()
})
