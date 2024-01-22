const copyElements = document.querySelectorAll('[copy]')

function copyGetElement(element, query) {
    let targetSelector

    if (query == 'this') targetSelector = element
    else if (query == 'parent') targetSelector = element.parentElement
    else if (query == 'children') targetSelector = element.children
    else if (query == 'next') targetSelector = element.nextElementSibling
    else if (query == 'prev') targetSelector = element.previousElementSibling

    if (!targetSelector) targetSelector = element.querySelector(query)
    if (!targetSelector) targetSelector = element.closest(query)
    if (!targetSelector) targetSelector = element.parentElement.querySelector(query)
    if (!targetSelector) targetSelector = document.querySelector(query)

    return targetSelector
}

copyElements.forEach(element => {
    element.addEventListener('click', () => {
        const selector = element.getAttribute('copy')
        const code = copyGetElement(element, selector)
        const text = code.innerText
        navigator.clipboard.writeText(text)
    })
})