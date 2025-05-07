const { extractDataFromMessage, baileysIs, download } = require('.');
const fs = require('fs');

/**
 * Carrega funções utilitárias comuns para uso em comandos do bot.
 * @param {Object} params
 * @param {Object} params.socket - Conexão ativa com o cliente WhatsApp.
 * @param {Object} params.webMessage - Mensagem recebida a ser processada.
 * @returns {Object|null} - Conjunto de utilitários extraídos da mensagem ou null se inválido.
 */
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

    if (!remoteJid) return null;

    const isImage = baileysIs(webMessage, "image");
    const isVideo = baileysIs(webMessage, "video");
    const isSticker = baileysIs(webMessage, "sticker");

    const isGroup = remoteJid.endsWith("@g.us");

    // Funções de download
    const downloadImage = async (webMessage, fileName) => {
        try {
            return await download(webMessage, fileName, "image", "png");
        } catch (err) {
            console.error("Erro ao baixar imagem:", err);
        }
    };

    const downloadSticker = async (webMessage, fileName) => {
        try {
            return await download(webMessage, fileName, "sticker", "webp");
        } catch (err) {
            console.error("Erro ao baixar figurinha:", err);
        }
    };

    const downloadVideo = async (webMessage, fileName) => {
        try {
            return await download(webMessage, fileName, "video", "mp4");
        } catch (err) {
            console.error("Erro ao baixar vídeo:", err);
        }
    };

    // Funções de envio de texto
    const sendText = async (text, mentions) => {
        try {
            const optionalParams = mentions?.length ? { mentions } : {};
            return await socket.sendMessage(remoteJid, {
                text: `${text}`,
                ...optionalParams
            });
        } catch (err) {
            console.error("Erro ao enviar texto:", err);
        }
    };

    const sendReply = async (text) => {
        try {
            return await socket.sendMessage(remoteJid, { text: `${text}` }, { quoted: webMessage });
        } catch (err) {
            console.error("Erro ao enviar resposta:", err);
        }
    };

    const sendReact = async (emoji) => {
        try {
            return await socket.sendMessage(remoteJid, {
                react: { text: emoji, key: webMessage.key }
            });
        } catch (err) {
            console.error("Erro ao enviar reação:", err);
        }
    };

    const sendSuccessReact = () => sendReact("✅");
    const sendWaitReact = () => sendReact("⏳");
    const sendWarningReact = () => sendReact("⚠️");
    const sendErrorReact = () => sendReact("❌");

    // Respostas com reação
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

    // Envio de mídia
    const sendStickerFromBuffer = async (buffer) => {
        try {
            return await socket.sendMessage(remoteJid, { sticker: buffer });
        } catch (err) {
            console.error("Erro ao enviar figurinha do buffer:", err);
        }
    };

    const sendStickerFromFile = async (file) => {
        try {
            return await socket.sendMessage(remoteJid, { sticker: fs.readFileSync(file) });
        } catch (err) {
            console.error("Erro ao enviar figurinha do arquivo:", err);
        }
    };

    const sendStickerFromURL = async (url) => {
        try {
            return await socket.sendMessage(remoteJid, { sticker: { url } });
        } catch (err) {
            console.error("Erro ao enviar figurinha da URL:", err);
        }
    };

    const sendImageFromFile = async (file, caption = "") => {
        try {
            return await socket.sendMessage(remoteJid, {
                image: fs.readFileSync(file),
                caption
            }, { quoted: webMessage });
        } catch (err) {
            console.error("Erro ao enviar imagem do arquivo:", err);
        }
    };

    const sendImageFromURL = async (url, caption = "") => {
        try {
            return await socket.sendMessage(remoteJid, {
                image: { url },
                caption
            }, { quoted: webMessage });
        } catch (err) {
            console.error("Erro ao enviar imagem da URL:", err);
        }
    };

    const sendVideoFromURL = async (url, caption = "", gifPlayback = false) => {
        try {
            return await socket.sendMessage(remoteJid, {
                video: { url },
                caption,
                gifPlayback
            }, { quoted: webMessage });
        } catch (err) {
            console.error("Erro ao enviar vídeo da URL:", err);
        }
    };

    const sendAudioFromFile = async (file, ptt = false) => {
        try {
            return await socket.sendMessage(remoteJid, {
                audio: fs.readFileSync(file),
                ptt
            }, { quoted: webMessage });
        } catch (err) {
            console.error("Erro ao enviar áudio do arquivo:", err);
        }
    };

    const sendAudioFromURL = async (url, ptt = false) => {
        try {
            return await socket.sendMessage(remoteJid, {
                audio: { url },
                mimetype: "audio/mp4",
                ptt
            }, { quoted: webMessage });
        } catch (err) {
            console.error("Erro ao enviar áudio da URL:", err);
        }
    };

    const getGroupName = async (remoteJid) => {
        try {
            const groupMetadata = await socket.groupMetadata(remoteJid);
            return groupMetadata.subject;
        } catch (error) {
            console.error("Erro ao obter nome do grupo:", error);
            return null;
        }
    };

    // Exporta todas as funções e dados úteis
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
        sendReact,
        sendSuccessReact,
        sendWaitReact,
        sendWarningReact,
        sendErrorReact,

        sendSuccessReply,
        sendWaitReply,
        sendWarningReply,
        sendErrorReply,

        sendStickerFromFile,
        sendStickerFromBuffer,
        sendStickerFromURL,

        sendImageFromFile,
        sendImageFromURL,
        sendVideoFromURL,

        sendAudioFromFile,
        sendAudioFromURL,

        downloadImage,
        downloadSticker,
        downloadVideo,

        getGroupName
    };
};
