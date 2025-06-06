import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { checkbox, confirm, input, select } from "@inquirer/prompts";
import { logger } from "../utils/logger.js";
import { checkUpdate } from "../feats/update.js";
export class ConfigManager {
    folderPath = path.resolve(os.homedir(), "b2ki-ados");
    dataPath = path.resolve(this.folderPath, "data.json");
    static instance;
    rawData;
    agent;
    config = {};
    cache;
    // /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[a-zA-Z0-9_-]+$/g
    webhookRegex = /https:\/\/discord.com\/api\/webhooks\/\d{17,19}\/[a-zA-Z0-9_-]{60,68}/;
    audioRegex = /\.(mp3|wav|ogg|flac|aac|wma)$/;
    static getInstance(agent) {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager(agent);
        }
        return ConfigManager.instance.collectData();
    }
    constructor(agent) {
        this.agent = agent;
        if (!fs.existsSync(this.folderPath)) {
            fs.mkdirSync(this.folderPath, { recursive: true });
            fs.writeFileSync(this.dataPath, JSON.stringify({}, null, 4));
        }
        const oldPath = path.resolve(os.homedir(), "data", "data.json");
        if (fs.existsSync(oldPath)) {
            try {
                const data = fs.readFileSync(oldPath);
                fs.writeFileSync(path.resolve(this.dataPath), data);
            }
            catch (error) {
                logger.error("Failed to bring back old config");
                logger.error(error);
            }
            try {
                fs.rmdirSync(path.resolve(os.homedir(), "data"), { recursive: true });
            }
            catch (error) { }
        }
        this.rawData = JSON.parse(fs.readFileSync(this.dataPath, "utf-8"));
    }
    listAccount = (accounts) => {
        console.clear();
        return select({
            message: "Bir hesap seçin: ",
            choices: [
                ...Object.keys(accounts).map((id) => ({
                    name: accounts[id].username || accounts[id].tag || id,
                    value: accounts[id].token,
                })),
                {
                    name: "Yeni hesap (Token ile giriş)",
                    value: "token",
                },
                {
                    name: "Yeni hesap (QR kodu ile giriş)",
                    value: undefined,
                },
            ],
        });
    };
    accountAction = () => {
        console.clear();
        return select({
            message: "Bir eylem seçin: ",
            choices: [
                {
                    name: "Çalıştır",
                    value: "run",
                    disabled: this.cache ? false : "Hiçbir mevcut yapılandırma bulunamadı"
                },
                {
                    name: "Yapılandırmayı düzenle",
                    value: "edit",
                },
                {
                    name: "Yapılandırmayı otomatik çalıştırma dosyasına aktar",
                    value: "export",
                    disabled: this.cache ? false : "Hiçbir mevcut yapılandırma bulunamadı"
                },
                {
                    name: "Hesabı sil",
                    value: "delete",
                    disabled: this.cache ? false : "Hiçbir mevcut yapılandırma bulunamadı"
                },
            ],
        });
    };
    getToken = (cache) => {
        console.clear();
        return input({
            message: "Tokeninizi girin: ",
            validate: (token) => token.split(".").length === 3 ? true
                : "Geçersiz Token",
            default: cache
        });
    };
    listGuild = (cache) => {
        const guilds = this.agent.guilds.cache;
        console.clear();
        return select({
            message: "Farm yapılacak sunucuyu seçin: ",
            choices: [
                ...guilds.map((guild) => ({
                    name: guild.name,
                    value: guild
                }))
            ],
            default: cache ? guilds.get(cache) : undefined
        });
    };
    listChannel = (guild, cache) => {
        console.clear();
        return checkbox({
            required: true,
            message: "Farm yapılacak kanalları seçin (Birden fazla kanal seçilirse rastgele seçilecektir): ",
            choices: [
                ...guild.channels.cache.filter(c => c.type == "GUILD_TEXT").map((channel) => ({
                    name: channel.name,
                    value: channel.id,
                    checked: cache?.includes(channel.id)
                }))
            ],
        });
    };
    wayNotify = (cache) => {
        console.clear();
        return checkbox({
            message: "Bildirim almak istediğiniz yöntemi seçin: ",
            choices: [
                {
                    name: "[BETA] Bildirim penceresi",
                    value: "popup",
                },
                {
                    name: "Müzik",
                    value: "music",
                },
                {
                    name: "Webhook",
                    value: "webhook",
                },
                {
                    name: "Direkt mesaj (Sadece arkadaşlar)",
                    value: "dms",
                },
                {
                    name: "Arama (Sadece arkadaşlar)",
                    value: "call",
                }
            ].map(c => ({ ...c, checked: cache?.includes(c.value) }))
        });
    };
    musicNotify = (cache) => {
        console.clear();
        return input({
            message: "Müzik dosyasının yolunu girin: ",
            validate: (path) => {
                if (!fs.existsSync(path))
                    return "Dosya mevcut değil veya okunamıyor";
                const stat = fs.statSync(path);
                if (stat.isDirectory())
                    return true;
                return this.audioRegex.test(path) ? true : "Geçersiz müzik dosyası";
            },
            default: cache || path.resolve()
        });
    };
    musicNotify2 = (dir) => {
        console.clear();
        return select({
            message: "Bir müzik dosyası seçin: ",
            choices: [
                { name: "..", value: path.resolve(dir, ".."), description: "Önceki dizine dön" },
                ...(() => {
                    const subs = fs.readdirSync(dir);
                    if (!subs.length)
                        return [{ name: "Desteklenen müzik dosyası veya dizin bulunamadı", value: dir, disabled: true }];
                    return subs.map(sub => {
                        const subPath = path.resolve(dir, sub);
                        const name = fs.statSync(subPath).isDirectory() ? `${sub}\\\\` : sub;
                        return {
                            name,
                            value: subPath
                        };
                    });
                })()
            ]
        });
    };
    webhookURL = (cache) => {
        console.clear();
        return input({
            message: "Webhook URL'nizi girin: ",
            validate: (url) => this.webhookRegex.test(url) ? true : "Geçersiz Webhook URL'si",
            default: cache
        });
    };
    getAdminID = (cache) => {
        console.clear();
        const criticalWayNotify = ["call", "dms"].some(w => this.config.wayNotify.includes(w));
        const message = "Bildirim almak istediğiniz kullanıcı ID'sini girin: ";
        return input({
            required: criticalWayNotify || this.config.autoCookie,
            message,
            validate: async (id) => {
                if (!/^\d{17,19}$/.test(id))
                    return "Geçersiz Kullanıcı ID'si";
                if (this.config.wayNotify.includes("call") || this.config.wayNotify.includes("dms")) {
                    if (id == this.agent.user?.id)
                        return "Selfbot ID'si Call/DMs seçeneği için geçerli değildir";
                    const user = await this.agent.users.fetch(id).catch(() => null);
                    if (!user)
                        return "Kullanıcı bulunamadı";
                    switch (user.relationship.toString()) {
                        case "FRIEND":
                            return true;
                        case "PENDING_INCOMING":
                            return await user.sendFriendRequest().catch(() => "Arkadaşlık isteği gönderilemedi");
                        case "PENDING_OUTGOING":
                            return "Lütfen selfbot'un arkadaşlık isteğini kabul edin!";
                        default:
                            try {
                                await user.sendFriendRequest();
                                return "Lütfen selfbot'un arkadaşlık isteğini kabul edin!";
                            }
                            catch (error) {
                                return "Kullanıcıya arkadaşlık isteği gönderilemedi!";
                            }
                    }
                }
                return true;
            },
            default: cache
        });
    };
    captchaAPI = (cache) => {
        console.clear();
        return select({
            message: "Bir captcha çözme hizmeti seçin (Selfbot bir kez deneyecektir): ",
            choices: [
                {
                    name: "Atla",
                    value: undefined
                },
                {
                    name: "2Captcha",
                    value: "2captcha"
                },
                // {
                //     name: "AntiCaptcha",
                //     value: "anticaptcha" as Configuration["captchaAPI"],
                //     disabled: true
                // }
            ],
            default: cache
        });
    };
    getAPIKey = (cache) => {
        console.clear();
        return input({
            required: true,
            message: "API anahtarınızı girin: ",
            default: cache
        });
    };
    getPrefix = (cache) => {
        console.clear();
        return input({
            message: "Selfbot ön ekini girin, boş bırakmak için boşluk bırakın: ",
            validate: (answer) => {
                if (!answer)
                    return true;
                return /^[^0-9\s]{1,5}$/.test(answer) ? true : "Geçersiz ön ek";
            },
            default: cache
        });
    };
    gemUsage = (cache) => {
        console.clear();
        return select({
            message: "Gem kullanımını seçin: ",
            choices: [
                {
                    name: "Atla",
                    value: 0
                },
                {
                    name: "Fabled -> Common",
                    value: 1
                },
                {
                    name: "Common -> Fabled",
                    value: -1
                }
            ],
            default: cache
        });
    };
    prayCurse = (cache) => {
        console.clear();
        return checkbox({
            message: "Dua/lanet seçin (birden fazla seçilirse rastgele seçilecektir), boş bırakmak için boşluk bırakın: ",
            choices: [
                { name: "Selfbot hesabına dua", value: `pray` },
                { name: "Selfbot hesabına lanet", value: `curse` },
                ...(this.config.adminID ? [
                    { name: "Bildirim alıcısına dua", value: `pray ${this.config.adminID}` },
                    { name: "Bildirim alıcısına lanet", value: `curse ${this.config.adminID}` }
                ] : [])
            ].map(c => ({ ...c, checked: cache?.includes(c.value) })),
        });
    };
    quoteAction = (cache) => {
        console.clear();
        return checkbox({
            message: "Alıntı eylemini seçin: ",
            choices: [
                {
                    name: "OwO",
                    value: "owo"
                },
                {
                    name: "Alıntı",
                    value: "quote"
                },
            ].map(c => ({ ...c, checked: cache?.includes(c.value) })),
        });
    };
    otherAction = (cache) => {
        console.clear();
        return checkbox({
            message: "Ek komut eylemini seçin: ",
            choices: [
                {
                    name: "Çalıştır",
                    value: "run"
                },
                {
                    name: "Pup",
                    value: "pup"
                },
                {
                    name: "Piku",
                    value: "piku"
                },
            ].map(c => ({ ...c, checked: cache?.includes(c.value) })),
        });
    };
    trueFalse = (message, cache) => {
        console.clear();
        return confirm({
            message: message + ": ",
            default: cache
        });
    };
    saveData = (data) => fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 4));
    editConfig = async () => {
        this.config.username = this.agent.user?.username;
        this.config.token = this.agent.token;
        const guild = await this.listGuild(this.cache?.guildID);
        this.config.guildID = guild.id;
        this.config.channelID = await this.listChannel(guild, this.cache?.channelID);
        this.config.wayNotify = await this.wayNotify(this.cache?.wayNotify);
        if (this.config.wayNotify.includes("music")) {
            this.config.musicPath = await this.musicNotify(this.cache?.musicPath);
            while (fs.statSync(this.config.musicPath).isDirectory()) {
                this.config.musicPath = await this.musicNotify2(this.config.musicPath);
            }
        }
        if (this.config.wayNotify.includes("webhook"))
            this.config.webhookURL = await this.webhookURL(this.cache?.webhookURL);
        if (["webhook", "dms", "call"].some(w => this.config.wayNotify.includes(w)))
            this.config.adminID = await this.getAdminID(this.cache?.adminID);
        this.config.captchaAPI = await this.captchaAPI(this.cache?.captchaAPI);
        if (this.config.captchaAPI)
            this.config.apiKey = await this.getAPIKey(this.cache?.apiKey);
        this.config.prefix = await this.getPrefix(this.cache?.prefix);
        this.config.autoGem = await this.gemUsage(this.cache?.autoGem);
        if (this.config.autoGem)
            this.config.autoCrate = await this.trueFalse("Otomatik olarak Gem Kasa kullan", this.cache?.autoCrate);
        if (this.config.autoGem)
            this.config.autoFCrate = await this.trueFalse("Otomatik olarak Fabled Kasa kullan", this.cache?.autoFCrate);
        this.config.autoCookie = await this.trueFalse("Otomatik olarak Çerez gönder", this.cache?.autoCookie);
        this.config.autoClover = await this.trueFalse("Otomatik olarak Yonca gönder", this.cache?.autoClover);
        if ((this.config.autoCookie || this.config.autoClover) && (!this.config.adminID || this.config.adminID.length === 0))
            this.config.adminID = await this.getAdminID(this.cache?.adminID);
        this.config.autoOther = await this.otherAction(Array.isArray(this.cache?.autoOther) ? this.cache?.autoOther : undefined);
        this.config.autoQuote = await this.quoteAction(Array.isArray(this.cache?.autoQuote) ? this.cache.autoQuote : undefined);
        this.config.autoPray = await this.prayCurse(this.cache?.autoPray);
        this.config.autoDaily = await this.trueFalse("Otomatik olarak Günlük Ödülü talep et", this.cache?.autoDaily);
        this.config.autoSell = await this.trueFalse("Otomatik olarak Nakit bittiğinde sat", this.cache?.autoSell);
        this.config.autoSleep = await this.trueFalse("Otomatik olarak Belirli zamanlarda duraklat", this.cache?.autoSleep);
        this.config.autoReload = await this.trueFalse("Otomatik olarak Günlük olarak yapılandırmayı yenile", this.cache?.autoReload);
        this.config.showRPC = await this.trueFalse("Discord Zengin Durumunu göster", this.cache?.showRPC);
        this.config.autoResume = await this.trueFalse("Otomatik olarak Captcha çözüldükten sonra devam et", this.cache?.autoResume);
        this.config.token = this.agent.token;
    };
    collectData = async () => {
        console.clear();
        await checkUpdate();
        if (Object.keys(this.rawData).length === 0) {
            const confirm = await this.trueFalse("Telif hakkı 2021-2025 © Eternity_VN [Kyou Izumi] x aiko-chan-ai [Elysia]. Tüm hakları saklıdır."
                + "\nAuranest sunnucuna özel oalrak geliştirilmiştir. bewrq size bayram hediyesi olarak sunulmuştur. asdasdpğasdpğaspğ amk "
                + "\nBu modülü kullanarak, kullanım koşullarımızı kabul etmiş olursunuz ve ilgili riskleri kabul edersiniz."
                + "\nLütfen unutmayın ki, araçlarımızın kullanımı nedeniyle hesapların yasaklanması durumunda sorumluluk kabul etmiyoruz."
                + "\nDevam etmek istiyor musunuz?", false);
            if (!confirm)
                process.exit(0);
        }
        let account = await this.listAccount(this.rawData);
        switch (account) {
            case undefined:
                break;
            case "token":
                account = await this.getToken();
            default:
                this.cache = this.rawData[Buffer.from(account.split(".")[0], "base64").toString("utf-8")];
        }
        try {
            await this.agent.checkAccount(account);
        }
        catch (error) {
            logger.error(error);
            logger.warn("Giriş başarısız, lütfen tekrar deneyin");
            process.exit(-1);
        }
        if (!this.cache)
            await this.editConfig();
        else
            switch (await this.accountAction()) {
                case "run":
                    this.config = this.cache;
                    break;
                case "edit":
                    await this.editConfig();
                    break;
                case "export":
                    const exportPath = path.resolve(process.cwd(), this.agent.user?.username + ".json");
                    fs.writeFileSync(exportPath, JSON.stringify(this.cache || this.config, null, 4));
                    logger.info("Yapılandırma " + exportPath + " konumuna aktarıldı");
                    process.exit(0);
                case "delete":
                    if (this.rawData[String(this.agent.user?.id)]) {
                        delete this.rawData[String(this.agent.user?.id)];
                        fs.writeFileSync(this.dataPath, JSON.stringify(this.rawData, null, 4));
                        logger.info("Hesap silindi");
                    }
                    else
                        logger.warn("Bu hesap için mevcut yapılandırma bulunamadı, silme işlemi atlandı");
                    process.exit(0);
            }
        this.rawData[String(this.agent.user?.id)] = this.config;
        this.saveData(this.rawData);
        logger.info("Veriler " + this.dataPath + " konumuna kaydedildi");
        return this.config;
    };
}
export const InquirerConfig = ConfigManager.getInstance;
