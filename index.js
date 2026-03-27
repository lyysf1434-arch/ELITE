require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ====== اعدادات ======
const eventRoles = ["1398804818482561035", "1398804831140839514"];

const registerChannelID = "1486929573332648007";
const teamsLogChannelID = "1486929591648911441";

const voiceChannels = ["VOICE1","VOICE2","VOICE3","VOICE4","VOICE5","VOICE6","VOICE7","VOICE8",
"VOICE9","VOICE10","VOICE11","VOICE12","VOICE13","VOICE14","VOICE15","VOICE16",
"VOICE17","VOICE18","VOICE19","VOICE20","VOICE21","VOICE22","VOICE23","VOICE24",
"VOICE25","VOICE26","VOICE27","VOICE28","VOICE29","VOICE30","VOICE31","VOICE32",
"VOICE33","VOICE34"];

const maps = {
"1️⃣": { name: "Scrap", image: "IMAGE1" },
"2️⃣2️": { name: "RunGan", image: "IMAGE2" },
"3️⃣": { name: "Cinema", image: "IMAGE3" },
"4️⃣": { name: "تبي الصراحه ناسي المابات", image: "IMAGE4" }
};

const games = {
"1️⃣": " Battle Royal",
"2️⃣": " Back to Back ",
"3️⃣": " Gang War"
};

// ====== متغيرات ======
let teamsOpen = false;
let teamNumber = 1;
let registeredPlayers = new Set();
let soloPlayers = new Set();
let teamsStorage = [];

// ====== تحقق رتبة ======
function hasEventRole(member) {
  return eventRoles.some(r => member.roles.cache.has(r));
}

// ===== READY =====
client.on("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== SLASH COMMANDS =====
client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

const cmd = interaction.commandName;

// ===== RULES =====
if (cmd === "rules") {
await interaction.reply({ content: "@everyone 📜 قوانين الايفنت", ephemeral: false });
}

// ===== MAPS =====
if (cmd === "maps") {

if (!hasEventRole(interaction.member)) return interaction.reply("❌ ليس لديك صلاحية");

const embed = new EmbedBuilder()
.setTitle("🗳️ تصويت المابات ")
.setDescription("1️⃣ Map1\n2️⃣ Map2\n3️⃣ Map3\n4️⃣ Map4");

const msg = await interaction.reply({ embeds:[embed], fetchReply:true });

for (let e of Object.keys(maps)) await msg.react(e);

setTimeout(async ()=>{
msg.reactions.removeAll();

let res={};
msg.reactions.cache.forEach(r=> res[r.emoji.name]=r.count-1);

const win = Object.entries(res).sort((a,b)=>b[1]-a[1])[0][0];

interaction.followUp({
embeds:[ new EmbedBuilder()
.setTitle("🏆 الماب ")
.setDescription(maps[win].name)
.setImage(maps[win].image)]
});

},300000);
}

// ===== GAMES =====
if (cmd === "games") {

if (!hasEventRole(interaction.member)) return interaction.reply("❌ ليس لديك صلاحية");

const embed = new EmbedBuilder()
.setTitle("🎮 تصويت القيم")
.setDescription("1️⃣ Battle Royal \n2️⃣ Back to BACK \n3️⃣ Gang War ");

const msg = await interaction.reply({ embeds:[embed], fetchReply:true });

for (let e of Object.keys(games)) await msg.react(e);

setTimeout(()=>{
msg.reactions.removeAll();

let res={};
msg.reactions.cache.forEach(r=> res[r.emoji.name]=r.count-1);

const win = Object.entries(res).sort((a,b)=>b[1]-a[1])[0][0];

interaction.followUp(`🏆 الفائز: ${games[win]}`);

},300000);
}

// ===== STARTVOTE =====
if (cmd === "startvote") {

if (!hasEventRole(interaction.member)) return;

const msg = await interaction.reply({ content:"🎮 بدأ تصويت القيم", fetchReply:true });

await msg.react("🔝");
await msg.react("💥");
await msg.react("⚔️");

setTimeout(async ()=>{

let res={};
msg.reactions.cache.forEach(r=> res[r.emoji.name]=r.count-1);
const win = Object.entries(res).sort((a,b)=>b[1]-a[1])[0][0];

interaction.followUp(`🏆 القيم الفائز: ${games[win]}`);

const mapMsg = await interaction.followUp("🗺️ بدأ تصويت المابات");

await mapMsg.react("🎖️");
await mapMsg.react("〽️");
await mapMsg.react("🔥");
await mapMsg.react("💎");

setTimeout(()=>{
let res2={};
mapMsg.reactions.cache.forEach(r=> res2[r.emoji.name]=r.count-1);
const win2 = Object.entries(res2).sort((a,b)=>b[1]-a[1])[0][0];

interaction.followUp({
embeds:[ new EmbedBuilder()
.setTitle("🏆 الماب الفائز")
.setDescription(maps[win2].name)
.setImage(maps[win2].image)]
});

},300000);

},300000);
}

// ===== TEAMS OPEN =====
if (cmd === "teams-open") {
teamsOpen = true;
teamsStorage = [];
registeredPlayers.clear();
soloPlayers.clear();
teamNumber = 1;

await interaction.reply("✅ تم فتح التسجيل");
}

// ===== TEAMS CLOSE =====
if (cmd === "teams-close") {
teamsOpen = false;
await interaction.reply("❌ تم قفل التسجيل");
}

// ===== DISTRIBUTE =====
if (cmd === "distribute") {

for (let i=0;i<teamsStorage.length;i++){
const voice = interaction.guild.channels.cache.get(voiceChannels[i]);

for (let id of teamsStorage[i]){
const m = await interaction.guild.members.fetch(id).catch(()=>null);
if (!m) continue;
if (m.voice.channel) await m.voice.setChannel(voice).catch(()=>{});
}
}

await interaction.reply("🚀 تم توزيع التيمات");
}

// ===== WINNERS =====
if (cmd === "winners") {

const event = interaction.options.getString("event");
const host = interaction.options.getString("host");
const players = interaction.options.getString("players");

const embed = new EmbedBuilder()
.setTitle("🏆 الفائزين")
.setDescription(`🎮 ${event}\n👑 ${players}\n🎙️ ${host}`)
.setColor("Gold");

await interaction.reply({ embeds:[embed] });
}

});

// ===== TEAM REGISTER =====
client.on("messageCreate", async message => {

if (message.author.bot) return;
if (!teamsOpen) return;
if (message.channel.id !== registerChannelID) return;

const content = message.content.toLowerCase();

// SOLO
if (content.includes("solo") || content.includes("سولو")) {
if (registeredPlayers.has(message.author.id)) return;

soloPlayers.add(message.author.id);
registeredPlayers.add(message.author.id);

const log = message.guild.channels.cache.get(teamsLogChannelID);

let txt="🎯 SOLO\n";
soloPlayers.forEach(id=> txt+=`<@${id}>\n`);

log.send(txt);
return;
}

// TEAM
const mentions = message.mentions.users;
if (mentions.size === 0) return;

for (let u of mentions.values()) {
if (registeredPlayers.has(u.id)) return;
}

mentions.forEach(u=> registeredPlayers.add(u.id));

teamsStorage.push([...mentions.keys()]);

const log = message.guild.channels.cache.get(teamsLogChannelID);

let txt=`🏆 Team-${teamNumber}\n`;
mentions.forEach(u=> txt+=`<@${u.id}>\n`);

teamNumber++;

log.send(txt);

});

client.login(process.env.TOKEN);