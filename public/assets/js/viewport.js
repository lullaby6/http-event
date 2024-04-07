
function detectViewport() {
    const viewportTriggerElements = document.querySelectorAll('[viewport]')

    const viewportTargetElements = []

    viewportTriggerElements.forEach(viewportTriggerElement => {
        const viewportElementQuery = viewportTriggerElement.getAttribute('viewport')

        const viewportTargetElementsGetted = document.querySelectorAll(viewportElementQuery)

        if (viewportTargetElementsGetted && viewportTargetElementsGetted.length > 0) {
            viewportTargetElementsGetted.forEach(viewportElement => {
                viewportTargetElements.push(viewportElement)
                viewportElement.viewportElementQuery = viewportElementQuery
            })
        }
    })

    let minDistance = Infinity
    let minDistanceElement = null

    viewportTargetElements.forEach(element => {
        const elementY = element.getBoundingClientRect().top - document.body.getBoundingClientRect().top

        const distance = Math.abs(elementY - window.scrollY)

        if (distance < minDistance) {
            minDistance = distance
            minDistanceElement = element
        }
    })

    if (minDistanceElement) {
        const viewportElementQuery = minDistanceElement.viewportElementQuery
        const triggers = document.querySelectorAll(`[viewport="${viewportElementQuery}"]`)
        const otherTriggers = document.querySelectorAll(`[viewport]:not([viewport="${viewportElementQuery}"])`)

        otherTriggers.forEach(trigger => trigger.removeAttribute('in-viewport'))
        triggers.forEach(trigger => trigger.setAttribute('in-viewport', ''))
    }
}

detectViewport()

window.addEventListener('scroll', detectViewport)
document.querySelector('[viewport-scroll]').addEventListener('scroll', detectViewport)