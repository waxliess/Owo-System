const reloadCommand = {
    name: "reload",
    description: "Yapılandırmayı Yenile",
    execute: async (agent, message, ...args) => {
        const attempt = await agent.aReload(true);
        if (attempt)
            message.reply("Yapılandırma başarıyla yenilendi");
        else
            message.reply("Yapılandırma yenilenemedi");
    }
};
export default reloadCommand;
