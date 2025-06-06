import { Message, MessageEmbed, WebhookClient } from "discord.js-selfbot-v13"
import { Configuration, NotifierCondition, popupOptions } from "../typings/typings.js"
import { exec, spawn } from "child_process"
import { logger } from "../utils/logger.js"
import notifier from "node-notifier"
import path from "path"


const createMusic = (musicPath: string) => {
    let command = ""
    switch (process.platform) {
        case "win32": command = `start ""`; break;
        case "linux": command = `xdg-open`; break;
        case "darwin": command = `afplay`; break;
        case "android": command = `termux-media-player play`; break;
        default: throw new Error("Desteklenmeyen Platform");
    }
    command += ` "${musicPath}"`
    return spawn(command, { shell: true, detached: true }).unref()
}

const createPopUp = async (timestamp = Date.now(), url: string) => {
    return notifier.notify(
        {
            title: "CAPTCHA TESPİT EDİLDİ!",
            message: "Lütfen captcha'yı şu zamana kadar çözün: " + new Date(timestamp + 10 * 60 * 1000).toLocaleString(),
            icon: path.resolve("doc/B2KI.png"),
            wait: true,
            ...(() => {
                switch (process.platform) {
                    case "win32":
                        return {
                            appID: "[B2KI] Gelişmiş Discord OwO Tool Farm",
                            id: 1266,
                            sound: "Notification.Looping.Call",
                        }
                    case "darwin":
                        return {
                            sound: true,
                        }
                    default:
                        return {}
                }
            })()
        }, (err, response, metadata) => {
            if (err) {
                logger.error("Popup bildirimi gösterilirken hata oluştu")
                logger.error(err as Error)
            }
            if (response != "dismissed" && response != "timeout") exec(`start ${url}`).unref()
        }
    )
}

export class Notifier {
    private message: Message
    private config: Configuration
    private status: boolean = false
    private attachmentUrl?: string
    private content: string
    private unixTime: string

    constructor(message: Message, config: Configuration, solved = false) {
        this.unixTime = `<t:${Math.floor(message.createdTimestamp / 1000 + 600)}:f>`
        this.message = message
        this.config = config
        this.status = solved
        this.attachmentUrl = message.attachments.first()?.url
        this.content = `${config.adminID ? `<@${config.adminID}>` : ""} Kanalda Captcha Bulundu: ${message.channel.toString()}`
    }

    public playSound = async () => {
        if (!this.config.musicPath) return logger.debug("Müzik yolu bulunamadı, ses bildirimi atlanıyor")
        try {
            createMusic(this.config.musicPath)
        } catch (error) {
            logger.error("Ses bildirimi çalınırken hata oluştu")
            logger.error(error as Error)
        }
    }

    public sendWebhook = async () => {
        if (!this.config.webhookURL) return logger.debug("Webhook URL bulunamadı, webhook bildirimi atlanıyor");
        try {
            const webhook = new WebhookClient({ url: this.config.webhookURL })
            const embed = new MessageEmbed()
                .setTitle("CAPTCHA TESPİT EDİLDİ!")
                .setURL(this.message.url)
                .setImage("https://i.imgur.com/yHoYHkl.png")
                .setDescription("**Durum**: " + (this.status ? "<a:Onay:1287533035364810854>  **ÇÖZÜLDÜ**" : "<a:asdsad:1287736575161008149>  <a:asdsad:1287736575161008149>  **ÇÖZÜLMEDİ** <a:asdsad:1287736575161008149>  <a:asdsad:1287736575161008149> "))
                .addFields([
                    { name: "Captcha türü: ", value: this.attachmentUrl ? `[Resimli Captcha](${this.message.url})` : "[Link Captcha](https://owobot.com/captcha)" }
                ])
                .setColor(this.status ? "GREEN" : "RED")
                .setFooter({ text: "Copyright © madé by Bewrq 2024", iconURL: this.message.guild?.iconURL({ format: "png" }) ?? "https://i.imgur.com/EqChQK1.png" })
                .setTimestamp()

            if (this.attachmentUrl) embed.setImage(this.attachmentUrl)
            if (!this.status) embed.addFields({ name: "Lütfen captcha'yı şu zamana kadar çözün: ", value: this.unixTime })

            webhook.send({
                avatarURL: this.message.client.user?.avatarURL({ dynamic: true }) ?? "https://cdn.discordapp.com/avatars/1321706780941615174/a_55bb24fc2f73459abcca038b76baecde.gif?size=1024",
                username: "Bewrq.xd",
                content: (this.config.adminID ? `<@${this.config.adminID}>` : "" + this.content),
                embeds: embed ? [embed] : embed
            })
        } catch (error) {
            logger.error("Webhook bildirimi gönderilirken hata oluştu")
            logger.error(error as Error)
        }
    }

