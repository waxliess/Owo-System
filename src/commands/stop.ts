import { consoleNotify } from "../feats/notify.js"
import { Commands } from "../typings/typings.js"
import { logger } from "../utils/logger.js"

const stopCommand: Commands = {
    name: "durdur",
    description: "Aracı Durdur",
    execute: (agent, message, ...args) => {
        message.reply("Kapatılıyor...")
        logger.info("Kullanıcı DURDUR komutunu çalıştırdı, kapatılıyor...")

        consoleNotify(agent.totalCommands, agent.totalTexts, agent.totalCaptcha, agent.readyTimestamp ?? 0)
        return process.exit(0)
    }
}

export default stopCommand;