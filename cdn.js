function httpEventGetElement(element, query) {
    let targetSelector

    if (query == 'this') targetSelector = element
    else if (query == 'parent') targetSelector = element.parentElement
    else if (query == 'children') targetSelector = element.children
    else if (query == 'next') targetSelector = element.nextElementSibling
    else if (query == 'prev') targetSelector = element.previousElementSibling

    if (!targetSelector) targetSelector = element.querySelector(query)
    if (!targetSelector) targetSelector = element.closest(query)
    if (!targetSelector) targetSelector = document.querySelector(query)

    return targetSelector
}

function httpEventLoad(element) {
    element.setAttribute('he-loaded', '')

    const eventName = element.getAttribute('he-event')

    if (eventName == 'load') httpEventMethod(element, eventName)
    else element.addEventListener(eventName, async event => {
        event.preventDefault()

        httpEventMethod(event.target, eventName)
    })
}

async function httpEventMethod(element, eventName) {
    const url = element.getAttribute('he-url') || window.location.href
    const method = element.getAttribute('he-method') || 'GET'

    let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    let body = {}

    if (eventName == 'submit') {
        try {
            const formData = new FormData(element)
            body = Object.fromEntries(formData)
        } catch (error) {}
    }

    if (element.hasAttribute('he-target-form')) {
        try {
            const form = httpEventGetElement(element, element.getAttribute('he-target-form'))
            const formData = new FormData(form)
            const formDataObj = Object.fromEntries(formData)
            body = {
                ...body,
                ...formDataObj
            }
        } catch (error) {}
    }

    if (element.hasAttribute('he-data')) {
        try {
            body = {
                ...body,
                ...JSON.parse(element.getAttribute('he-data'))
            }
        } catch (error) {}
    }

    if (element.hasAttribute('he-authentication')) {
        headers['Authentication'] = element.getAttribute('he-authentication')
    }

    if (element.hasAttribute('he-authorization')) {
        headers['Authorization'] = element.getAttribute('he-authorization')
    }

    if (element.hasAttribute('he-headers')) {
        try {
            headers = {
                ...headers,
                ...JSON.parse(element.getAttribute('he-headers'))
            }
        } catch (error) {}
    }

    if (element.hasAttribute('he-headers-storage')) {
        try {
            const storageHeaders = JSON.parse(element.getAttribute('he-headers-storage'))

            Object.entries(storageHeaders).forEach(([header, storage]) => {
                storageHeaders[header] = localStorage.getItem(storage)
            })

            headers = {
                ...headers,
                ...storageHeaders
            }
        } catch (error) {}
    }

    const options = {
        method,
        headers
    }

    if (body && method != 'GET' && method != 'HEAD') {
        options['body'] = JSON.stringify(body)
    }

    try {
        const response = await fetch(url, options)

        if (
            element.hasAttribute('he-status-code') &&
            response.status != element.getAttribute('he-status-code')
        ) {
            const dataJson = await response.json()

            if (dataJson.message) throw new Error(dataJson.message)
            if (dataJson.msg) throw new Error(dataJson.msg)
            if (dataJson.error) throw new Error(dataJson.error)
            throw new Error(`${response.status} ${response.statusText}`)
        }

        let data = null

        if (element.hasAttribute('he-json')) {
            data = await response.json()
        } else {
            data = await response.text()
        }

        if (element.hasAttribute('he-log')) {
            console.log('[http-event response]', data);
            console.log('[http-event headers]', headers);
            console.log('[http-event body]', body);
        }

        if (element.hasAttribute('he-storage')) {
            localStorage.setItem(element.getAttribute('he-storage'), data)
        }

        if (element.hasAttribute('he-json') && element.hasAttribute('he-storage-json')) {
            try {
                const storageJson = JSON.parse(element.getAttribute('he-storage-json'))

                Object.entries(storageJson).forEach(([storage, key]) => {
                    localStorage.setItem(storage, data[key])
                })
            } catch (error) {}
        }

        if (element.hasAttribute('he-run')) {
            eval(element.getAttribute('he-run'))
        }

        if (element.hasAttribute('he-clear-inputs')) {
            const inputs = element.querySelectorAll('input')

            inputs.forEach(input => input.value = '')
        }

        if (element.hasAttribute('he-success-target')) {
            const successElement = httpEventGetElement(element, element.getAttribute('he-success-target'))

            if (successElement) {
                let text = element.getAttribute('he-success-text') || null

                if (!text) {
                    if (typeof data == 'object') {
                        if (data.message) text = data.message
                        else if (data.msg) text = data.msg
                        else text = data
                    } else {
                        try {
                            const dataJson = JSON.parse(data)

                            if (dataJson.message) text = dataJson.message
                            else if (dataJson.msg) text = dataJson.msg
                            else text = data
                        } catch (error) {
                            text = data
                        }
                    }
                }

                if (text) successElement.innerText = text
            }
        }

        if (element.hasAttribute('he-redirect')) {
            window.location.href = element.getAttribute('he-redirect')
        }
    } catch (error) {
        if (element.hasAttribute('he-log')) {
            console.error('[http-event error]', error);
            console.error('[http-event headers]', headers);
            console.error('[http-event body]', body);
        }

        if (element.hasAttribute('he-error-target')) {
            const errorElement = httpEventGetElement(element, element.getAttribute('he-error-target'))

            if (errorElement) {
                const text = element.getAttribute('he-error-text') || error.message

                errorElement.innerText = text
            }
        }
    }
}

function httpEvent(){
    const elements = document.querySelectorAll('[he-event]:not([he-loaded])')

    elements.forEach(httpEventLoad)
}

document.addEventListener('DOMContentLoaded', () => {
    httpEvent()

    window.httpEventMutationObserver = new MutationObserver(httpEvent)

    window.httpEventMutationObserver.observe(document.body, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
        attributeOldValue: true,
        characterDataOldValue: true
    });
})