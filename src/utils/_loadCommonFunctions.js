const { extractDataFromMessage, baileysIs, download } = require('.');
const fs = require('fs');
exports.loadCommonFunctions = ({ socket, webMessage }) => {
    const {
        remoteJid,
        prefix,
        commandName,
        args,
        fullArgs,
        userJid,
        isReply,
        replyJid
    } = extractDataFromMessage(webMessage);

    if (!remoteJid) {
        return null;
    }
    const isImage = baileysIs(webMessage, "image");
    const isVideo = baileysIs(webMessage, "video");
    const isSticker = baileysIs(webMessage, "sticker");

    const isGroup = remoteJid.endsWith("@g.us");

    const downloadImage = async (webMessage, fileName) => {
        return await download(webMessage, fileName, "image", "png");
    };

    const downloadSticker = async (webMessage, fileName) => {
        return await download(webMessage, fileName, "sticker", "webp");
    };
    const downloadVideo = async (webMessage, fileName) => {
        return await download(webMessage, fileName, "video", "mp4");
    };

    const sendText = async (text, mentions) => {
        let optionalParams = {};
        if (mentions?.length) {
            optionalParams = { mentions };
        }
        return await socket.sendMessage(
            remoteJid, {
            text: `${text}`,
            ...optionalParams

        });
    };
    const sendReply = async (text) => {
        return await socket.sendMessage(remoteJid,
            { text: `${text}` },
            { quoted: webMessage });
    };
    const sendReact = async (emoji) => {
        return await socket.sendMessage(remoteJid,
            { react: { text: emoji, key: webMessage.key } }
        )
    };

    const sendSuccessReact = async () => {
        return await sendReact("✅");
    };
    const sendWaitReact = async () => {
        return await sendReact("⏳");
    };
    const sendWarningReact = async () => {
        return await sendReact("⚠️");
    };
    const sendErrorReact = async () => {
        return await sendReact("❌");
    };

    const sendSuccessReply = async (text) => {
        await sendSuccessReact();
        return await sendReply(`✅ ${text}`);
    };
    const sendWaitReply = async (text) => {
        await sendWaitReact();
        return await sendReply(`⏳ ${text}`);
    };
    const sendWarningReply = async (text) => {
        await sendWarningReact();
        return await sendReply(`⚠️ ${text}`);
    };
    const sendErrorReply = async (text) => {
        await sendErrorReact();
        return await sendReply(`❌ ${text}`);
    };


    const sendStickerFromBuffer = async (buffer) => {
        return await socket.sendMessage(remoteJid, {
            sticker: buffer,
        });
    }



    const sendStickerFromFile = async (file) => {
        return await socket.sendMessage(remoteJid, {
            sticker: fs.readFileSync(file),
        });
    };

    const sendStickerFromURL = async (url) => {
        return await socket.sendMessage(remoteJid, {
            sticker: { url },
        });
    }
    const sendImageFromFile = async (file, caption = "") => {
        return await socket.sendMessage(
            remoteJid,
            {
                image: fs.readFileSync(file),
                caption: caption ? `${caption}` : "",
            },
            { quoted: webMessage }
        );
    };

    const sendImageFromURL = async (url, caption = "") => {
        return await socket.sendMessage(
            remoteJid,
            {
                image: { url },
                caption: caption ? `${caption}` : "",
            },
            { url, quoted: webMessage }
        );
    };

    const sendVideoFromURL = async (url, caption = "", gifPlayback = false) => {
        return await socket.sendMessage(
            remoteJid,
            {
                video: { url },
                caption: caption ? `${caption}` : "",
                gifPlayback,
            },
            { url, quoted: webMessage }
        );
    };
    const sendAudioFromFile = async (file, ptt = false) => {
        return await socket.sendMessage(
            remoteJid,
            {
                audio: fs.readFileSync(file),
                ptt
            },
            { quoted: webMessage }
        );
    };
    const sendAudioFromURL = async (url, ptt = false) => {
        return await socket.sendMessage(
            remoteJid,
            {
                audio: { url },
                mimetype: "audio/mp4",
                ptt
            },
            { url, quoted: webMessage }
        );
    }

    //give group/chat name 
    const getGroupName = async (remoteJid) => {
        try {
            const groupMetadata = await socket.groupMetadata(remoteJid);
            return groupMetadata.subject;
        } catch (error) {
            console.log(error);
            return null;
        }
    }


    return {
        socket,
        remoteJid,
        userJid,
        prefix,
        commandName,
        args,
        fullArgs,
        isGroup,
        isReply,
        isImage,
        isVideo,
        isSticker,
        replyJid,
        webMessage,
        sendText,
        sendReply,
        sendStickerFromFile,
        sendStickerFromBuffer,
        sendStickerFromURL,
        sendImageFromFile,

        sendReact,
        sendSuccessReact,
        sendWaitReact,
        sendWarningReact,
        sendErrorReact,

        sendSuccessReply,
        sendWaitReply,
        sendWarningReply,
        sendErrorReply,

        sendAudioFromFile,
        sendAudioFromURL,

        sendImageFromURL,
        downloadImage,
        downloadSticker,
        sendVideoFromURL,
        downloadVideo,

        getGroupName

    };
};
