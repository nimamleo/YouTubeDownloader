const { Telegraf, Markup, Scenes, session } = require("telegraf");
require("dotenv").config();
const bot = new Telegraf(process.env.TOKEN);
const ytdl = require("ytdl-core");
const { UserModel } = require("../models/user.model");
const userModel = require("../models/user.model");
const { default: axios } = require("axios");

const getVideoURLscene = new Scenes.WizardScene(
    "getURL",
    (ctx) => {
        ctx.reply("Please enter your video link");
        ctx.wizard.state.url = {};
        return ctx.wizard.next();
    },
    async (ctx) => {
        try {
            const regex = /^https.*you.*$/;
            const url = ctx.message.text;
            if (!regex.test(url)) {
                return ctx.reply(
                    "Please enter a valid URL starting with 'https' and containing 'you'"
                );
            }
            ctx.wizard.state.url = url;
            await axios.post("http://127.0.0.1:5000/user/addToHistory", {
                url,
                username: ctx.from.username,
            });
            ctx.reply(
                "select your type:",
                Markup.inlineKeyboard([
                    [{ text: "video", callback_data: "video" }],
                    [{ text: "audio", callback_data: "audio" }],
                ])
            );
            return ctx.scene.leave();
        } catch (err) {
            console.log(err);
        }
    }
);

const stage = new Scenes.Stage([getVideoURLscene]);
bot.use(session());
bot.use(stage.middleware());

bot.command("start", async (ctx) => {
    try {
        await axios.post("http://127.0.0.1:5000/user/start", {
            username: ctx.from.username,
        });
        return await ctx.reply(
            "welcome to youtube downloader",
            Markup.inlineKeyboard([
                [
                    { text: "download", callback_data: "download" },
                    { text: "help", callback_data: "help" },
                ],
                [
                    { text: "history", callback_data: "history" },
                    { text: "info", callback_data: "info" },
                ],
            ])
        );
    } catch (err) {
        console.log(err);
    }
});

bot.action("help", (ctx) => {
    ctx.reply(
        `
1️⃣   for every time you want to use bot type /start

2️⃣   press download to start your download process

3️⃣   press history to show you what you have searched

4️⃣   Press info to know the number of times left

        `
    );
});
bot.action("download", async (ctx) => {
    try {
        const { username } = ctx.from;
        const result = await axios.get(
            `http://127.0.0.1:5000/user/getCount/${username}`
        );
        if (result.data.count <= 0) {
            return ctx.reply("you reach limit please buy our packegs");
        }
        ctx.scene.enter("getURL");
    } catch (err) {
        console.log(err);
    }
});

bot.action("history", async (ctx) => {
    const { username } = ctx.from;
    const result = await axios.get(
        `http://127.0.0.1:5000/user/getHistory/${username}`
    );
    ctx.sendChatAction("typing");
    result.data.history.forEach((item) => {
        ctx.reply(item);
    });
});
bot.action("info", async (ctx) => {
    const { username } = ctx.from;
    const result = await axios.get(
        `http://127.0.0.1:5000/user/getCount/${username}`
    );
    ctx.sendChatAction("typing");
    ctx.reply(`times to left: ${result.data.count}`);
});

bot.action("video", async (ctx) => {
    try {
        const { username } = ctx.from;
        const res = await axios.get(
            `http://127.0.0.1:5000/user/getTask/${username}`
        );
        const videoID = res.data.task;
        ctx.deleteMessage();
        ctx.sendChatAction("upload_document");
        let info = await ytdl.getInfo(videoID);
        const mp4s = info.formats.filter((e) => {
            return e.mimeType.split(";")[0] == "video/mp4";
        });
        let result = [];
        // only select label and url from large data
        mp4s.forEach((video) => {
            const { qualityLabel, url } = video;
            result.push([qualityLabel, url]);
        });
        const createdStructure = defineStructure(result);
        await axios.get(`http://127.0.0.1:5000/user/limit/${username}`);
        bot.telegram.sendMessage(
            ctx.chat.id,
            "click on buttons to show your download link",
            {
                reply_markup: {
                    inline_keyboard: createdStructure,
                },
            }
        );
    } catch (err) {
        console.log(err.response);
        // ctx.reply(err.response.data.message);
    }
});

bot.action("audio", async (ctx) => {
    const { username } = ctx.from;
    const res = await axios.get(
        `http://127.0.0.1:5000/user/getTask/${username}`
    );
    const videoID = res.data.task;
    ctx.deleteMessage();
    ctx.sendChatAction("upload_document");
    let info = await ytdl.getInfo(videoID);
    info.formats.forEach((e) => {});
    const mp3s = info.formats.filter((e) => {
        return e.mimeType.split(";")[0] == "audio/webm";
    });
    let result = [];
    // only select label and url from large data
    mp3s.forEach((video) => {
        const { audioBitrate, url } = video;
        result.push([audioBitrate, url]);
    });
    const createdStructure = defineStructure(result);

    bot.telegram.sendMessage(
        ctx.chat.id,
        "click on buttons to show your download link",
        {
            reply_markup: {
                inline_keyboard: createdStructure,
            },
        }
    );
});

function defineStructure(result) {
    // delete duplicate data
    result = result.filter((item, index) => {
        return result.findIndex((arr) => arr[0] === item[0]) === index;
    });
    // console.log(result);
    // create structure  (2 btn in each row)
    let inlineKeyboard = [];
    for (let i = 0; i < result.length; i += 2) {
        const row = [];

        for (let j = i; j < i + 2 && j < result.length; j++) {
            row.push({
                text: result[j][0],
                url: result[j][1],
            });
        }

        inlineKeyboard.push(row);
    }
    return inlineKeyboard;
}


bot.launch(() => {});
