const sendCommand = {
    name: "gonder",
    description: "Birine para gönder",
    execute: (agent, message, ...args) => {
        try {
            if (message.channel.type == "DM" || message.channel.type == "GROUP_DM")
                return message.reply("Bu komutu bir sunucuda göndermelisiniz");
            if (!args || args.length < 2)
                return message.reply("Birini etiketlemeli ve gönderilecek cowoncy miktarını yazmalısınız");
            const target = message.mentions.members?.first();
            const owo = message.guild?.members.cache.get(agent.owoID);
            if (!target)
                return message.reply("Cowoncy göndermek için bir kullanıcı etiketlemelisiniz");
            if (!owo)
                return message.reply("OwO botu bulunamadı!");
            if (!args[1]?.match(/^[0-9]+$/))
                return message.reply("Gönderilecek cowoncy miktarını girmelisiniz");
            message.channel.send(`owo send <@!${target.id}> ${args[1]}`);
            message.channel.createMessageCollector({
                filter: (msg) => msg.author.id == agent.owoID && msg.embeds.length > 0 && msg.embeds[0].author?.name.includes(msg.guild?.members.me?.displayName) && msg.embeds[0].author?.name.includes(target.displayName) && msg.components.length > 0,
                max: 1, time: 10_000
            }).once("collect", async (m) => { await m.clickButton({ X: 0, Y: 0 }); });
        }
        catch (error) {
            message.reply("Komut çalıştırılamadı");
            console.error(error);
        }
    }
};
export default sendCommand;
