//retorna a legenda de uma figurinha
const PREFIX = require('../../config');
const fs = require('fs');
const { lerMetadataWebp } = require('../../utils/metadataWebp');
const { InvalidParameterError } = require(`../../errors`);

module.exports = {
    name: 'scaption',
    description: 'printa a descricao da figurinha e envia ela como mensagem',
    commands: ['scaption'],
    usage: `${PREFIX}scaption`,

    handle: async ({
        webMessage,
        isSticker,
        args,
        downloadSticker,
        sendReply,
    }) => {
        if (!isSticker) {
            throw new InvalidParameterError('O comando scaption deve ser usado como resposta a uma figurinha');
        }

        const inputPath = await downloadSticker(webMessage)
        const bufferSticker = fs.readFileSync(inputPath);

        const metadata = await lerMetadataWebp(bufferSticker);
        console.log(metadata);
        await sendReply(metadata['sticker-pack-name'] + ' ' + metadata['sticker-pack-publisher']);

    }
}
