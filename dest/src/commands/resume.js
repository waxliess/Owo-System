const resumeCommand = {
    name: "resume",
    description: "Aracı Devam Ettir",
    execute: (agent, message, ...args) => {
        if (agent.paused) {
            agent.paused = false;
            agent.captchaDetected = false;
            message.reply("Araç birkaç saniye içinde devam edecek!");
            agent.main();
        }
        else
            message.reply(agent.captchaDetected
                ? "**İŞLEM GEREKLİ!** Aracı devam ettirmeden önce captcha'yı çözmelisiniz"
                : "Araç duraklatılmamış!");
    }
};
export default resumeCommand;
