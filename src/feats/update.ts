import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import axios from "axios"
import { confirm } from "@inquirer/prompts"
import { logger } from "../utils/logger.js"
import { exec, execSync, spawn } from "node:child_process"
import AdmZip from "adm-zip"
import { copyDirectory } from "../utils/utils.js"
import { promisify } from "node:util"

class selfUpdate {
    baseHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537'
    }

    constructor() {
        this.checkUpdate = this.checkUpdate.bind(this)
    }

    public async checkUpdate() {
        logger.info("Güncellemeler kontrol ediliyor...")

        const { version: currentVersion } = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"))
        const { data: { version: latestVersion } } = await axios.get("https://github.com/Bewrq/Auranest-owo-_system/raw/refs/heads/main/package.json", {
            headers: this.baseHeaders
        })
        if (currentVersion < latestVersion) {
            logger.info(`Yeni sürüm mevcut: v${latestVersion} (şu anki: v${currentVersion})`)

            const result = await confirm({
                message: "Güncellemek ister misiniz?",
                default: true
            });
            if (result) {
                logger.info("Güncelleniyor...")
                await this.performUpdate()

                logger.info("Kütüphaneler yükleniyor...")
                await this.installDependencies()

                logger.info("Güncelleme tamamlandı!")
                this.restart()
            }
        } else {
            logger.info(`En güncel sürümü kullanıyorsunuz: ${currentVersion}`)
        }
    }

    private performUpdate = async () => {
        if (fs.existsSync(".git")) {
            try {
                execSync("git --version")
                logger.info("Git tespit edildi, Git ile güncelleniyor!")
                await this.gitUpdate()
            } catch (error) {
                logger.info("Git bulunamadı, manuel güncelleniyor...")
                await this.manualUpdate()
            }
        } else {
            await this.manualUpdate()
        }
    }

    public gitUpdate = async () => {
        try {
            logger.debug("Yerel değişiklikler kaydediliyor...");
            execSync("git stash");
            logger.debug("Son değişiklikler Git'ten çekiliyor...");
            execSync("git pull --force");
            logger.debug("En son commite sıfırlanıyor...");
            execSync("git reset --hard");
        } catch (error) {
            logger.error("Git ile güncellenirken hata oluştu:");
            logger.error(error as Error);
        }
    }

    public manualUpdate = async () => {
        try {
            const res = await axios.get("", {
                responseType: "arraybuffer",
                headers: this.baseHeaders
            })

            const zip = new AdmZip(res.data)
            zip.extractAllTo(os.tmpdir(), true)
            const tempFolder = path.join(os.tmpdir(), zip.getEntries()[0].entryName)
            copyDirectory(tempFolder, process.cwd())

        } catch (error) {
            logger.error("Proje manuel güncellenirken hata oluştu:")
            logger.error(error as Error)
        }
    }

    private installDependencies = async () => {
        logger.info("Bağımlılıklar yükleniyor...");
        try {
            await promisify(exec)("npm install");
            logger.info("Bağımlılıklar başarıyla yüklendi.");
        } catch (error) {
            logger.error("Bağımlılıklar yüklenirken hata oluştu:");
            logger.error(error as Error);
        }
    }

    private restart = () => {
        const child = spawn("start", ["cmd.exe", "/K", "npm start"], {
            cwd: process.cwd(),
            shell: true,
            detached: true,
            stdio: "ignore"
        })
        child.unref()
        process.exit(1)
    }
}

export const checkUpdate = new selfUpdate().checkUpdate