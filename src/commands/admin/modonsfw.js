const { PREFIX } = require('../../config');
const {
    InvalidParameterError,
} = require('../../errors/InvalidParameterError');
const {
    activateNSFWGroup,
    deactivateNSFWGroup,
} = require('../../utils/database');

module.exports = {
    name: "modonsfw",
    description: "Ativo/desativo o recurso de comandos nsfw no grupo.",
    commands: ["modonsfw"],
    usage: `${PREFIX}modonsfw (1/0)`,
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

        const nsfwOn = args[0] === "1";
        const nsfwOff = args[0] === "0";

        if (!nsfwOn && !nsfwOff) {
            throw new InvalidParameterError(
                "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
            );
        }

        if (nsfwOn) {
            await activateNSFWGroup(remoteJid);
        } else {
            await deactivateNSFWGroup(remoteJid);
        }

        await sendSuccessReact();

        const context = nsfwOn ? "ativado" : "desativado";

        await sendReply(`modo nsfw  ${context} com sucesso!`);
    },
};
