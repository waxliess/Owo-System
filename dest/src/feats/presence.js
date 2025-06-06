import { RichPresence } from "discord.js-selfbot-v13";
/**
 * 
 * 
 */
export const loadPresence = async (client) => {
    const botId = "1321706780941615174"; 
    let avatarURL = undefined;
    let displayName = undefined;
    try {
        const botUser = await client.users.fetch(botId);
        avatarURL = botUser.avatarURL?.() || botUser.displayAvatarURL?.() || undefined;
        displayName = botUser.username;
    }
    catch (e) {
        avatarURL = client.user?.avatarURL?.() || client.user?.displayAvatarURL?.() || undefined;
        displayName = client.user?.username;
    }
    const rpc = new RichPresence(client)
        .setApplicationId("1321706780941615174")
        .setType("PLAYING")
        .setName("Auranest Discord")
        .setDetails(".gg/auranest ile Owo oynuyor")
        .setStartTimestamp(client.readyTimestamp ?? Date.now())
        .setAssetsLargeImage(avatarURL || "1321706780941615174")
        .setAssetsLargeText("Auranest ile birlikte! owo kasıyor")
        .addButton("Discord Sunucusu", "https://discord.gg/auranest")
        .addButton("Topluluk", "https://discord.gg/auranest");
    client.user?.setPresence({ activities: [rpc] });
};