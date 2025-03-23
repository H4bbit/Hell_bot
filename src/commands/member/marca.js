const PREFIX = require('../../config');
const fs = require('fs');
const { adicionarExif } = require('../../utils/metadataWebp');
const { InvalidParameterError, WarningError } = require('../../errors');
const { saveUserMark, getUserMark } = require('../../utils/database');

module.exports = {
    name: 'fmarca',
    description: 'Registra uma marca personalizada nas figurinhas ou aplica a marca registrada',
    commands: ['fmarca', 'marcar', 'smarca'],
    usage: `${PREFIX}fmarca <autor> <pack> (ou apenas .fmarca para aplicar a marca registrada)`,

    handle: async ({
        webMessage,
        isSticker,
        sendSuccessReact,
        sendWaitReact,
        downloadSticker,
        sendStickerFromBuffer,
        userJid,
        args,
    }) => {
        //caso nao marque uma figurinha na mensagem verifica se o usuario ja tem sua marca no banco de dados 
        // se nao tiver registro pede  pra registrar  
        if (!isSticker) {
            const userMark = await getUserMark(userJid);
            if (!userMark) {
                throw new WarningError('Você ainda não registrou uma marca. Use .fmarca <autor> <pack> para registrar.');
            }
            throw new InvalidParameterError('Você precisa marcar uma figurinha.');
        }

        // Se o usuário forneceu argumentos, registra uma nova marca
        if (args.length >= 2) {
            await sendWaitReact();
            const autor = args[0];
            const pack = args.slice(1).join(' ');

            // Salva a marca para o usuário
            await saveUserMark(userJid, autor, pack);
            return await sendSuccessReact('Marca registrada com sucesso!');
        }

        // Se não forneceu argumentos, tenta aplicar a marca registrada
        const userMark = await getUserMark(userJid);
        if (!userMark) {
            throw new WarningError('Você ainda não registrou uma marca. Use .fmarca <autor> <pack> para registrar.');
        }

        await sendWaitReact();
        const inputPath = await downloadSticker(webMessage, "input");
        const bufferSticker = fs.readFileSync(inputPath);

        // Aplica a marca registrada
        const stickerBufferComExif = await adicionarExif(bufferSticker, userMark.pack, userMark.autor);
        await sendStickerFromBuffer(stickerBufferComExif);

        //remove o arquivo temporário
        fs.unlinkSync(inputPath);
        await sendSuccessReact();
    },
};