    public sendDM = async () => {
        if (!this.config.adminID) return logger.debug("Admin ID bulunamadı, DM bildirimi atlanıyor")
        const admin = this.message.client.users.cache.get(this.config.adminID)

        if (!admin) return logger.debug("Admin bulunamadı, DM bildirimi atlanıyor")
        try {
            if (!admin.dmChannel) await admin.createDM()
            await admin.send({
                content: (this.content + "\n**Durum**: " + (this.status ? "<a:Onay:1287533035364810854>  **ÇÖZÜLDÜ**" : "<a:asdsad:1287736575161008149>  <a:asdsad:1287736575161008149>  **ÇÖZÜLMEDİ** <a:asdsad:1287736575161008149>  <a:asdsad:1287736575161008149> ")),
                files: this.attachmentUrl ? [this.attachmentUrl] : []
            })
        } catch (error) {
            logger.error("DM bildirimi gönderilirken hata oluştu")
            logger.error(error as Error)
        }
    }

    public callDM = async () => {
        if (!this.config.adminID) return logger.debug("Admin ID bulunamadı, arama bildirimi atlanıyor")
        const admin = this.message.client.users.cache.get(this.config.adminID)

        if (!admin) return logger.debug("Admin bulunamadı, DM bildirimi atlanıyor")
        try {
            const DM = await admin.createDM();
            await this.message.client.voice.joinChannel(DM, {
                selfVideo: false,
                selfDeaf: false,
                selfMute: true,
            }).then(connection => setTimeout(() => connection.disconnect(), 60000));
            await DM.ring()
        } catch (error: Error | any) {
            logger.error("Kullanıcı aranırken hata oluştu")
            logger.error(error)
        }
    }

    public popUp = async () => {
        try {
            const message = "CAPTCHA TESPİT EDİLDİ! Lütfen captcha'yı şu zamana kadar çözün: " + new Date(this.message.createdTimestamp + 10 * 60 * 1000).toLocaleString()
            if (process.platform == "android") {
                return spawn("termux-notification", [
                    "--title", "CAPTCHA TESPİT EDİLDİ!", 
                    "--content", message, 
                    "--priority", "high", 
                    "--sound", "--ongoing", 
                    "--vibrate", "1000,1000,1000,1000,1000",
                    "--id", "1266",
                    "--action", `termux-open-url ${this.message.url}`,
                ]).unref()
            } else if(process.platform == "win32" || process.platform == "darwin" || process.platform == "linux") {
                return createPopUp(this.message.createdTimestamp, this.message.url.replace("https", "discord"))
            } else throw new Error("Desteklenmeyen Platform")
        } catch (error) {
            logger.error("Popup bildirimi gösterilirken hata oluştu")
            logger.error(error as Error)
        }
    }

    public notify = async () => {
        const wayNotify = this.config.wayNotify
        logger.debug("Etkinleştirilmiş bildirimler: " + wayNotify.join(", "))

        const notifier: NotifierCondition[] = [
            {
                condition: "music",
                callback: this.playSound
            },
            {
                condition: "webhook",
                callback: this.sendWebhook
            },
            {
                condition: "dms",
                callback: this.sendDM
            },
            {
                condition: "call",
                callback: this.callDM
            },
            {
                condition: "popup",
                callback: this.popUp
            }
        ]

        for (const { condition, callback } of notifier)
            if (wayNotify.includes(condition)) callback()
    }
}