const winston = require("winston");

function getLogger(tag) {
    const logFormatter = winston.format.printf((info) => {
        let { timestamp, level, stack, message } = info;
        message = stack || message;
        return `${timestamp} ${tag} ${message}`;
    });

    return winston.createLogger({
        level: "info",
        format: winston.format.errors({stack: true}),
        transports: [new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple(), winston.format.timestamp(), logFormatter),
        }),],
    })
}

module.exports = { getLogger };
