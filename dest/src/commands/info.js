import { timeHandler } from "../utils/utils.js";
const infoCommand = {
    name: "info",
    description: "Araç Bilgisi",
    execute: (agent, message, ...args) => {
        const status = `__Durum:__ ${agent.captchaDetected ? agent.paused ? "**DURAKLATILDI**" : "**CAPTCHA BEKLENİYOR**" : "AVLANIYOR"}`;
        const summary = `__Toplam komut/metin gönderildi:__ **${agent.totalCommands}/${agent.totalTexts}**`;
        const captchaSum = `__Çözülen/Çözülemeyen Captcha:__ **${agent.totalCaptcha.resolved}/${agent.totalCaptcha.unsolved}**`;
        const uptime = `__Toplam aktif süre:__ ${timeHandler(agent.readyTimestamp ?? 0, Date.now())}`;
        message.reply([status, summary, uptime].join("\n"));
    }
};
export default infoCommand;
