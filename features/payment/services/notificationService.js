const axios = require("axios");

async function notificationDetails(notificationCode) {
    const response = await axios.get(
        `https://api.pagbank.com.br/v3/transactions/notifications/${notificationCode}`,
        {
            headers: {
                Authorization: `Bearer ${process.env.PAGBANK_TOKEN}`
            }
        }
    );

    return response.data;
}

module.exports = { notificationDetails };