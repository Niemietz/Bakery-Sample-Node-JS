const pagBankClient = require("./pagbankClient");

async function create3dsSession() {
    const payload = {
        data: {
            type: "THREEDS",
        }
    };

    const response = await pagBankClient.post(
        "/authentication/3ds",
        payload
    );

    return response.data.id; // <-- three_ds_id
}

module.exports = { create3dsSession };
