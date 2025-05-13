const { PREFIX } = require('../../config');
const { isActivateNSFWGroup } = require('../../utils/database');
const nhentai = require('nhentai');
const api = new nhentai.API();

module.exports = {
    name: 'nhentai',
    description: 'Busca doujinshi pelo ID do nhentai.net',
    commands: ['nh', 'nhentai'],
    usage: `${PREFIX}nhentai <id>`,
    handle: async ({
        args,
        sendReply,
        sendImageFromURL,
        sendReact,
        sendWaitReact,
        sendSuccessReact,
        sendErrorReact,
        remoteJid
    }) => {

        if (await isActivateNSFWGroup(remoteJid)) {
            await sendErrorReact();
            return await sendReply("O modo NSFW precisa estar ativo para usar esse comando.");
        }

        if (!args || args.length === 0 || isNaN(args[0])) {
            await sendReact('❓');
            return await sendReply('Digite o ID do doujin para buscar no nhentai. Ex: nh 177013');
        }

        const doujinId = parseInt(args[0]);

        try {
            await sendWaitReact();

            const doujin = await api.fetchDoujin(doujinId);
            const { pretty } = doujin.titles;
            const { url } = doujin.cover;
            const tags = doujin.tags.all.map(tag => tag.name).join(', ');

            const caption = `*${pretty}*\n\nTags: ${tags}\n\nhttps://nhentai.net/g/${doujinId}`;

            await sendSuccessReact();
            await sendImageFromURL(url, caption);
        } catch (error) {
            console.error("Erro ao buscar doujin:", error);
            await sendErrorReact();
            await sendReply('Não foi possível encontrar esse ID no nhentai.');
        }
    },
};
