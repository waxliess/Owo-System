const sayCommand = {
    name: "say",
    description: "Araca komut ver/mesaj söylettir",
    execute: (agent, message, ...args) => {
        message.channel.send(args.join(" "));
    }
};
export default sayCommand;
