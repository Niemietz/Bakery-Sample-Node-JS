const axios = require("axios");

function handleAxiosError(error, logger){
    let wasAxiosError = false

    if (axios.isAxiosError(error)) {
        wasAxiosError = true
        if (error.response) {
            // Server responded with a status code outside 2xx
            /*logger.error(`API error: ${JSON.stringify({
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            })}`)*/
            logger.error(`API error: ${JSON.stringify(error.response.data)}`)
        } else if (error.request) {
            // Request made but no response received
            logger.error(`Network error or no response: ${error.request}`)
        } else {
            logger.error(`Axios error: ${error.message}`)
        }
    }

    return wasAxiosError
}

module.exports = { handleAxiosError };
