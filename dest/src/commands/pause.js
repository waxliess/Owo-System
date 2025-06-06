import { logger } from "../utils/logger.js";
const pauseCommand = {
    name: "pause",
    description: "Aracı Duraklat",
    execute: (agent, message, ...args) => {
        if (agent.captchaDetected) {
            message.reply(agent.paused
                ? "Araç zaten duraklatıldı!"
                : "**İŞLEM GEREKLİ!** Aracı duraklatmadan önce captcha'yı çözmelisiniz");
        }
        else {
            agent.captchaDetected = true;
            agent.paused = true;
            logger.info("Araç duraklatıldı (kullanıcı isteği)");
            message.reply("Araç duraklatıldı!");
        }
    }
};
export default pauseCommand;
