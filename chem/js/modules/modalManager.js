export class ModalManager {
  constructor() {
    this.createDetailModal()
  }

  createDetailModal() {
    if (document.getElementById("detailModal")) return

    const modal = document.createElement("div")
    modal.id = "detailModal"
    modal.className = "detail-modal"
    modal.innerHTML = `
      <div class="detail-modal-content">
        <div class="detail-modal-header">
          <h3 id="detailModalTitle"></h3>
          <button class="close-btn" id="detailModalClose">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="detail-modal-body" id="detailModalBody">
        </div>
      </div>
    `
    document.body.appendChild(modal)

    const closeBtn = modal.querySelector("#detailModalClose")
    closeBtn.addEventListener("click", () => this.hideModal())

    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.hideModal()
    })
  }

  showProductModal(product, linkingManager) {
    const modal = document.getElementById("detailModal")
    const title = document.getElementById("detailModalTitle")
    const body = document.getElementById("detailModalBody")

    title.textContent = product.productName

    const safetyScore = linkingManager.calculateSafetyScore(product)
    const scoreColor = safetyScore >= 80 ? "var(--success)" : safetyScore >= 60 ? "var(--warning)" : "var(--error)"

    body.innerHTML = `
      <div class="modal-product-details">
        <div class="product-info">
          <p><strong>Category:</strong> ${product.category}</p>
          <p><strong>Product ID:</strong> ${product.productId}</p>
          <p><strong>Organic:</strong> ${product.isOrganic ? "✅ Yes" : "❌ No"}</p>
          <p style="color: ${scoreColor};"><strong>Safety Score:</strong> ${safetyScore}/100</p>
        </div>
        
        <div class="description">
          <h4>Description</h4>
          <p>${product.description}</p>
        </div>

        <div class="ingredients">
          <h4>Ingredients</h4>
          <p>${Array.isArray(product.ingredients) ? product.ingredients.join(", ") : product.ingredients}</p>
        </div>

        ${
          product.harmfulChemicals && product.harmfulChemicals.length > 0
            ? `
          <div class="harmful-chemicals-modal">
            <h4>⚠️ Harmful Chemicals Found</h4>
            <ul>
              ${product.harmfulChemicals
                .map(
                  (chemical) => `
                <li style="color: var(--error);">${chemical}</li>
              `,
                )
                .join("")}
            </ul>
          </div>
        `
            : '<div class="safe-product"><h4>✅ No Known Harmful Chemicals</h4></div>'
        }
      </div>
    `

    modal.classList.add("active")
  }

  showChemicalModal(chemical, linkingManager) {
    const modal = document.getElementById("detailModal")
    const title = document.getElementById("detailModalTitle")
    const body = document.getElementById("detailModalBody")

    title.textContent = chemical.name

    const linkedProducts = linkingManager.getProductsWithChemical(chemical.name)

    body.innerHTML = `
      <div class="modal-chemical-details">
        <div class="chemical-info">
          <p><strong>Type:</strong> ${chemical.type}</p>
          <p><strong>Preservative:</strong> ${chemical.preservative ? "✅ Yes" : "❌ No"}</p>
          <p><strong>Regulatory Status:</strong> ${chemical.regulatoryStatus}</p>
        </div>
        
        <div class="description">
          <h4>Description</h4>
          <p>${chemical.description}</p>
        </div>

        <div class="common-uses">
          <h4>Common Uses</h4>
          <p>${chemical.commonUses}</p>
        </div>

        ${
          linkedProducts.length > 0
            ? `
          <div class="found-in-products">
            <h4>🔍 Found in These Products</h4>
            <ul>
              ${linkedProducts
                .map(
                  (product) => `
                <li>${product.productName} (${product.category})</li>
              `,
                )
                .join("")}
            </ul>
          </div>
        `
            : '<div class="no-products"><h4>ℹ️ Not found in tracked products</h4></div>'
        }
      </div>
    `

    modal.classList.add("active")
  }

  hideModal() {
    const modal = document.getElementById("detailModal")
    modal.classList.remove("active")
  }
}
