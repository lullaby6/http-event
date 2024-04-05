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

    if (element.hasAttribute('he-body')) {
        try {
            body = {
                ...body,
                ...JSON.parse(element.getAttribute('he-body'))
            }
        } catch (error) {}
    }

    if (element.hasAttribute('he-body-storage')) {
        try {
            const bodyStorage = JSON.parse(element.getAttribute('he-body-storage'))

            Object.entries(bodyStorage).forEach(([data, storage]) => {
                if (localStorage.getItem(storage) != null) {
                    bodyStorage[data] = localStorage.getItem(storage)
                } else {
                    delete bodyStorage[data]
                }
            })

            body = {
                ...body,
                ...bodyStorage
            }
        } catch (error) {}
    }

    if (element.hasAttribute('he-body-attr')) {
        try {
            const bodyAttrs = JSON.parse(element.getAttribute('he-body-storage'))

            Object.entries(bodyAttrs).forEach(([data, attr]) => {
                if (element.hasAttribute(attr)) {
                    bodyAttrs[data] = element.getAttribute(attr)
                } else {
                    delete bodyAttrs[data]
                }
            })

            body = {
                ...body,
                ...bodyAttrs
            }
        } catch (error) {}
    }

    if (eventName == 'submit') {
        try {
            const formData = new FormData(element)
            const formDataObj = Object.fromEntries(formData)
            body = {
                ...body,
                ...formDataObj
            }
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
            const headersStorage = JSON.parse(element.getAttribute('he-headers-storage'))

            Object.entries(headersStorage).forEach(([header, storage]) => {
                if (localStorage.getItem(storage) != null) {
                    headersStorage[header] = localStorage.getItem(storage)
                } else {
                    delete headersStorage[header]
                }
            })

            headers = {
                ...headers,
                ...headersStorage
            }
        } catch (error) {}
    }

    if (element.hasAttribute('he-headers-attr')) {
        try {
            const headersAttrs = JSON.parse(element.getAttribute('he-headers-attr'))

            Object.entries(headersAttrs).forEach(([header, attr]) => {
                if (element.hasAttribute(attr)) {
                    headersAttrs[header] = element.getAttribute(attr)
                } else {
                    delete headersAttrs[header]
                }

                headers = {
                    ...headers,
                    ...headersAttrs
                }
            })
        } catch (error) {}
    }

    if (element.hasAttribute('he-accept')) {
        headers['Accept'] = element.getAttribute('he-accept')
    }

    if (element.hasAttribute('he-encoding')) {
        headers['Accept-Encoding'] = element.getAttribute('he-encoding')
    }

    if (element.hasAttribute('he-content-type')) {
        headers['Content-Type'] = element.getAttribute('he-content-type')
    }

    if (element.hasAttribute('he-form-data') || headers['Content-Type'] == 'multipart/form-data') {
        headers['Content-Type'] = 'multipart/form-data'

        if (body && Object.keys(body).length > 0) {
            body = new FormData()

            Object.entries(body).forEach(([key, value]) =>
                formData.append(key, value)
            );
        }
    }

    if (element.hasAttribute('he-form-urlencoded') || headers['Content-Type'] == 'application/x-www-form-urlencoded') {
        headers['Content-Type'] = 'application/x-www-form-urlencoded'

        if (body && Object.keys(body).length > 0) {
            body = new URLSearchParams(Object.entries(body)).toString();
        }
    }

    if (element.hasAttribute('he-authentication')) {
        headers['Authentication'] = element.getAttribute('he-authentication')
    }

    if (element.hasAttribute('he-authorization')) {
        headers['Authorization'] = element.getAttribute('he-authorization')
    }

    const options = {
        method,
        headers
    }

    if (body && Object.keys(body).length > 0 && method != 'GET' && method != 'HEAD') {
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
            throw new Error(`Expected status code ${element.getAttribute('he-status-code')}, got ${response.status} - ${response.statusText}`)
        }

        let data = null

        if (element.hasAttribute('he-json')) {
            try {
                data = await response.json()
            } catch (error) {
                throw new Error('Error on parsing the response data into json')
            }
        } else if (element.hasAttribute('he-safe-json')) {
            try {
                data = await response.json()
            } catch (error) {}
        } else {
            data = await response.text()
        }

        if (element.hasAttribute('he-log')) {
            console.log('[http-event response]', response);
            console.log('[http-event response data]', data);
            console.log('[http-event headers]', headers);

            if (body && method != 'GET' && method != 'HEAD') {
                console.log('[http-event body]', body);
            }
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
            } catch (error) {
                throw new Error('Error on parsing the response data into json to store in local storage')

            }
        }

        if (element.hasAttribute('he-attr')) {
            if (element.hasAttribute('he-attr-target')) {
                const target = httpEventGetElement(element, element.getAttribute('he-attr-target'))
                target.setAttribute(element.getAttribute('he-attr'), data)
            } else {
                element.setAttribute(element.getAttribute('he-attr'), data)
            }
        }

        if (element.hasAttribute('he-attr-json')) {
            try {
                const attrJson = JSON.parse(element.getAttribute('he-attr-json'))

                Object.entries(attrJson).forEach(([attr, key]) => {
                    element.setAttribute(attr, data[key])
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

        if (element.hasAttribute('he-open')) {
            window.open(element.getAttribute('he-open'), '_blank')
        }
    } catch (error) {
        if (element.hasAttribute('he-log')) {
            console.error('[http-event error]', error);
            console.error('[http-event headers]', headers);

            if (body && method != 'GET' && method != 'HEAD') {
                console.error('[http-event body]', body);
            }
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

function httpEvent() {
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