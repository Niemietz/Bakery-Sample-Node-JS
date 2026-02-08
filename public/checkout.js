const logger = createLogger('CHECKOUT', {
    level: 0,        // DEBUG
    persist: true
})

document.addEventListener("DOMContentLoaded", () => {

});

async function loadUrl(url, method = "GET", data = null, headers = null, callback = null) {
    const body = (data !== null) ? JSON.stringify(data) : null
    const _headers = (headers !== null) ? headers : { 'Content-Type': 'application/json' }

    const options = {
        method: method,
        headers: _headers,
        body: body,
    }
    logger.info(`Paying...`, `[${method}]\nHeaders: ${JSON.stringify(headers)}\nBody: ${JSON.stringify(body)}`)
    const response = await fetch(url, options)
    let result = null
    try {
        result = await response.json()
    } catch (e) { }

    if (callback !== null) {
        callback(result)
    }
}
