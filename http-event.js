function httpEvent(){
    const elements = document.querySelectorAll('[he-event]')

    elements.forEach(element => {
        if (element.hasAttribute('he-loaded')) return
        element.setAttribute('he-loaded', '')

        const eventName = element.getAttribute('he-event')

        element.addEventListener(eventName, async event => {
            event.preventDefault();

            let httpData = {}

            if (eventName == "submit") {
                const formData = new FormData(event.target);
                httpData = Object.fromEntries(formData);
            }

            if(event.target.hasAttribute('he-data')){
                httpData = {...httpData, ...JSON.parse(event.target.getAttribute('he-data'))}
            }

            const url = event.target.getAttribute('he-url') || window.location.href
            const method = event.target.getAttribute('he-method') || 'GET'

            let headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }

            if(event.target.hasAttribute('he-authentication')){
                headers['Authentication'] = event.target.getAttribute('he-authentication')
            }

            if(event.target.hasAttribute('he-authorization')){
                headers['Authorization'] = event.target.getAttribute('he-authorization')
            }

            if(event.target.hasAttribute('he-headers')){
                headers = {...headers, ...JSON.parse(event.target.getAttribute('he-headers'))}
            }

            if(event.target.hasAttribute('he-headers-storage')){
                storageHeaders = JSON.parse(event.target.getAttribute('he-headers-storage'))

                Object.entries(storageHeaders).forEach(([header, storage]) => {
                    storageHeaders[header] = localStorage.getItem(storage)
                })

                headers = {...headers, ...storageHeaders}
            }

            try {
                const res = await fetch(url, {
                    method,
                    headers,
                    body: JSON.stringify(httpData)
                })
                const data = await res.json()

                if(event.target.hasAttribute('he-log')) console.log(data)
                if(event.target.hasAttribute('he-storage')) localStorage.setItem(event.target.getAttribute('he-storage'), data)
            } catch (error) {
                console.error(`[http-event] ${error}`);
            }

            if(event.target.hasAttribute('he-run')){
                eval(event.target.getAttribute('he-run'))
            }

            if(event.target.hasAttribute('he-clear-inputs')){
                const inputs = event.target.querySelectorAll('input')

                inputs.forEach(input => input.value = '')
            }
        })
    })
}

document.addEventListener('DOMContentLoaded', () => {
    httpEvent()
})