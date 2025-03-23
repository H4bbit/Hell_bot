const { PREFIX, BOT_NUMBER } = require('../../config');
const { toUserJid, onlyNumbers } = require('../../utils');
const { DangerError, InvalidParameterError } = require('../../errors');


module.exports = {
    name: 'ban',
    description: 'remove um menbro do grupo',
    commands: ['ban', 'banir', 'kick'],
    usage: `${PREFIX}ban <@usuário> ou marcar menssagem do membro`,
    handle: async ({
        args,
        isReply,
        socket,
        remoteJid,
        replyJid,
        sendReply,
        userJid,
        sendSuccessReact,
    }) => {
        if (!args.length && !isReply) {
            throw new InvalidParameterError('você precisa marcar um membro ');
        }
        const memberToRemoveJid = isReply ? replyJid : toUserJid(args[0]);
        const memberToRemoveNumber = onlyNumbers(memberToRemoveJid);


        if (memberToRemoveNumber.length < 7 || memberToRemoveNumber.length > 15) {
            throw new InvalidParameterError('numero invalido');
        }
        if (memberToRemoveJid === userJid) {
            throw new DangerError('Você não pode se banir');
        }
        const botJid = toUserJid(BOT_NUMBER);

        if (memberToRemoveJid === botJid) {
            throw new DangerError('Você não pode me banir');
        }
        await socket.groupParticipantsUpdate(
            remoteJid,
            [memberToRemoveJid],
            'remove');

        await sendSuccessReact();
        await sendReply(`Membro removido com sucesso`);
    }
}
