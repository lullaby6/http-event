function httpEventGetElement(element, query){
    let targetSelector

    if (query == 'this') targetSelector = element
    else if (query == 'parent') targetSelector = element.parentElement
    else if (query == 'children') targetSelector = element.children
    else if (query == 'next') targetSelector = element.nextElementSibling
    else if (query == 'previous') targetSelector = element.previousElementSibling

    if (!targetSelector) targetSelector = element.querySelector(query)
    if (!targetSelector) targetSelector = element.closest(query)
    if (!targetSelector) targetSelector = document.querySelector(query)

    return targetSelector
}

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

        if(targetElement.hasAttribute('he-status-code')) {
            if (response.status != targetElement.getAttribute('he-status-code')) {
                const responseJson = await response.json()
                if (responseJson.message) throw new Error(responseJson.message)
                if (responseJson.msg) throw new Error(responseJson.msg)
                if (responseJson.error) throw new Error(responseJson.error)
                throw new Error(`${response.status} ${response.statusText}`)
            }
        }

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

        if(targetElement.hasAttribute('he-success-target')){
            const successElement = httpEventGetElement(targetElement, targetElement.getAttribute('he-success-target'))

            if (successElement) {
                let text = targetElement.getAttribute('he-success-text') || null

                if (!text) {
                    if (typeof responseData == 'object') {
                        if (responseData.message) text = responseData.message
                        else if (responseData.msg) text = responseData.msg
                        else text = responseData
                    } else {
                        try {
                            const responseJson = JSON.parse(responseData)
                            if (responseJson.message) text = responseJson.message
                            else if (responseJson.msg) text = responseJson.msg
                            else text = responseData
                        } catch (error) {
                            text = responseData
                        }
                    }
                }

                if (text) successElement.innerText = text
            }
        }

        if (targetElement.hasAttribute('he-redirect')) window.location.href = targetElement.getAttribute('he-redirect')
    } catch (error) {
        if(targetElement.hasAttribute('he-log')) {
            console.error(`[http-event error] ${error}`);
            console.error(`[http-event headers]`, headers);
            console.error(`[http-event body]`, httpData);
        }

        if(targetElement.hasAttribute('he-error-target')){
            const errorElement = httpEventGetElement(targetElement, targetElement.getAttribute('he-error-target'))

            if (errorElement) {
                const text = targetElement.getAttribute('he-error-text') || error.message

                errorElement.innerText = text
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    httpEvent()
})