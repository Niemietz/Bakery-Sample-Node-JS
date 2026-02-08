const logger = createLogger('PAYMENT_FALLBACK', {
    level: 0,        // DEBUG
    persist: true
})

document.addEventListener("DOMContentLoaded", async () => {
    const ref = new URLSearchParams(window.location.search).get(REFERENCE_ID_URL_PARAM);
    const expirationDate = new URLSearchParams(window.location.search).get(EXPIRATION_DATE_URL_PARAM);
    const qrCode = new URLSearchParams(window.location.search).get(QR_CODE_URL_PARAM);

    if (ref !== undefined && ref !== null && ref !== "undefined" && ref !== "null" && ref !== "") {
        if (qrCode !== undefined && qrCode !== null && qrCode !== "undefined" && qrCode !== "null" && qrCode !== "") {
            document.getElementById("qr_code_placeholder").style.display = null
        }

        if (expirationDate !== undefined && expirationDate !== null && expirationDate !== "undefined" && expirationDate !== "null" && expirationDate !== "") {
            document.getElementById("qr_code_expiration_label").style.display = null;
            document.getElementById("qr_code_expiration_date").innerHTML = new Date(expirationDate).toLocaleDateString();
        }

        let tries = 1

        logger.info(`Start checking payment status...`)

        const interval = setInterval(async () => {
            if (tries > MAX_TRIES_FOR_CHECKING) {
                clearInterval(interval);
                refreshWithResult(ERROR_RESULT)
            }

            logger.info(`Checking (${tries}/${MAX_TRIES_FOR_CHECKING})...`)
            const res = await fetch(`${STATUS_ENDPOINT}/${ref}`)
            const data = await res.json()

            let resultParam = ERROR_RESULT // default is error
            const shouldRefresh =
                [PAID_STATUS, DECLINED_STATUS, CANCELED_STATUS, AUTHORIZED_STATUS, REFUNDED_STATUS]
                    .indexOf(data.status) > -1

            switch (data.status) {
                case PAID_STATUS:
                    resultParam = PAID_RESULT

                    break
                case DECLINED_STATUS:
                case CANCELED_STATUS:
                    resultParam = NOT_PAID_RESULT

                    break
                case AUTHORIZED_STATUS:
                case REFUNDED_STATUS:
                    resultParam = ERROR_RESULT

                    break
            }

            if (shouldRefresh || data.status === NOT_FOUND_STATUS) {
                clearInterval(interval);
                refreshWithResult(resultParam)
            } else {
                tries += 1
            }
        }, 3000);
    }
});

function refreshWithResult(result) {
    logger.info(`Refreshing page with ?${RESULT_URL_PARAM}=${result}`)
    //await delay(3000)
    window.location.href = `${PAYMENT_FALLBACK}?${RESULT_URL_PARAM}=${result}`
}
