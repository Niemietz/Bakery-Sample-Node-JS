const { readDb, writeDb } = require(`${require.main.path}/domain/fileDb`);
const odbc = require("odbc");

function insertPayment(payment) {
    /*const db = await odbc.connect(
        "Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq=./pagbank.accdb;"
    );
    await db.query(`
        INSERT INTO payments (reference_id, status, amount, created_at)
        VALUES ('${payment.reference_id}', payment.status, payment.amount, payment.created_at)
    `);*/

    const db = readDb();
    db.payments.push(payment);
    writeDb(db);

    return true
}

function updatePaymentStatus(referenceId, status) {
    let result = false
    /*const db = await odbc.connect(
        "Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq=./pagbank.accdb;"
    );
    const responseFromDB = await db.query(`
        UPDATE payments
        SET status = 'PAID'
        WHERE reference_id = '${referenceId}'
    `);
    result = responseFromDB.count > 0*/

    const db = readDb();
    const payment = db.payments.find(p => p.reference_id === referenceId);
    if (payment) {
        payment.status = status;
        writeDb(db);
        result = true
    }

    return result
}

function getPaymentByReferenceId(referenceId) {
    let result = [ ]
    /*const db = await odbc.connect(
        "Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq=./pagbank.accdb;"
    );
    const item = await db.query(`
        SELECT status FROM payments
        WHERE reference_id = '${req.params.referenceId}'
    `);

    if (item !== null && item !== undefined) {
        result = item
    }
    */

    const db = readDb();
    const item = db.payments.find(p => p.reference_id === referenceId)

    if (item !== null && item !== undefined) {
        result = [ item ]
    }

    return result
}

module.exports = { getPaymentByReferenceId, updatePaymentStatus, insertPayment }
