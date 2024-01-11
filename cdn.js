function httpEvent(){
    const elements = document.querySelectorAll('[he-event]')

    elements.forEach(element => {
        if (element.hasAttribute('he-loaded')) return
        element.setAttribute('he-loaded', '')

        const eventName = element.getAttribute('he-event')

        if (eventName == "load") httpEventMethod(element, eventName)
        else{
            element.addEventListener(eventName, async event => {
                if (event.target.hasAttribute('he-prevent')) event.preventDefault()

                httpEventMethod(event.target, eventName)
            })
        }
    })
}

async function httpEventMethod(targetElement, eventName){
    let httpData = {}

    if (eventName == "submit") httpData = Object.fromEntries(new FormData(targetElement))

    if(targetElement.hasAttribute('he-data')) httpData = {...httpData, ...JSON.parse(targetElement.getAttribute('he-data'))}

    const url = targetElement.getAttribute('he-url') || window.location.href
    const method = targetElement.getAttribute('he-method') || 'GET'

    let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }

    if(targetElement.hasAttribute('he-authentication')) headers['Authentication'] = targetElement.getAttribute('he-authentication')

    if(targetElement.hasAttribute('he-authorization')) headers['Authorization'] = targetElement.getAttribute('he-authorization')

    if(targetElement.hasAttribute('he-headers')) headers = {...headers, ...JSON.parse(targetElement.getAttribute('he-headers'))}

    if(targetElement.hasAttribute('he-headers-storage')){
        storageHeaders = JSON.parse(targetElement.getAttribute('he-headers-storage'))

        Object.entries(storageHeaders).forEach(([header, storage]) => storageHeaders[header] = localStorage.getItem(storage))

        headers = {...headers, ...storageHeaders}
    }

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(httpData)
        })

        let responseData = null

        if(targetElement.hasAttribute('he-json')) responseData = await response.json()
        else responseData = await response.text()

        if(targetElement.hasAttribute('he-log')) {
            console.log(`[http-event response]`, responseData);
            console.log(`[http-event headers]`, headers);
            console.log(`[http-event body]`, httpData);
        }

        if(targetElement.hasAttribute('he-storage')) localStorage.setItem(targetElement.getAttribute('he-storage'), responseData)

        if(targetElement.hasAttribute('he-run')){
            eval(targetElement.getAttribute('he-run'))
        }

        if(targetElement.hasAttribute('he-clear-inputs')){
            const inputs = targetElement.querySelectorAll('input')

            inputs.forEach(input => input.value = '')
        }

        if(targetElement.hasAttribute('he-target')){
            const selector = targetElement.getAttribute('he-target')

            let targetSelector = null

            if (selector == 'this') targetSelector = targetElement
            else if (selector == 'parent') targetSelector = targetElement.parentElement
            else if (selector == 'children') targetSelector = targetElement.children
            else if (selector == 'next') targetSelector = targetElement.nextElementSibling
            else if (selector == 'previous') targetSelector = targetElement.previousElementSibling

            if (!targetSelector) targetSelector = targetElement.querySelector(selector)
            if (!targetSelector) targetSelector = targetElement.closest(selector)
            if (!targetSelector) targetSelector = document.querySelector(selector)

            if (targetSelector) {
                const swap = targetElement.getAttribute('he-swap') || 'innerHTML'

                if (swap == 'innerHTML') targetSelector.innerHTML = responseData
                else if (swap == 'outerHTML') targetSelector.outerHTML = responseData
                else if (swap == 'value') targetSelector.value = responseData
                else if (swap == 'innerText') targetSelector.innerText = responseData
                else if (swap == 'textContent') targetSelector.textContent = responseData
                else if (swap == 'afterbegin' || swap == 'beforeend' || swap == 'beforebegin' || swap == 'afterend') targetSelector.insertAdjacentHTML(swap, responseData)
                else if (swap == 'remove') targetSelector.remove()

                if(targetElement.hasAttribute('he-attr')) targetSelector.setAttribute(targetElement.getAttribute('he-attr'), responseData)
            }
        }

        if (targetElement.hasAttribute('he-redirect')) window.location.href = targetElement.getAttribute('he-redirect')
    } catch (error) {
        console.error(`[http-event error] ${error}`);
        console.error(`[http-event headers]`, headers);
        console.error(`[http-event body]`, httpData);
    }
}

document.addEventListener('DOMContentLoaded', e => {
    httpEvent()
})