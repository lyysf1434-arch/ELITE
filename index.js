const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const allowedRoles = [
    "1398804763084062733",
    "1398804764439085160"
];

const owners = [
    "871067335002325075",
    "1220461194029039687"
];

const logChannelID = "1486394566029475840";

let broadcasting = false;

const delay = (ms) => new Promise(res => setTimeout(res, ms));

client.on("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    //  = الصلاحيات (اونر + رتب محدده + ادمن ستريتر)
    const hasPermission =
        owners.includes(message.author.id) ||
        message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
        allowedRoles.some(role => message.member.roles.cache.has(role));

    if (!hasPermission) return;

    if (message.content === "-bc-stop") {
        broadcasting = false;
        return message.reply("🛑 تم إيقاف البرودكاست");
    }

    if (message.content.startsWith("-bc ")) {

        if (broadcasting) return message.reply("❌ فيه برودكاست شغال");

        const role = message.mentions.roles.first();
        if (!role) return message.reply("❌ حدد رول");

        const msg = message.content.split(" ").slice(2).join(" ");
        if (!msg) return message.reply("❌ اكتب الرسالة");

        broadcasting = true;

        const members = await message.guild.members.fetch();

        let success = 0;
        let failed = 0;
        let total = 0;

        message.reply("🚀 بدأ البرودكاست...");

        for (const member of members.values()) {

            if (!broadcasting) break;
            if (!member.roles.cache.has(role.id)) continue;
            if (member.user.bot) continue;

            total++;

            try {
                await member.send(msg);
                success++;
            } catch {
                failed++;
            }

            await delay(700);
        }

        broadcasting = false;

        message.channel.send("✅ انتهى البرودكاست");

        const logChannel = message.guild.channels.cache.get(logChannelID);

        const embed = new EmbedBuilder()
            .setTitle("برودكاست لوق ")
            .setColor("Blue")
            .addFields(
                { name: " المستخدم", value: `<@${message.author.id}>` },
                { name: " النوع", value: "رول" },
                { name: " الرول", value: role.name },
                { name: " وصل", value: `${success}`, inline: true },
                { name: " فشل", value: `${failed}`, inline: true },
                { name: " المستهدف", value: `${total}`, inline: true },
                { name: " الرسالة", value: msg }
            )
            .setTimestamp();

        if (logChannel) logChannel.send({ embeds: [embed] });
    }

    if (message.content.startsWith("-bc-all ")) {

        if (broadcasting) return message.reply("❌ فيه برودكاست شغال");

        const msg = message.content.slice(8);
        if (!msg) return message.reply("❌ اكتب الرسالة");

        broadcasting = true;

        const members = await message.guild.members.fetch();

        let success = 0;
        let failed = 0;
        let total = 0;

        message.reply("✅  بدا برودكاست الجميع  ")

        for (const member of members.values()) {

            if (!broadcasting) break;
            if (member.user.bot) continue;

            total++;

            try {
                await member.send(msg);
                success++;
            } catch {
                failed++;
            }

            await delay(700);
        }

        broadcasting = false;

        message.channel.send("✅ انتهى برودكاست ");

        const logChannel = message.guild.channels.cache.get(logChannelID);

        const embed = new EmbedBuilder()
            .setTitle("لوق البرودكاست ")
            .setColor("White")
            .addFields(
                { name: " المستخدم", value: `<@${message.author.id}>` },
                { name: " النوع", value: "الكل" },
                { name: " وصل", value: `${success}`, inline: true },
                { name: " فشل", value: `${failed}`, inline: true },
                { name: " المستهدف", value: `${total}`, inline: true },
                { name: " الرسالة", value: msg }
            )
            .setTimestamp();

        if (logChannel) logChannel.send({ embeds: [embed] });
    }

});

client.login(process.env.TOKEN);