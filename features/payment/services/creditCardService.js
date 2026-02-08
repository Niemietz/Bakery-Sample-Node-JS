const pagBankClient= require("./pagbankClient");

const {
    PENDING_STATUS,
    VISA_ACCEPT_SELECT_VALUE,
    VISA_DECLINE_SELECT_VALUE,
    MASTER_CARD_ACCEPT_SELECT_VALUE,
    MASTER_CARD_DECLINE_SELECT_VALUE,
    AMEX_ACCEPT_SELECT_VALUE,
    AMEX_DECLINE_SELECT_VALUE,
    ELO_ACCEPT_SELECT_VALUE,
    ELO_DECLINE_SELECT_VALUE,
    HYPER_ACCEPT_SELECT_VALUE,
    HYPER_DECLINE_SELECT_VALUE,
} = require(`${require.main.path}/domain/constants`);

const {
    insertPayment
} = require(`${require.main.path}/features/payment/paymentRepository`);

const LOG_TAG = "[CREDIT_CARD_SERVICE]"
const { getLogger } = require(`${require.main.path}/domain/logging`)
const logger = getLogger(LOG_TAG);

const { handleAxiosError } = require(`${require.main.path}/domain/axiosErrorHandler`)

const { getReferenceID } = require(`${require.main.path}/domain/idProvider`);

async function createCreditCardPayment(amount, card) {
    let result = null

    try {
        const timestamp = Date.now()
        const referenceId = getReferenceID(timestamp)

        let cardNumber = "4111111111111111"
        let cardExpirationMonth = "12"
        let cardExpirationYear = "2030"
        let ccv = "123"

        switch (card) {
            case VISA_ACCEPT_SELECT_VALUE:
                cardNumber = process.env.VISA_ACCEPT_NUMBER
                cardExpirationMonth = process.env.VISA_ACCEPT_EXPIRATION_MONTH
                cardExpirationYear = process.env.VISA_ACCEPT_EXPIRATION_YEAR
                ccv = process.env.VISA_ACCEPT_CCV
                break
            case VISA_DECLINE_SELECT_VALUE:
                cardNumber = process.env.VISA_DECLINE_NUMBER
                cardExpirationMonth = process.env.VISA_DECLINE_EXPIRATION_MONTH
                cardExpirationYear = process.env.VISA_DECLINE_EXPIRATION_YEAR
                ccv = process.env.VISA_DECLINE_CCV
                break
            case MASTER_CARD_ACCEPT_SELECT_VALUE:
                cardNumber = process.env.MASTER_CARD_ACCEPT_NUMBER
                cardExpirationMonth = process.env.MASTER_CARD_ACCEPT_EXPIRATION_MONTH
                cardExpirationYear = process.env.MASTER_CARD_ACCEPT_EXPIRATION_YEAR
                ccv = process.env.MASTER_CARD_ACCEPT_CCV
                break
            case MASTER_CARD_DECLINE_SELECT_VALUE:
                cardNumber = process.env.MASTER_CARD_DECLINE_NUMBER
                cardExpirationMonth = process.env.MASTER_CARD_DECLINE_EXPIRATION_MONTH
                cardExpirationYear = process.env.MASTER_CARD_DECLINE_EXPIRATION_YEAR
                ccv = process.env.MASTER_CARD_DECLINE_CCV
                break
            case AMEX_ACCEPT_SELECT_VALUE:
                cardNumber = process.env.AMEX_ACCEPT_NUMBER
                cardExpirationMonth = process.env.AMEX_ACCEPT_EXPIRATION_MONTH
                cardExpirationYear = process.env.AMEX_ACCEPT_EXPIRATION_YEAR
                ccv = process.env.AMEX_ACCEPT_CCV
                break
            case AMEX_DECLINE_SELECT_VALUE:
                cardNumber = process.env.AMEX_DECLINE_NUMBER
                cardExpirationMonth = process.env.AMEX_DECLINE_EXPIRATION_MONTH
                cardExpirationYear = process.env.AMEX_DECLINE_EXPIRATION_YEAR
                ccv = process.env.AMEX_DECLINE_CCV
                break
            case ELO_ACCEPT_SELECT_VALUE:
                cardNumber = process.env.ELO_ACCEPT_NUMBER
                cardExpirationMonth = process.env.ELO_ACCEPT_EXPIRATION_MONTH
                cardExpirationYear = process.env.ELO_ACCEPT_EXPIRATION_YEAR
                ccv = process.env.ELO_ACCEPT_CCV
                break
            case ELO_DECLINE_SELECT_VALUE:
                cardNumber = process.env.ELO_DECLINE_NUMBER
                cardExpirationMonth = process.env.ELO_DECLINE_EXPIRATION_MONTH
                cardExpirationYear = process.env.ELO_DECLINE_EXPIRATION_YEAR
                ccv = process.env.ELO_DECLINE_CCV
                break
            case HYPER_ACCEPT_SELECT_VALUE:
                cardNumber = process.env.HYPER_ACCEPT_NUMBER
                cardExpirationMonth = process.env.HYPER_ACCEPT_EXPIRATION_MONTH
                cardExpirationYear = process.env.HYPER_ACCEPT_EXPIRATION_YEAR
                ccv = process.env.HYPER_ACCEPT_CCV
                break
            case HYPER_DECLINE_SELECT_VALUE:
                cardNumber = process.env.HYPER_DECLINE_NUMBER
                cardExpirationMonth = process.env.HYPER_DECLINE_EXPIRATION_MONTH
                cardExpirationYear = process.env.HYPER_DECLINE_EXPIRATION_YEAR
                ccv = process.env.HYPER_DECLINE_CCV
                break
        }

        const payload = {
            reference_id: referenceId,

            payment_method: {
                type: "CREDIT_CARD",

                installments: 1,        // PARCELAS
                capture: true,          // CAPTURA AUTOMÁTICA

                card: {
                    number: cardNumber,
                    exp_month: cardExpirationMonth,
                    exp_year: cardExpirationYear,
                    security_code: ccv,
                    holder: {
                        name: "JOAO DA SILVA"
                    }
                }
            },

            amount: {
                value: amount,
                currency: "BRL"
            },

            customer: {
                name: "João da Silva",
                email: "joao@email.com",
                tax_id: "12345678909"
            },
            notification_urls: [
                "https://paronymous-anitra-unvigilantly.ngrok-free.dev/pagbank/webhook" // SHOULD USE ngrok
            ]
        };

        logger.info("Creating Credit Card payment for PagBank...")
        const response = await pagBankClient.post("/charges", payload)
        result = response.data

        /*const db = await odbc.connect(
            "Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq=./pagbank.accdb;"
        );
        await db.query(`
            INSERT INTO payments (reference_id, status, amount, created_at)
            VALUES ('${referenceId}', PENDING_STATUS, 1000, NOW())
        `);*/
        insertPayment({
            reference_id: referenceId,
            status: PENDING_STATUS,
            amount: amount,
            created_at: timestamp
        })
    } catch(error) {
        const wasAxiosError = handleAxiosError(error, logger)

        if (!wasAxiosError) {
            logger.error(error.response?.data || error.message);
        }
    }

    return result;
}

module.exports = { createCreditCardPayment };
