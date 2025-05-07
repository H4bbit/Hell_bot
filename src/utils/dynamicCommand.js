const {
    isActiveGroup,
    isActiveAntiLinkGroup,

} = require('../utils/database');
const { verifyPrefix,
    hasTypeOrCommand,
    isLink,
    isAdmin,
} = require('../middlewares');

const { checkPermission } = require('../middlewares/checkPermission');
const {
    DangerError,
    WarningError,
    InvalidParameterError } = require('../errors');
const { findCommandImport } = require(".");

/**
 * @param {Object} paramsHandler - Objeto contendo os parâmetros da mensagem.
 * @param {String} paramsHandler.commandName - Nome do comando.
 * @param {String} paramsHandler.prefix - Prefixo do comando.
 * @param {Function} paramsHandler.sendWarningReply - Função para enviar uma mensagem de aviso.
 * @param {Function} paramsHandler.sendErrorReply - Função para enviar uma mensagem de erro.
 * @param {String} paramsHandler.remoteJid - ID do chat.
 * @param {Boolean} paramsHandler.isGroup - Indica se o chat é um grupo.
 *
 */
exports.dynamicCommand = async (paramsHandler) => {
    const {
        commandName,
        prefix,
        sendWarningReply,
        sendErrorReply,
        remoteJid,
        isGroup,
        fullMessage

    } = paramsHandler;

    const { type, command } = findCommandImport(commandName);
    if (!verifyPrefix(prefix) || !hasTypeOrCommand({ type, command })) {
        return;
    }

    if (!(await checkPermission({ type, ...paramsHandler }))) {
        await sendErrorReply('você não tem permissao para usar esse comando!');
        return;
    }

    if (isGroup && (!await isActiveGroup(remoteJid)) && command.name !== "on") {
        /*
                await sendWarningReply(
                    "Este grupo está desativado! Peça para o dono do grupo ativar o bot!"
                );
        */
        console.log('grupo inativo ' + remoteJid);
        console.log(command);
        return;
    }
    /*
        if (isActiveAntiLinkGroup(remoteJid) && isLink(fullMessage)) {
            if (!userJid) return;
    
            if (!(await isAdmin({ remoteJid, userJid, socket }))) {
                await socket.groupParticipantsUpdate(remoteJid, [userJid], "remove");
    
                await sendReply(
                    "Anti-link ativado! Você foi removido por enviar um link!"
                );
    
                await socket.sendMessage(remoteJid, {
                    delete: {
                        remoteJid,
                        fromMe: false,
                        id: webMessage.key.id,
                        participant: webMessage.key.participant,
                    },
                });
    
                return;
            }
        }
        */
    try {
        await command.handle({ ...paramsHandler, type });
    } catch (error) {
        console.log(error);

        if (error instanceof InvalidParameterError) {
            await sendWarningReply(`parametros invalidos! ${error.message}`);
        } else if (error instanceof WarningError) {
            await sendWarningReply(error.message);
        } else if (error instanceof DangerError) {
            await sendErrorReply(error.message);
        } else {
            await sendErrorReply(`ocorreu um erro ao executar o comando ${command.name}`);
            console.log(error.message);
        }

    }
};
