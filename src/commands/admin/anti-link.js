const { PREFIX } = require('../../config');
const InvalidParameterError = require('../../errors/InvalidParameterError');
const {
    activateAntiLinkGroup,
    deactivateAntiLinkGroup,
} = require('../../utils/database');

module.exports = {
    name: "anti-link",
    description: "Ativo/desativo o recurso de anti-link no grupo.",
    commands: ["anti-link"],
    usage: `${PREFIX}anti-link (1/0)`,
    handle: async ({
        args,
        sendReply,
        sendSuccessReact,
        remoteJid
    }) => {
        if (!args.length) {
            throw new InvalidParameterError(
                "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
            );
        }

        const antiLinkOn = args[0] === "1";
        const antiLinkOff = args[0] === "0";

        if (!antiLinkOn && !antiLinkOff) {
            throw new InvalidParameterError(
                "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
            );
        }

        if (antiLinkOn) {
            await activateAntiLinkGroup(remoteJid);
        } else {
            await deactivateAntiLinkGroup(remoteJid);
        }

        await sendSuccessReact();

        const context = antiLinkOn ? "ativado" : "desativado";

        await sendReply(`Recurso de anti-link ${context} com sucesso!`);
    },
};
