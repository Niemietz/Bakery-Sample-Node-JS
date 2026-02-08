const odbc = require("odbc");

async function db() {
    return await odbc.connect(
        "Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq=./pagbank.accdb;"
    );
}

module.exports = { db }
