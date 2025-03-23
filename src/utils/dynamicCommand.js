const { isActiveGroup } = require('../utils/database');
const { verifyPrefix, hasTypeOrCommand } = require('../middlewares');
const { checkPermission } = require('../middlewares/checkPermission');
const {
    DangerError,
    WarningError,
    InvalidParameterError } = require('../errors');
const { findCommandImport } = require(".");
const { ONLY_GROUP_ID } = require("../config");

exports.dynamicCommand = async (paramsHandler) => {
    const {
        commandName,
        prefix,
        sendWarningReply,
        sendErrorReply,
        remoteJid

    } = paramsHandler;

    const { type, command } = findCommandImport(commandName);
    if (!verifyPrefix(prefix) || !hasTypeOrCommand({ type, command })) {
        return;
    }

    if (!(await checkPermission({ type, ...paramsHandler }))) {
        await sendErrorReply('você não tem permissao para usar esse comando!');
        return;
    }

    if ((!await isActiveGroup(remoteJid)) && command.name !== "on") {
        /*
                await sendWarningReply(
                    "Este grupo está desativado! Peça para o dono do grupo ativar o bot!"
                );
        */
        return;
    }
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
