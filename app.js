require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

const pagbankWebhookRouter = require('./domain/payment/routes/webhook');
const pagbankPaymentsRouter = require('./domain/payment/routes/payments');

const LOG_TAG = "[SERVER]"
const { getLogger } = require("./domain/logging")
const logger = getLogger(LOG_TAG);

app.use('/pagbank', pagbankWebhookRouter);
app.use('/pagamentos', pagbankPaymentsRouter);

const { loadUIData } = require("./domain/base")

// Load JSON data
/*const loadData = async () => {
    const fetch = (url, init) => import("node-fetch").then(({ default: fetch }) => fetch(url, init));

    const url = 'http://localhost:3001/data'; // Replace with your file URL
    const response = await fetch(url);
    return await response.json();
};*/

app.get("/", async (req, res) => {
    const data = await loadUIData();
    res.render("index", { data });
});

app.get("/about", async (req, res) => {
    const data = await loadUIData();
    res.render("about", { data });
});

app.get("/contact", async (req, res) => {
    const data = await loadUIData();
    res.render("contact", { data, submitted: false });
});

app.post("/contact", async (req, res) => {
    const data = await loadUIData();
    const { name, email, message } = req.body;

    logger.log("Contact form:", { name, email, message });

    res.render("contact", { data, submitted: true });
});

app.get("/checkout", async (req, res) => {
    const data = await loadUIData();
    res.render("checkout", { data });
});

app.get("/paymentFallback", async (req, res) => {
    const data = await loadUIData();
    const referenceIdParam = req.query["ref"]
    const qrCodeParam = req.query["qrCode"]
    const resultParam = req.query["result"]
    const result = resultParam === undefined ? null : resultParam;

    if (resultParam !== undefined || referenceIdParam !== undefined) {
        res.render("paymentFallback", { data: data, referenceId: referenceIdParam, qrCode: qrCodeParam, result: result });
    }
});

app.listen(PORT, () => {
    logger.info(`🍞 Your Bakery running at http://localhost:${PORT}`);
});
