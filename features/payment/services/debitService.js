const pagBankClient = require("./pagbankClient");
const { create3dsSession } = require("./threeDsService");

const {
    insertPayment
} = require(`${require.main.path}/features/payment/paymentRepository`);

const LOG_TAG = "[DEBIT_CARD_SERVICE]"
const { getLogger } = require(`${require.main.path}/domain/logging`)
const logger = getLogger(LOG_TAG);

const { handleAxiosError } = require(`${require.main.path}/domain/axiosErrorHandler`);
const { PENDING_STATUS } = require(`${require.main.path}/domain/constants`);
const { getReferenceID } = require(`${require.main.path}/domain/idProvider`);

async function createDebit(amount, card) {
    let result = null

    try {
        const timestamp = Date.now()
        const referenceId = getReferenceID(timestamp)

        const threeDsId = await create3dsSession();

        const payload = {
            reference_id: referenceId,

            payment_method: {
                type: "DEBIT_CARD",
                debit: {
                    bank: card.bank
                },
                card: {
                    number: card.number,
                    exp_month: card.expirationMonth,
                    exp_year: card.expirationYear,
                    security_code: card.ccv,
                    brand: card.brand,
                    product: "product",
                    first_digits: card.number.substring(0, 6)
                },
                authentication_method: {
                    type: "THREEDS",
                    three_ds_id: threeDsId,
                }
            },

            customer: {
                name: "João Silva",
                email: "joao@email.com",
                tax_id: "12345678909"
            },

            items: [
                {
                    name: "Produto Teste Débito",
                    quantity: 1,
                    unit_amount: amount
                }
            ],

            amount: {
                value: amount,
                currency: "BRL"
            },

            notification_urls: [
                "https://paronymous-anitra-unvigilantly.ngrok-free.dev/pagbank/webhook" // SHOULD USE ngrok
            ]
        };

        logger.info("Creating Debit Card payment for PagBank...")
        const response = await pagBankClient.post("/charges", payload);
        result = response.data;

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

    return result
}

module.exports = { createDebit };