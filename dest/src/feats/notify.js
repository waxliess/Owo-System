import chalk from "chalk";
import { logger } from "../utils/logger.js";
import { timeHandler } from "../utils/utils.js";
import { Notifier } from "../structures/Notifier.js";
export const consoleNotify = (commandsCount, textsCount, captchaCount, readyTimestamp) => {
    logger.log("data", "");
    logger.log("data", chalk.greenBright("Gönderilen toplam komut: ") + commandsCount);
    logger.log("data", chalk.greenBright("Gönderilen toplam mesaj: ") + textsCount);
    logger.log("data", chalk.greenBright("Çözülen Toplam Captcha: ") + captchaCount.resolved);
    logger.log("data", chalk.redBright("Çözülemeyen Toplam Captcha: ") + captchaCount.unsolved);
    logger.log("data", chalk.greenBright("Toplam aktif süre: ") + timeHandler(readyTimestamp, Date.now()));
    logger.log("data", chalk.cyanBright("SELFBOT SONLANDIRILDI!"));
    logger.log("data", "");
};
export const selfbotNotify = (message, config, solved = false) => new Notifier(message, config, solved).notify();
