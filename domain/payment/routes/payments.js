const express = require("express");
const router = express.Router();

const { notificationDetails } = require(`${require.main.path}/features/payment/services/notificationService`);

const { getPaymentByReferenceId } = require(`${require.main.path}/features/payment/paymentRepository`);

const { createPixPayment } = require(`${require.main.path}/features/payment/services/pixService`);
const { createDebit } = require(`${require.main.path}/features/payment/services/debitService`);
const { createCreditCardPayment } = require(`${require.main.path}/features/payment/services/creditCardService`);

const LOG_TAG = "[SERVER_PAYMENTS]"
const { getLogger } = require(`${require.main.path}/domain/logging`)
const logger = getLogger(LOG_TAG);

router.get("/status/:referenceId", async (req, res) => {
    const result = getPaymentByReferenceId(req.params.referenceId)

    if (!result.length) {
        return res.status(404).json({ status: "NOT_FOUND" })
    }

    res.json({ status: result[0].status });
});

router.post("/pix", async (req, res) => {
    const payment = await createPixPayment(5000/*R$ 50,00*/,);
    if (payment != null) {
        const referenceId = payment.reference_id
        const expirationDate = payment.expirationDate
        const qrCode = payment.qr_code // FIXME

        res.json({ referenceId: referenceId, qrCode: qrCode, qrCodeExpirationDate: expirationDate })
    } else {
        res.status(500).json({ error: "Error while creating payment of PIX" })
    }
});

router.post("/debito", async (req, res) => {
    const payment = await createDebit(5000/*R$ 50,00*/, req.body.card);
    if (payment != null) {
        const referenceId = payment.reference_id

        res.json({ referenceId: referenceId })
    } else {
        res.status(500).json({ error: "Error while creating payment of Debit" })
    }
});

router.post("/credito", async (req, res) => {
    const payment = await createCreditCardPayment(5000/*R$ 50,00*/, req.body.card);
    if (payment != null) {
        const referenceId = payment.reference_id

        res.json({ referenceId: referenceId })
    } else {
        res.status(500).json({ error: "Error while creating payment of Credit" })
    }
});

module.exports = router;
