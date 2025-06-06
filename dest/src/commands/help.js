const helpCommand = {
    name: "help",
    description: "Araç Komutlarının Listesi",
    execute: (agent, message, ...args) => {
        let document = "";
        for (const command of agent.commands.keys())
            document += `**${command}:** ${agent.commands.get(command)?.description}\n`;
        document += "Yardım için destek sunucumuza katılın: discord.gg/auranest ";
        if (args[0])
            message.reply(agent.commands.keys().some(command => (command == args[0]))
                ? `**${args[0]}:** ${agent.commands.get(args[0])?.description}`
                : "Komut Bulunamadı!");
        else
            message.reply(document);
    }
};
export default helpCommand;
