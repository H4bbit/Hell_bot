const { downloadContentFromMessage } = require('baileys');

module.exports = {
    name: 'open',
    description: "Revela mídias de visualização única (view once)",
    commands: ['open', 'abrir', 'ver'],
    usage: `open (responda ou marque uma imagem/vídeo/áudio de visualização única)`,

    handle: async ({
        webMessage,
        sendErrorReply,
        sendSuccessReact,
        sendWaitReact,
        socket,
    }) => {
        await sendWaitReact();

        // Função auxiliar para baixar o buffer da mídia
        const getFileBuffer = async (mediaMsg, mediaType) => {
            const stream = await downloadContentFromMessage(mediaMsg, mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            return buffer;
        };

        try {
            const msg = webMessage.message;
            const context = msg?.extendedTextMessage?.contextInfo;
            const quoted = context?.quotedMessage;

            if (!quoted) {
                return await sendErrorReply('Você precisa responder a uma mídia de visualização única.');
            }

            const raw =
                quoted?.viewOnceMessage?.message ||
                quoted?.viewOnceMessageV2?.message ||
                quoted?.viewOnceMessageV2Extension?.message ||
                quoted;

            const image = raw?.imageMessage;
            const video = raw?.videoMessage;
            const audio = raw?.audioMessage;

            if (image) {
                image.viewOnce = false;
                const buffer = await getFileBuffer(image, 'image');
                await socket.sendMessage(webMessage.key.remoteJid, {
                    image: buffer,
                    caption: (image.caption || '') + '\n\n👁️ *REVELADO*',
                }, { quoted: webMessage });
                return await sendSuccessReact();
            }

            if (video) {
                video.viewOnce = false;
                const buffer = await getFileBuffer(video, 'video');
                await socket.sendMessage(webMessage.key.remoteJid, {
                    video: buffer,
                    caption: (video.caption || '') + '\n\n👁️ *REVELADO*',
                }, { quoted: webMessage });
                return await sendSuccessReact();
            }

            if (audio) {
                audio.viewOnce = false;
                audio.ptt = true; // para mostrar como áudio de voz
                const buffer = await getFileBuffer(audio, 'audio');
                await socket.sendMessage(webMessage.key.remoteJid, {
                    audio: buffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                }, { quoted: webMessage });
                return await sendSuccessReact();
            }

            return await sendErrorReply('Nenhuma mídia de visualização única encontrada ou suportada.');
        } catch (error) {
            console.error('[Erro no comando open]:', error.message);
            await sendErrorReply('Erro ao revelar a mídia.');
        }
    },
};
