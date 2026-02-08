const fs = require("fs");

const DB_FILE = "./data/payments.json";

function readDb() {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
}

function writeDb(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = { readDb, writeDb }
