const PREFIX = require('../../config');
const fs = require('fs');
const { adicionarExif } = require('../../utils/metadataWebp');
const { InvalidParameterError } = require(`../../errors`);

module.exports = {
    name: 'rename',
    description: 'Renomeia a descrição de uma figurinha',
    commands: ['rename', 'roubar', 'sname'],
    usage: `${PREFIX}rename autor/pack`,

    handle: async ({
        webMessage,
        isSticker,
        sendSuccessReact,
        sendWaitReact,
        downloadSticker,
        sendStickerFromBuffer,
        sendStickerFromFile,
        args,
    }) => {
        if (args.length <= 1) {
            throw new InvalidParameterError('Informe o nome do pacote e o autor. Exemplo: rename autor/pack');
        }
        if (!isSticker) {
            throw new InvalidParameterError('Você precisa marcar uma figurinha');
        }

        await sendWaitReact();
        const inputPath = await downloadSticker(webMessage, "input");

        // Separando o nome do autor e do pacote dos argumentos
        const [autor, pack] = args;

        // Lendo o buffer da figurinha
        const bufferSticker = fs.readFileSync(inputPath);

        // Adicionando EXIF com o novo nome e autor
        const stickerBufferComExif = await adicionarExif(bufferSticker, pack, autor);

        // Enviando a figurinha com os novos metadados
        await sendStickerFromBuffer(stickerBufferComExif);

        await sendSuccessReact();
    },
};

