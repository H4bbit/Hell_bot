const PREFIX = require('../../config');

module.exports = {
    name: 'auto sticker',
    description: 'modo onde imagens e videos são convertidos em stickers automaticamente em um chat especifico',
    commands: ['autosticker'],
    usage: `${PREFIX}autosticker`,
    handle: async ({
        sendSuccessReply,
        remoteJid
    }) => {
        //somente o dono do bot pode usar esse comando em grupos ou no  privado

    },
}
