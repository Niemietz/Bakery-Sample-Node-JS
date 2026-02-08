const axios = require("axios");

const LOG_TAG = "[PAGBANK_CLIENT]"
const { getLogger } = require(`${require.main.path}/domain/logging`)
const logger = getLogger(LOG_TAG);

const pagBankClient = axios.create({
    baseURL: process.env.PAGBANK_BASE_URL,
    headers: {
        Authorization: `Bearer ${process.env.PAGBANK_TOKEN}`,
        "Content-Type": "application/json"
    }
});

module.exports = pagBankClient;