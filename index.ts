import { Command } from "commander"
import fs from "node:fs"
import path from "node:path"
import { Client } from "discord.js-selfbot-v13"

import { logger } from "./src/utils/logger.js"
import { Configuration, defaultConfig } from "./src/typings/typings.js"

import { BaseAgent } from "./src/structures/BaseAgent.js"

const program = new Command()
const agent = new BaseAgent()


const activeBots = new Map<string, BaseAgent>()


const dbDir = path.join(__dirname, "database", "kimlikadi")


if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
    logger.info("Database klasörü oluşturuldu: database/kimlikadi")
}


async function validateToken(token: string): Promise<boolean> {
    try {
        const client = new Client()
        await client.login(token)
        await client.destroy()
        return true
    } catch (error: any) {
        logger.error(`Token hatası: ${error.message}`)
        return false
    }
}


function removeInvalidToken(username: string) {
    const filePath = path.join(dbDir, `${username}.json`)
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            logger.warn(`🗑️ [${username}] Hatalı token dosyası silindi`)
        }
    } catch (error: any) {
        logger.error(`❌ [${username}] Token dosyası silinemedi: ${error.message || 'Bilinmeyen hata'}`)
    }
}


async function startBot(username: string, config: Configuration) {
    try {
    
        const isValid = await validateToken(config.token)
        if (!isValid) {
            logger.warn(`⚠️ [${username}] Geçersiz token tespit edildi`)
            removeInvalidToken(username)
            return
        }

        const agent = new BaseAgent()
        await agent.run(config)
        activeBots.set(username, agent)
        logger.info(`✅ [${username}] Bot başarıyla başlatıldı`)
    } catch (error: any) {
        logger.error(`❌ [${username}] Bot başlatılamadı: ${error.message || 'Bilinmeyen hata'}`)
        if (error.message && error.message.includes('TOKEN_INVALID')) {
            removeInvalidToken(username)
        }
    }
}


function stopBot(username: string) {
    const agent = activeBots.get(username)
    if (agent) {
        try {
            // @ts-ignore
            agent.stop?.()
        } catch (error) {
            logger.warn(`⚠️ [${username}] Bot durdurulurken hata oluştu`)
        }
        activeBots.delete(username)
        logger.info(`🛑 [${username}] Bot durduruldu`)
    }
}


async function startAllBots() {
    try {
        const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.json'))
        
        if (files.length === 0) {
            logger.info("📁 Database klasöründe hiç token dosyası bulunamadı!")
            logger.info("📝 Yeni token eklemek için database/kimlikadi klasörüne .json dosyası ekleyin.")
            return
        }

        logger.info(`📊 Toplam ${files.length} token dosyası bulundu.`)
        
        for (const file of files) {
            const username = file.replace('.json', '')
            const configPath = path.join(dbDir, file)
            
            try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Configuration
                await startBot(username, config)
            } catch (error: any) {
                logger.error(`❌ [${username}] Dosya okunamadı: ${error.message || 'Bilinmeyen hata'}`)
                removeInvalidToken(username)
            }
        }

      
        const remainingFiles = fs.readdirSync(dbDir).filter(f => f.endsWith('.json'))
        if (remainingFiles.length === 0) {
            logger.info("📁 Tüm token dosyaları işlendi, sistem bekliyor...")
        }
    } catch (error: any) {
        logger.error(`❌ Bot başlatma hatası: ${error.message || 'Bilinmeyen hata'}`)
        logger.info("🔄 Sistem yeniden başlatılıyor...")
        setTimeout(startAllBots, 5000) 
    }
}


fs.watch(dbDir, async (eventType, filename) => {
    if (!filename) return
    
    const username = filename.replace('.json', '')
    const filePath = path.join(dbDir, filename)

    if (eventType === 'rename') {

        if (!fs.existsSync(filePath)) {
            stopBot(username)
            logger.info(`🗑️ [${username}] Token dosyası silindi`)
            return
        }
    }

    if (fs.existsSync(filePath)) {
        try {
            const config = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Configuration
            

            if (activeBots.has(username)) {
                stopBot(username)
            }
            

            await startBot(username, config)
        } catch (error: any) {
            logger.error(`❌ [${username}] Dosya işlenemedi: ${error.message || 'Bilinmeyen hata'}`)
            removeInvalidToken(username)
        }
    }
})


logger.info("🚀 OWO Bot Sistemi başlatılıyor...")
startAllBots().catch((error: any) => {
    logger.error(`❌ Başlangıç hatası: ${error.message || 'Bilinmeyen hata'}`)
    logger.info("🔄 Sistem yeniden başlatılıyor...")
    setTimeout(startAllBots, 5000) 
})


process.on("unhandledRejection", (error: any) => {
    logger.error(`❌ Beklenmeyen hata: ${error.message || 'Bilinmeyen hata'}`)
    logger.info("🔄 Sistem çalışmaya devam ediyor...")
}).on("uncaughtException", (error: any) => {
    logger.error(`❌ Kritik hata: ${error.message || 'Bilinmeyen hata'}`)
    logger.info("🔄 Sistem çalışmaya devam ediyor...")
})

program
    .name("BKI Auranest Discord OwO Selfbot")
    .description("BKI Kyou Izumi Auranest Discord OwO Selfbot")
    .version(JSON.parse(fs.readFileSync("./package.json", "utf-8")).version || "3.0.0")

program
    .option("-g, --generate <filename>", "Generate new data file for autorun")
    .option("-i, --import <filename>", "Import data file for autorun")
    .option("-d, --debug", "Enable debug mode")
    .option("-u, --update", "Whether to update directly (without prompt)")
    .action(async () => {
        if (program.opts().debug) {
            logger.logger.level = "debug"
            logger.info("Debug mode enabled!")
        }
                
        if (program.opts()?.generate) {
            const filename = typeof program.opts().generate === "string" ? program.opts().generate : "autorun.json"
            if (fs.existsSync(filename) && fs.statSync(filename).size > 0) {
                return logger.error(`File ${filename} already exists and is not empty!\nPlease remove it or specify another filename.`)
            }

            fs.writeFileSync(filename, JSON.stringify(defaultConfig, null, 4))
            logger.info(`File generated: ${path.resolve(filename)}`)
            return;
        }


        const configPath = "config.json"

        if (program.opts()?.import) {
            if (!fs.existsSync(program.opts().import)) return logger.error(`File ${program.opts().import} does not exist!`)
            if (path.extname(program.opts().import) !== ".json") return logger.error(`File ${program.opts().import} is not a JSON file!`)

            const data = JSON.parse(fs.readFileSync(path.resolve(program.opts().import), "utf-8")) as Configuration
            if (!data) return logger.error(`File ${program.opts().import} is empty!`);

            try {
                await agent.checkAccount(data.token);
                agent.run(data)
            } catch (error) {
                logger.error(error as Error)
                logger.error("Failed to import data file")
            }
        } else {
     
            if (!fs.existsSync(configPath)) {
                logger.error(`Config file ${configPath} does not exist! Please create it first using: node index.js --generate config.json`)
                return
            }

            try {
                const data = JSON.parse(fs.readFileSync(configPath, "utf-8")) as Configuration
                if (!data) {
                    logger.error(`Config file ${configPath} is empty!`)
                    return
                }

                if (!data.token) {
                    logger.error("Token is missing in config.json! Please add your Discord token.")
                    return
                }

                await agent.checkAccount(data.token)
                agent.run(data)
            } catch (error) {
                logger.error(error as Error)
                logger.error("Failed to read config file")
            }
        }
    })

program.parse(process.argv)