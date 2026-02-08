const pagBankClient = require("./pagbankClient");

const {
    insertPayment
} = require(`${require.main.path}/features/payment/paymentRepository`);

const LOG_TAG = "[PIX_SERVICE]"
const { getLogger } = require(`${require.main.path}/domain/logging`)
const logger = getLogger(LOG_TAG);

const { handleAxiosError } = require(`${require.main.path}/domain/axiosErrorHandler`);
const { PENDING_STATUS, MAX_MINUTES_FOR_PIX_QR_CODE_AVAILABILITY } = require(`${require.main.path}/domain/constants`);
const { getReferenceID } = require(`${require.main.path}/domain/idProvider`);

function getPaymentExpirationDate(timestamp, minutesToAdd) {
    const datePlusMinutes = new Date(timestamp);

    datePlusMinutes.setMinutes(timestamp.getMinutes() + minutesToAdd);

    return datePlusMinutes.toISOString();
}

async function createPixPayment(amount) {
    let result = null

    try {
        const timestamp = Date.now()
        const referenceId = getReferenceID(timestamp)
        const expirationDate = getPaymentExpirationDate(timestamp, MAX_MINUTES_FOR_PIX_QR_CODE_AVAILABILITY)

        const payload = {
            reference_id: referenceId,
            customer: {
                name: "João Silva",
                email: "joao@email.com",
                tax_id: "12345678909"
            },
            items: [
                {
                    name: "Produto Teste",
                    quantity: 1,
                    unit_amount: amount
                }
            ],
            qr_codes: [
                {
                    amount: {
                        value: amount,
                    },
                    expiration_date: expirationDate
                }
            ],
            notification_urls: [
                "https://paronymous-anitra-unvigilantly.ngrok-free.dev/pagbank/webhook" // SHOULD USE ngrok
            ]
        }

        logger.info("Creating PIX payment for PagBank and generating QR Code...")
        const response = await pagBankClient.post("/orders", payload)
        result = { ...response.data, ...{ expirationDate: expirationDate } }

        insertPayment({
            reference_id: referenceId,
            status: PENDING_STATUS,
            amount: amount,
            created_at: timestamp
        })
    } catch(error) {
        const wasAxiosError = handleAxiosError(error, logger)

        if (!wasAxiosError) {
            logger.error(error.response?.data || error.message)
        }
    }

    return result
}

module.exports = { createPixPayment };