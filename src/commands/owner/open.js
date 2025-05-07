const { PREFIX } = require('../../config');
const { InvalidParameterError } = require('../../errors');
/*
module.exports = {
    name: 'open',
    description: "Revela mídias de visualização única (view once)",
    commands: ['open', 'abrir', 'ver'],
    usage: `${PREFIX}open (responda ou marque uma imagem/vídeo de visualização única)`,

    handle: async ({
        webMessage,
        sendErrorReply,
        sendSuccessReact,
        sendWaitReact,
        socket,
    }) => {
        await sendWaitReact();

        const quoted = webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const main = webMessage.message;

        if (!quoted && !main.viewOnceMessage && !main.viewOnceMessageV2) {
            return await sendErrorReply('Você precisa responder ou marcar uma imagem ou vídeo de visualização única.');
        }

        try {
            const image =
                quoted?.viewOnceMessage?.message?.imageMessage ||
                quoted?.viewOnceMessageV2?.message?.imageMessage ||
                main?.viewOnceMessage?.message?.imageMessage ||
                main?.viewOnceMessageV2?.message?.imageMessage;

            const video =
                quoted?.viewOnceMessage?.message?.videoMessage ||
                quoted?.viewOnceMessageV2?.message?.videoMessage ||
                main?.viewOnceMessage?.message?.videoMessage ||
                main?.viewOnceMessageV2?.message?.videoMessage;

            if (image) {
                image.viewOnce = false;
                image.caption = (image.caption || '') + '\n\n👁️ *REVELADO*';
                await socket.sendMessage(webMessage.key.remoteJid, { image }, { quoted: webMessage });
                return await sendSuccessReact();
            }

            if (video) {
                video.viewOnce = false;
                video.caption = (video.caption || '') + '\n\n👁️ *REVELADO*';
                await socket.sendMessage(webMessage.key.remoteJid, { video }, { quoted: webMessage });
                return await sendSuccessReact();
            }

            return await sendErrorReply('Nenhuma mídia de visualização única encontrada.');
        } catch (error) {
            console.error('[Erro no comando /open]:', error.message);
            await sendErrorReply(error.message || 'Erro ao revelar a mídia.');
        }
    },
};
*/
//gpt 
//const { PREFIX } = require('../../config');

module.exports = {
    name: 'open2',
    description: "Revela mídias de visualização única (view once)",
    commands: ['open2', 'abrir2', 'ver2'],
    usage: `${PREFIX}open2 (responda ou marque uma imagem/vídeo de visualização única)`,

    handle: async ({
        webMessage,
        sendErrorReply,
        sendSuccessReact,
        sendWaitReact,
        socket,
        downloadImage,
        sendImageFromFile,
    }) => {
        await sendWaitReact();

        try {
            const msg = webMessage.message;
            const context = msg?.extendedTextMessage?.contextInfo;
            const quoted = context?.quotedMessage;

            // Unwrap mensagem de visualização única
            const raw = quoted?.viewOnceMessage?.message ||
                quoted?.viewOnceMessageV2?.message ||
                quoted?.viewOnceMessageV2Extension?.message ||
                quoted ||
                msg?.viewOnceMessage?.message ||
                msg?.viewOnceMessageV2?.message ||
                msg;

            const image = raw?.imageMessage;
            const video = raw?.videoMessage;

            if (image) {
                //dowload media 
                const pathImage = await downloadImage(image, 'image');
                await sendImageFromFile(pathImage);
                return await sendSuccessReact();
            }

            if (video) {
                const media = await socket.downloadMediaMessage({ message: { videoMessage: video } }, 'buffer');
                await socket.sendMessage(webMessage.key.remoteJid, {
                    video: media,
                    caption: (video.caption || '') + '\n\n👁️ *REVELADO*',
                }, { quoted: webMessage });
                return await sendSuccessReact();
            }

            return await sendErrorReply('Nenhuma mídia de visualização única encontrada ou suportada.');
        } catch (error) {
            console.error('[Erro no comando /open]:', error.message);
            await sendErrorReply(error.message || 'Erro ao revelar a mídia.');
        }
    },
};
