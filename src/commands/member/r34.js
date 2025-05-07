const axios = require('axios');
const { PREFIX } = require('../../config');
const { isActivateNSFWGroup } = require('../../utils/database');

module.exports = {
    name: 'r34',
    description: 'Busca imagens e vídeos no Rule34',
    commands: ['r34', 'rule34'],
    usage: `${PREFIX}r34 <tags>`,
    handle: async ({
        sendImageFromURL,
        sendVideoFromURL,
        args,
        sendReact,
        sendReply,
        sendWaitReact,
        sendSuccessReact,
        sendErrorReact,
        remoteJid
    }) => {

        if (await isActivateNSFWGroup(remoteJid)) {
            await sendErrorReact();
            return await sendReply("o modo nsfw precisa esta ativo para usar esse comando");
        }
        if (!args || args.length === 0) {
            await sendReact('❓');
            return await sendReply('Digite um termo para pesquisar no Rule34, exemplo: r34 naruto.');
        }

        const searchTags = formatTags(args);
        const requestUrl = buildRequestUrl(searchTags);

        console.log('searchTags:', searchTags);
        console.log('requestUrl:', requestUrl);

        await fetchAndSendMedia(requestUrl, sendImageFromURL, sendVideoFromURL, sendReact, sendReply, sendWaitReact, sendSuccessReact);
    },
};

// Função para formatar as tags para a URL
function formatTags(tags) {
    return tags.join('+');
}

// Função para construir a URL de requisição
function buildRequestUrl(searchTags) {
    const baseUrl = "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1";
    return `${baseUrl}&tags=${encodeURIComponent(searchTags)}&limit=1`;
}

// Função para buscar e enviar a mídia
async function fetchAndSendMedia(requestUrl, sendImageFromURL, sendVideoFromURL, sendReact, sendReply, sendWaitReact, sendSuccessReact) {
    try {
        await sendWaitReact(); // Mostra um emoji de "espera"
        const response = await axios.get(requestUrl);

        if (!response.data || response.data.length === 0) {
            return await sendReply("Nenhum resultado encontrado.");
        }

        if (response.data.success === false) {
            return await sendReply("A pesquisa no Rule34 está fora do ar no momento.");
        }

        const post = response.data[0];
        const fileUrl = post.file_url;
        const fileExtension = fileUrl.split('.').pop();
        const caption = `Owner: ${post.owner}\n\nTags: ${post.tags}`;

        await sendSuccessReact(); // Reação de sucesso
        sendMedia(fileUrl, fileExtension, caption, sendImageFromURL, sendVideoFromURL);
    } catch (error) {
        console.error('Erro ao buscar os dados:', error.response?.data || error.toString());
        return await sendReply("Ocorreu um erro ao buscar os dados.");
    }
}

// Função para enviar a mídia com base no tipo de arquivo
function sendMedia(fileUrl, fileExtension, caption, sendImageFromURL, sendVideoFromURL) {
    if (fileExtension.match(/(jpg|png|jpeg)/)) {
        sendImageFromURL(fileUrl, caption || undefined);
    } else if (fileExtension.match(/(mp4|gif)/)) {
        sendVideoFromURL(fileUrl, caption || undefined, fileExtension === 'gif');
    }
}
