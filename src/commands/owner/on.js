const PREFIX = require('../../config');
const { activateGroup, isActiveGroup } = require('../../utils/database');
module.exports = {
    name: 'on',
    description: 'ligar o bot',
    commands: ['on', 'boton', 'ligar'],
    usage: `${PREFIX}on`,
    handle: async ({
        sendSuccessReply,
        remoteJid,
        socket,
    }) => {
        const isActive = await isActiveGroup(remoteJid);
        if (isActive) {
            return await sendSuccessReply("o bot ja esta ativado nesse grupo");
        }
        console.log('remoteJid: ', remoteJid);
        console.log('socket: ', socket.groupMetadata(remoteJid));
        await activateGroup(remoteJid);
        await sendSuccessReply("Bot ativado!");

    },
}
