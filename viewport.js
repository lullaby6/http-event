
function detectViewport() {
    const viewportElements = document.querySelectorAll('[viewport-name]')

    let minDistance = Infinity
    let minDistanceElement = null

    viewportElements.forEach(element => {
        const elementY = element.getBoundingClientRect().top - document.body.getBoundingClientRect().top

        const distance = Math.abs(elementY - window.scrollY)
        
        if (distance < minDistance) {
            minDistance = distance
            minDistanceElement = element
        }
    })

    if (minDistanceElement) {
        const name = minDistanceElement.getAttribute('viewport-name')
        const triggers = document.querySelectorAll(`[viewport-trigger="${name}"]`)
        const otherTriggers = document.querySelectorAll(`[viewport-trigger]:not([viewport-trigger="${name}"])`)
        
        otherTriggers.forEach(trigger => trigger.removeAttribute('in-viewport'))
        triggers.forEach(trigger => trigger.setAttribute('in-viewport', ''))
    }
}

detectViewport()

window.addEventListener('scroll', detectViewport)