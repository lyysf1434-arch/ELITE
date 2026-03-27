require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ====== اعدادات ======
const eventRoles = ["1398804818482561035", "1398804831140839514"];

const registerChannelID = "1486929573332648007";
const teamsLogChannelID = "1486929591648911441";

const voiceChannels = [
"VOICE1","VOICE2","VOICE3","VOICE4","VOICE5","VOICE6","VOICE7","VOICE8",
"VOICE9","VOICE10","VOICE11","VOICE12","VOICE13","VOICE14","VOICE15","VOICE16",
"VOICE17","VOICE18","VOICE19","VOICE20","VOICE21","VOICE22","VOICE23","VOICE24",
"VOICE25","VOICE26","VOICE27","VOICE28","VOICE29","VOICE30","VOICE31","VOICE32",
"VOICE33","VOICE34"
];

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

// ====== تحقق الرتب ======
function hasEventRole(member) {
  return eventRoles.some(role => member.roles.cache.has(role));
}

// ===== READY =====
client.on("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const data = new SlashCommandBuilder()
    .setName("winners")
    .setDescription("اعلان الفائزين")
    .addStringOption(o => o.setName("event").setDescription("اسم الفعالية").setRequired(true))
    .addStringOption(o => o.setName("Players").setDescription("الفائزين").setRequired(true))
    .addStringOption(o => o.setName("host").setDescription(" المنظم ").setRequired(true));

  await client.application.commands.create(data);
});

// ===== MESSAGE =====
client.on("messageCreate", async (message) => {

if (message.author.bot) return;

// ===== RULES =====
if (message.content === "-event rules") {
message.channel.send({ content: "@everyone" });
}

// ===== MAPS =====
if (message.content === "-event maps") {

if (!hasEventRole(message.member)) return;

const embed = new EmbedBuilder()
.setTitle("🗳️ تصويت المابات")
.setDescription("1️⃣ Map1\n2️⃣ Map2\n3️⃣ Map3\n4️⃣ Map4");

const msg = await message.channel.send({ embeds:[embed] });

for (let e of Object.keys(maps)) await msg.react(e);

setTimeout(async ()=>{
msg.reactions.removeAll();

let res={};
msg.reactions.cache.forEach(r=> res[r.emoji.name]=r.count-1);

const win = Object.entries(res).sort((a,b)=>b[1]-a[1])[0][0];

message.channel.send({
embeds:[ new EmbedBuilder()
.setTitle("🏆 الماب ")
.setDescription(maps[win].name)
.setImage(maps[win].image)]
});

},300000);
}

// ===== GAMES =====
if (message.content === "-event games") {

if (!hasEventRole(message.member)) return;

const embed = new EmbedBuilder()
.setTitle("🎮 تصويت القيم")
.setDescription("1️⃣ Battle Royal \n2️⃣ Back to BACK \n3️⃣ Gang War ");

const msg = await message.channel.send({ embeds:[embed] });

for (let e of Object.keys(games)) await msg.react(e);

setTimeout(async ()=>{
msg.reactions.removeAll();

let res={};
msg.reactions.cache.forEach(r=> res[r.emoji.name]=r.count-1);

const win = Object.entries(res).sort((a,b)=>b[1]-a[1])[0][0];

message.channel.send(`🏆 الفائز: ${games[win]}`);

},300000);
}

// ===== START VOTE =====
if (message.content === "-event startvote") {

if (!hasEventRole(message.member)) return;

message.channel.send(" بدأ التصويت ");

const msg = await message.channel.send("1️⃣2️⃣3️⃣");

await msg.react("1️⃣");
await msg.react("2️⃣");
await msg.react("3️⃣");

setTimeout(async ()=>{

let res={};
msg.reactions.cache.forEach(r=> res[r.emoji.name]=r.count-1);

const win = Object.entries(res).sort((a,b)=>b[1]-a[1])[0][0];

message.channel.send(`🏆 القيم : ${games[win]}`);

// ===== يبدأ تصويت المابات =====

const mapMsg = await message.channel.send("🎖️〽️🔥💎");

await mapMsg.react("1️⃣");
await mapMsg.react("2️⃣");
await mapMsg.react("3️⃣");
await mapMsg.react("4️⃣");

setTimeout(async ()=>{

let res2={};
mapMsg.reactions.cache.forEach(r=> res2[r.emoji.name]=r.count-1);

const win2 = Object.entries(res2).sort((a,b)=>b[1]-a[1])[0][0];

message.channel.send({
embeds:[ new EmbedBuilder()
.setTitle("🏆 الماب ")
.setDescription(maps[win2].name)
.setImage(maps[win2].image)]
});

},300000);

},300000);
}

// ===== TEAMS =====
if (message.content === "-teams") {
teamsOpen = true;
teamNumber = 1;
registeredPlayers.clear();
soloPlayers.clear();
teamsStorage = [];
message.channel.send(" تم فتح تسجيل التيمات");
}

// ===== CLOSE =====
if (message.content === "-teams close") {
teamsOpen = false;
message.channel.send("❌ تم إغلاق التسجيل");
}

// ===== REGISTER =====
if (teamsOpen && message.channel.id === registerChannelID) {

const content = message.content.toLowerCase();

if (content.includes("solo") || content.includes("سولو")) {

if (registeredPlayers.has(message.author.id)) return;

soloPlayers.add(message.author.id);
registeredPlayers.add(message.author.id);

const log = message.guild.channels.cache.get(teamsLogChannelID);

let txt=" SOLO\n";
soloPlayers.forEach(id=> txt+=`<@${id}>\n`);

log.send(txt);
return;
}

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
}

// ===== DISTRIBUTE =====
if (message.content === "-توزيع") {

for (let i=0;i<teamsStorage.length;i++){

const voice = message.guild.channels.cache.get(voiceChannels[i]);

for (let id of teamsStorage[i]){

const m = await message.guild.members.fetch(id).catch(()=>null);
if (!m) continue;

if (m.voice.channel)
await m.voice.setChannel(voice).catch(()=>{});
}
}

message.channel.send("✅ تم توزيع التيمات");

}

});

// ===== SLASH WINNERS =====
client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return;

if (interaction.commandName === "winners") {

const event = interaction.options.getString("event");
const host = interaction.options.getString("host");
const players = interaction.options.getString("players");

const embed = new EmbedBuilder()
.setTitle("🏆 الفائزين")
.setDescription(`🎮 ${event}\n👑 ${players}\n🎙️ ${host}`)
.setColor("Gold");

interaction.reply({ embeds:[embed] });
}

});

client.login(process.env.TOKEN);