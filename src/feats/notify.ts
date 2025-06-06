import chalk from "chalk"
import { Message } from "discord.js-selfbot-v13"

import { logger } from "../utils/logger.js"
import { timeHandler } from "../utils/utils.js"
import { Notifier } from "../structures/Notifier.js"
import { Configuration } from "../typings/typings.js"

export const consoleNotify = (commandsCount:number, textsCount: number, captchaCount: { resolved: number, unsolved: number}, readyTimestamp: number) => {
    logger.log("data", "")
    logger.log("data", chalk.greenBright("Gönderilen toplam komut: ") + commandsCount)
    logger.log("data", chalk.greenBright("Gönderilen toplam mesaj: ") + textsCount)
    logger.log("data", chalk.greenBright("Çözülen Toplam Captcha: ") + captchaCount.resolved)
    logger.log("data", chalk.redBright("Çözülemeyen Toplam Captcha: ") + captchaCount.unsolved)
    logger.log("data", chalk.greenBright("Toplam aktif süre: ") + timeHandler(readyTimestamp, Date.now()))
    logger.log("data", chalk.cyanBright("SELFBOT SONLANDIRILDI!"))
    logger.log("data", "")
}

export const selfbotNotify = (message: Message, config: Configuration, solved = false) => new Notifier(message, config, solved).notify()