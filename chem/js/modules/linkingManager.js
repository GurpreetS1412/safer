export class LinkingManager {
  constructor(chemicalsData, productsData) {
    this.chemicals = chemicalsData
    this.products = productsData
  }

  getProductsWithChemical(chemicalName) {
    return this.products.filter(
      (product) => product.harmfulChemicals && product.harmfulChemicals.includes(chemicalName),
    )
  }

  getChemicalsInProduct(productId) {
    const product = this.products.find((p) => p.productId === productId)
    if (!product || !product.harmfulChemicals) return []

    return this.chemicals.filter((chemical) => product.harmfulChemicals.includes(chemical.name))
  }

  getProductById(productId) {
    return this.products.find((p) => p.productId === productId)
  }

  getChemicalByName(chemicalName) {
    return this.chemicals.find((c) => c.name === chemicalName)
  }

  calculateSafetyScore(product) {
    if (!product.harmfulChemicals || product.harmfulChemicals.length === 0) {
      return product.isOrganic ? 100 : 85
    }

    const baseScore = product.isOrganic ? 70 : 60
    const penalty = product.harmfulChemicals.length * 10
    return Math.max(0, baseScore - penalty)
  }

  getAlternativeProducts(productId) {
    const product = this.getProductById(productId)
    if (!product) return []

    const currentHarmfulCount = product.harmfulChemicals ? product.harmfulChemicals.length : 0

    return this.products
      .filter(
        (p) =>
          p.productId !== productId &&
          p.category === product.category &&
          (p.harmfulChemicals ? p.harmfulChemicals.length : 0) < currentHarmfulCount,
      )
      .sort((a, b) => {
        const scoreA = this.calculateSafetyScore(a)
        const scoreB = this.calculateSafetyScore(b)
        return scoreB - scoreA
      })
  }
}
