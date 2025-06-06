import { Client, RichPresence, User } from "discord.js-selfbot-v13";

/**
 * Boru botu için özel olarak bot ID'si sabitlendi.
 * Boru botunun profil resmi ve adı etkinlikte gösterilecek.
 */
export const loadPresence = async (client: Client) => {
    const botId = "1321706780941615174"; // Boru botunun ID'si
    let avatarURL: string | undefined = undefined;
    let displayName: string | undefined = undefined;

    try {
        const botUser = await client.users.fetch(botId) as User;
        avatarURL = botUser.avatarURL?.() || botUser.displayAvatarURL?.() || undefined;
        displayName = botUser.username;
    } catch (e) {
        avatarURL = client.user?.avatarURL?.() || client.user?.displayAvatarURL?.() || undefined;
        displayName = client.user?.username;
    }

    const rpc = new RichPresence(client)
        .setApplicationId("1321706780941615174")
        .setType("PLAYING")
        .setName("Auranest Discord")
        .setDetails("Auranest topluluğu ile birlikte!")
        .setStartTimestamp(client.readyTimestamp ?? Date.now())
        .setAssetsLargeImage(avatarURL || "1321706780941615174")
        .setAssetsLargeText("Auranest ile aktif!")
        .addButton("Discord Sunucusu", "https://discord.gg/auranest")
        .addButton("Topluluk", "https://discord.gg/auranest");
    client.user?.setPresence({ activities: [rpc] })
}