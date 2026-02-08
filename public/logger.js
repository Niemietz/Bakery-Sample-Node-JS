const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
}

const DEFAULT_CONFIG = {
    level: LOG_LEVELS.DEBUG,
    persist: false,                 // save logs to localStorage
    storageKey: '__app_logs__',
    maxStoredLogs: 500,
    showContext: true
}

function ellipsizeWords(text, maxLength) {
    if (text.length <= maxLength) return text

    const truncated = text.slice(0, maxLength - 1)
    return truncated.slice(0, truncated.lastIndexOf(' ')) + '…'
}

function safeSerialize(data) {
    try {
        return JSON.parse(JSON.stringify(data))
    } catch {
        return '[Unserializable]'
    }
}

function getContext(timestamp) {
    return {
        url: location.href,
        userAgent: navigator.userAgent,
        timestamp: timestamp
    }
}

function createLogger(namespace, config = {}) {
    const settings = { ...DEFAULT_CONFIG, ...config }

    function shouldLog(level) {
        return level >= settings.level
    }

    function persistLog(entry) {
        if (!settings.persist) return

        const logs =
            JSON.parse(localStorage.getItem(settings.storageKey)) || []

        logs.push(entry)

        if (logs.length > settings.maxStoredLogs) {
            logs.shift()
        }

        localStorage.setItem(settings.storageKey, JSON.stringify(logs))
    }

    function log(levelName, levelValue, message, data) {
        if (!shouldLog(levelValue)) return

        const timestamp = new Date().toISOString()

        const entry = {
            level: levelName,
            namespace,
            message,
            data: safeSerialize(data),
            ...(settings.showContext ? getContext(timestamp) : {})
        }

        persistLog(entry)

        console.groupCollapsed(
            `${timestamp} %c[${namespace}] %c${ellipsizeWords(message, 70)}`,
            levelName === 'ERROR'
                ? 'color:red;font-weight:bold'
                : levelName === 'WARN'
                    ? 'color:orange'
                    : levelName === 'INFO'
                        ? 'color:cyan'
                        : 'color:gray',
            'color:#888'
        )

        console.log(`%cFull Message:%c\n${message}`, "font-weight: bold;")
        if (data) console.log(`%cData:%c\n${data}`, "font-weight: bold;")
        if (settings.showContext) console.log('Context:', getContext(timestamp))

        console.groupEnd()
    }

    return {
        debug: (msg, data) =>
            log('DEBUG', LOG_LEVELS.DEBUG, msg, data),

        info: (msg, data) =>
            log('INFO', LOG_LEVELS.INFO, msg, data),

        warn: (msg, data) =>
            log('WARN', LOG_LEVELS.WARN, msg, data),

        error: (msg, data) =>
            log('ERROR', LOG_LEVELS.ERROR, msg, data)
    }
}
