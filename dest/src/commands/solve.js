import decryptCaptcha from "../security/decrypt.js";
const solveCommand = {
    name: "coz",
    description: "HCaptcha'yı tekrar çöz",
    execute: async (agent, message, ...args) => {
        if (!agent.captchaDetected)
            return message.reply("Captcha tespit edilmedi");
        try {
            await decryptCaptcha(message, agent.config);
            message.reply("✅ Captcha çözüldü!");
        }
        catch (error) {
            console.error(error);
            message.reply("❌ Captcha çözme girişimi başarısız oldu.");
        }
    }
};
export default solveCommand;
