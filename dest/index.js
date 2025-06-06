import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import { logger } from "./src/utils/logger.js";
import { defaultConfig } from "./src/typings/typings.js";
import { BaseAgent } from "./src/structures/BaseAgent.js";
import { Client, GatewayIntentBits } from 'discord.js';
import readline from 'readline';

const program = new Command();
const agent = new BaseAgent();


const bots = new Map();


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

process.on("unhandledRejection", (error) => {
    logger.error(error);
    logger.log("runtime", "Unhandled promise rejection");
}).on("uncaughtException", (error) => {
    logger.error(error);
    logger.log("runtime", "Uncaught exception");
});

program
    .name("BKI Auranest Discord OwO Selfbot")
    .description("BKI Kyou Izumi Auranest Discord OwO Selfbot")
    .version(JSON.parse(fs.readFileSync("./package.json", "utf-8")).version || "3.0.0");

program
    .option("-g, --generate <filename>", "Generate new data file for autorun")
    .option("-i, --import <filename>", "Import data file for autorun")
    .option("-d, --debug", "Enable debug mode")
    .option("-u, --update", "Whether to update directly (without prompt)")
    .action(async () => {
    if (program.opts().debug) {
        logger.logger.level = "debug";
        logger.info("Debug mode enabled!");
    }
    if (program.opts()?.generate) {
        const filename = typeof program.opts().generate === "string" ? program.opts().generate : "autorun.json";
        if (fs.existsSync(filename) && fs.statSync(filename).size > 0) {
            return logger.error(`File ${filename} already exists and is not empty!\nPlease remove it or specify another filename.`);
        }
        fs.writeFileSync(filename, JSON.stringify(defaultConfig, null, 4));
        logger.info(`File generated: ${path.resolve(filename)}`);
        return;
    }
 
    const configPath = "config.json";
    if (program.opts()?.import) {
        if (!fs.existsSync(program.opts().import))
            return logger.error(`File ${program.opts().import} does not exist!`);
        if (path.extname(program.opts().import) !== ".json")
            return logger.error(`File ${program.opts().import} is not a JSON file!`);
        const data = JSON.parse(fs.readFileSync(path.resolve(program.opts().import), "utf-8"));
        if (!data)
            return logger.error(`File ${program.opts().import} is empty!`);
        try {
            await agent.checkAccount(data.token);
            agent.run(data);
        }
        catch (error) {
            logger.error(error);
            logger.error("Failed to import data file");
        }
    }
    else {
    
        if (!fs.existsSync(configPath)) {
            logger.error(`Config file ${configPath} does not exist! Please create it first using: node index.js --generate config.json`);
            return;
        }
        try {
            const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
            if (!data) {
                logger.error(`Config file ${configPath} is empty!`);
                return;
            }
            if (!data.token) {
                logger.error("Token is missing in config.json! Please add your Discord token.");
                return;
            }
            await agent.checkAccount(data.token);
            agent.run(data);
        }
        catch (error) {
            logger.error(error);
            logger.error("Failed to read config file");
        }
    }
});


async function addBot(config) {
    const { username, token, guildID, channelID, adminID } = config;
    
 
    if (bots.has(username)) {
        logger.info(`Bot ${username} zaten mevcut, güncelleniyor...`);
        await removeBot(username);
    }

 
    const bot = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

  
    bot.once('ready', () => {
        logger.info(`Bot ${username} başlatıldı`);
      
        const botData = bots.get(username);
        if (botData) {
            botData.status = 'running';
            bots.set(username, botData);
        }
    });

    bot.on('messageCreate', async (message) => {
        if (message.author.bot) return;
        if (message.channel.id !== channelID[0]) return;

    
        if (message.content.toLowerCase() === 'owo hunt') {
            await message.channel.send('owo hunt');
        }
      
    });

  
    try {
        await bot.login(token);
        bots.set(username, {
            client: bot,
            config,
            status: 'starting'
        });
        logger.info(`Bot ${username} başlatıldı`);
    } catch (error) {
        logger.error(`Bot ${username} başlatılamadı:`, error);
        return false;
    }
    return true;
}


async function removeBot(username) {
    const botData = bots.get(username);
    if (!botData) return false;

    try {
        await botData.client.destroy();
        bots.delete(username);
        logger.info(`Bot ${username} kaldırıldı`);
        return true;
    } catch (error) {
        logger.error(`Bot ${username} kaldırılamadı:`, error);
        return false;
    }
}


rl.on('line', async (line) => {
    try {
        const command = JSON.parse(line);
        
        switch (command.type) {
            case 'ADD_BOT':
                await addBot(command.config);
                break;
            case 'REMOVE_BOT':
                await removeBot(command.username);
                break;
            default:
                logger.error('Bilinmeyen komut:', command.type);
        }
    } catch (error) {
        logger.error('Komut işleme hatası:', error);
    }
});


process.on('SIGINT', async () => {
    logger.info('Tüm botlar kapatılıyor...');
    for (const [username] of bots) {
        await removeBot(username);
    }
    process.exit(0);
});

program.parse(process.argv);
