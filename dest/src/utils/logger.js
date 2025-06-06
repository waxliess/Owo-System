import chalk from "chalk";
import { createLogger, format, transports } from "winston";
class CustomLogger {
    logger;
    static instance;
    constructor() {
        const { combine, printf, timestamp, errors, uncolorize } = format;
        const levelFormats = {
            alert: chalk.red("[UYARI]"),
            error: chalk.redBright("[HATA]"),
            runtime: chalk.blue("[ÇALIŞMA]"),
            warn: chalk.yellowBright("[UYARI]"),
            info: chalk.cyanBright("[BİLGİ]"),
            sent: chalk.greenBright("[GÖNDERİLDİ]"),
            debug: chalk.blackBright("[HATA AYIKLAMA]"),
        };
        const consoleFormat = printf(({ level, message, timestamp, stack }) => {
            const formattedTimestamp = chalk.bgYellow.black(timestamp);
            const levelLabel = levelFormats[level] || chalk.magenta(`[${level.toUpperCase()}]`);
            return stack
                ? `${formattedTimestamp} ${levelLabel} ${message}\n${chalk.redBright(stack)}`
                : `${formattedTimestamp} ${levelLabel} ${level == "debug" ? chalk.blackBright(message) : message}`;
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
            format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true })),
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
    }
    static getInstance() {
        if (!CustomLogger.instance) {
            CustomLogger.instance = new CustomLogger();
        }
        return CustomLogger.instance;
    }
    log(level, message) {
        if (message instanceof Error) {
            this.logger.log(level, message.message, { stack: message.stack });
        }
        else {
            this.logger.log(level, message);
        }
    }
    alert(message) {
        this.log("alert", message);
    }
    error(message) {
        this.log("error", message);
    }
    warn(message) {
        this.log("warn", message);
    }
    info(message) {
        this.log("info", message);
    }
    sent(message) {
        this.log("sent", message);
    }
    debug(message) {
        this.log("debug", message);
    }
}
export const logger = CustomLogger.getInstance();
