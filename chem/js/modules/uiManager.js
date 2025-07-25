export class UIManager {
  constructor() {
    this.notifications = []
  }

  showNotification(message, type = "info", duration = 3000) {
    const notification = this.createNotification(message, type)
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.add("show")
    }, 10)

    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, duration)
  }

  getNotificationIcon(type) {
    const icons = {
      success: '<i class="fas fa-check-circle"></i>',
      error: '<i class="fas fa-exclamation-circle"></i>',
      warning: '<i class="fas fa-exclamation-triangle"></i>',
      info: '<i class="fas fa-info-circle"></i>',
    }
    return icons[type] || icons.info
  }

  createNotification(message, type) {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${this.getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
    </div>
  `

    if (!document.querySelector("#notification-styles")) {
      this.addNotificationStyles()
    }

    return notification
  }

  addNotificationStyles() {
    const style = document.createElement("style")
    style.id = "notification-styles"
    style.textContent = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: var(--shadow-lg);
    z-index: 1001;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
  }

  .notification.show {
    transform: translateX(0);
  }

  .notification-success {
    border-left: 4px solid var(--success);
  }

  .notification-error {
    border-left: 4px solid var(--error);
  }

  .notification-warning {
    border-left: 4px solid var(--warning);
  }

  .notification-info {
    border-left: 4px solid var(--accent-primary);
  }

  .notification-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .notification-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .notification-message {
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  [data-theme="amoled"] .notification {
    box-shadow: 0 0 20px rgba(0, 255, 149, 0.2);
  }

  [data-theme="amoled"] .notification-success {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  }

  [data-theme="amoled"] .notification-error {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
  }
`
    document.head.appendChild(style)
  }

  showLoading(element) {
    const loader = document.createElement("div")
    loader.className = "loading"
    element.appendChild(loader)
    return loader
  }

  hideLoading(loader) {
    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader)
    }
  }
}
