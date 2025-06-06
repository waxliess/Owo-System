
import fs from "node:fs"; 
import path from "node:path"; 
import os from "node:os"; 
import crypto from "node:crypto"; 

export const mapInt = (number, fromMIN, fromMAX, toMIN, toMAX) => { return Math.floor(((number - fromMIN) / (fromMAX - fromMIN)) * (toMAX - toMIN) + toMIN); };

export const ranInt = (min, max, abs = true) => { return abs ? Math.abs(Math.floor(Math.random() * (max - min) + min)) : Math.floor(Math.random() * (max - min) + min); };

export const timeHandler = (startTime, endTime, removeDay = false) => {
    const ms = Math.abs(startTime - endTime);
    const sc = Math.round(ms % 86400000 % 3600000 % 60000 / 1000);
    const mn = Math.floor(ms % 86400000 % 3600000 / 60000);
    const hr = Math.floor(ms % 86400000 / 3600000);
    const dy = Math.floor(ms / 86400000);
    return (removeDay ? "" : dy + (dy > 1 ? " gün " : " gün ")) + hr + ":" + mn + ":" + sc;
};

export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export const getFiles = (dir, suffix) => {
    const files = fs.readdirSync(dir, {
        withFileTypes: true
    });
    let commandFiles = [];
    for (const file of files) {
        if (file.isDirectory()) {
            commandFiles = [
                ...commandFiles,
                ...getFiles(path.join(dir, file.name), suffix)
            ];
        }
        else if (file.name.endsWith(suffix))
            commandFiles.push(path.join(dir, file.name));
    }
    return commandFiles;
};

export const copyDirectory = (sourceDir, destDir) => {
    if (!fs.existsSync(destDir))
        fs.mkdirSync(destDir, { recursive: true });
    const files = fs.readdirSync(sourceDir);
    for (const file of files) {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);
        if (fs.statSync(sourcePath).isDirectory())
            copyDirectory(sourcePath, destPath);
        else
            fs.copyFileSync(sourcePath, destPath);
    }
};

export const getQuestType = (name) => {
    const questTypeLookup = {
        "hunt": "hunt", // Avlanma
        "battle": "battle", // Savaş
        "'owo'": "owo", // Owo komutu
        "gamble": "gamble", // Kumar vs vs / istersen ekleyebilirsin canım bewrq mucuk attı sana
        "birine eylem komutu": "action", 
    };
    for (const [key, value] of Object.entries(questTypeLookup)) {
        if (name.includes(key))
            value;
    }
    return "unsupported";
    /**
     * Görev Açıklamaları Türkçeye Çevrildi
     * Avlanma ve savaşlardan 125000 xp kazan!
     * Elle 100 kez avlan!
     * 50 kez savaş!
     * Efsanevi dereceden 3 hayvan avla!
     * Birine 3 kez eylem komutu kullan!
     * 10 kez kumar oyna!
     * Bir arkadaşının sana 1 kez eylem komutu kullanmasını sağla!
     * Bir arkadaşının sana 3 kez dua etmesini sağla!
     * Bir arkadaşının sana 3 kez lanet etmesini sağla!
     * 2 arkadaşından çerez al!
     */
};

export const loadQuestCommand = (callback) => {
    return {
        condition: () => true,
        action: callback
    };
};

export const getHWID = () => {
    return crypto.createHash("sha256").update([
        os.platform(),
        os.hostname(),
        os.userInfo().username,
    ].join("")).digest("hex");
};
