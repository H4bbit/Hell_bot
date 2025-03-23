const PREFIX = require('../../config');
const { deactivateGroup, isActiveGroup } = require('../../utils/database');

module.exports = {
    name: 'off',
    description: 'desligar o bot',
    commands: ['off', 'botoff', 'desligar'],
    usage: `${PREFIX}off`,
    handle: async ({
        sendSuccessReply,
        remoteJid
    }) => {
        const isActive = isActiveGroup(remoteJid);
        if (!isActive) {
            return await sendSuccessReply("o bot ja esta ativado nesse grupo");
        }
        await deactivateGroup(remoteJid);
        await sendSuccessReply("Bot desativado!");
    },
}

