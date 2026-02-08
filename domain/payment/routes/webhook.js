const express = require("express");
const router = express.Router();

const { notificationDetails } = require(`${require.main.path}/features/payment/services/notificationService`);

const { updatePaymentStatus } = require(`${require.main.path}/features/payment/paymentRepository`);

const {
    PAID_STATUS,
    DECLINED_STATUS,
    CANCELED_STATUS,
    AUTHORIZED_STATUS,
    REFUNDED_STATUS,
} = require(`${require.main.path}/domain/constants`);

const LOG_TAG = "[WEBHOOK]"
const { getLogger } = require(`${require.main.path}/domain/logging`)
const logger = getLogger(LOG_TAG);

router.post("/webhook", async (req, res) => {
    try {
        const event = req.body;

        logger.info(`Webhook Received: ${JSON.stringify(event)}`);

        /*const { notificationCode } = event;

        console.log("Notification Code:", notificationCode);

        const transactionDetails = await notificationDetails(notificationCode);
        console.log("Full Details:", transactionDetails);*/

        if (!event) return res.sendStatus(200);

        const referenceId = event.reference_id;

        switch (event.status) {
            case PAID_STATUS:
                // dispatch product
                logger.info("Payment confirmed!");

                break;
            case DECLINED_STATUS:
            case CANCELED_STATUS:
                // undo the payment
                logger.warn(`Payment ${(event.status === DECLINED_STATUS) ? "declined" : "canceled"}!`);
                break;
            case AUTHORIZED_STATUS:
                logger.warn("Payment authorized, but not finished!");
                break;
            case REFUNDED_STATUS:
                break;
        }

        logger.info(`Updating database for ${referenceId}...`)
        const result = updatePaymentStatus(referenceId, event.status)

        if (result) {
            //console.log("Response from DB:", responseFromDB);
        } else {
            logger.error(`Could not update status for ${referenceId} in database`);
        }
    } catch (error) {
        logger.error(error)
    }

    res.sendStatus(200);
});

module.exports = router;
