const pingCommand = {
    name: "ping",
    description: "Araç Web Sitesi Servisi Ping",
    execute: (agent, message, args) => {
        message.reply(`Pong! ${message.client.ws.ping}ms~`);
    }
};
export default pingCommand;
