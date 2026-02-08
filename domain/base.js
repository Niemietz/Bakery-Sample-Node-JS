const LOG_TAG = "[SERVER_BASE]"
const { getLogger } = require(`${require.main.path}/domain/logging`)
const logger = getLogger(LOG_TAG);

const uiDataEndpoint = "http://localhost:3001/data"

const loadUIData = async () => {
    let result

    logger.debug("Loading UI Data...");

    const fetch = (url, init) => import("node-fetch").then(({ default: fetch }) => fetch(url, init));

    const response = await fetch(uiDataEndpoint);
    result = await response.json();

    logger.debug(`Loaded UI Data: ${JSON.stringify(result)}`);

    return result
};

module.exports = { loadUIData };
