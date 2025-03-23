const axios = require('axios');
const { PREFIX } = require('../../config');

module.exports = {
    name: 'r34pack',
    description: 'Busca imagens e vídeos no Rule34 e envia em pack',
    commands: ['r34pack', 'rule34pack'],
    usage: `${PREFIX}r34pack <N> <tags> [-ignore <tags_a_ignorar>]`,
    handle: async ({
        sendImageFromURL,
        sendVideoFromURL,
        args,
        sendReact,
        sendReply,
        sendWaitReact,
        sendSuccessReact
    }) => {
        //args sempre sera uma arrayb de uma unica string 
        // exemplo: !r34pack 5 naruto  1girls
        // args = ['5 naruto '1girls]]
        console.log(args);
        if (!args || args.length === 0) {
            await sendReact('❓');
            return await sendReply('Digite um número e um termo para pesquisar no Rule34, exemplo: r34pack 5 naruto.');
        }

        const { limit, searchTags, ignoreTags } = parseArgs(args);

        if (isNaN(limit) || limit <= 0) {
            return await sendReply('O primeiro argumento deve ser um número válido maior que 0.');
        }

        if (!searchTags) {
            return await sendReply('Você precisa informar pelo menos uma tag para buscar.');
        }

        const requestUrl = buildRequestUrl(searchTags, limit);

        console.log('Tags para busca:', searchTags);
        console.log('Tags a ignorar:', ignoreTags);
        console.log('URL da requisição:', requestUrl);

        await fetchAndSendMedia(requestUrl, ignoreTags, sendImageFromURL, sendVideoFromURL, sendReact, sendReply, sendWaitReact, sendSuccessReact);
    }
};

// Processa os argumentos do comando
function parseArgs(args) {
    const splitArgs = args.join(' ').split(' ');
    const firstArg = splitArgs.shift();
    const limit = parseInt(firstArg);
    let searchTags = [];
    let ignoreTags = [];
    let ignoreMode = false;

    for (const arg of splitArgs) {
        if (arg === '-ignore') {
            ignoreMode = true;
            continue;
        }
        ignoreMode ? ignoreTags.push(arg.toLowerCase()) : searchTags.push(arg);
    }

    return {
        limit,
        searchTags: searchTags.join('+'),
        ignoreTags
    };
}

// Constrói a URL de requisição para a API
function buildRequestUrl(searchTags, limit) {
    const baseUrl = "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1";
    return `${baseUrl}&tags=${encodeURIComponent(searchTags)}&limit=${limit}`;
}

// Busca e envia a mídia para o usuário, filtrando as tags ignoradas
async function fetchAndSendMedia(requestUrl, limit, ignoreTags, sendImageFromURL, sendVideoFromURL, sendReact, sendReply, sendWaitReact, sendSuccessReact) {
    try {
        await sendWaitReact();
        const response = await axios.get(requestUrl);

        if (!response.data || response.data.length === 0) {
            return await sendReply("Nenhum resultado encontrado.");
        }

        if (response.data.success === false) {
            return await sendReply("A pesquisa no Rule34 está fora do ar no momento.");
        }

        let resultsSent = 0;

        // Garante que ignoreTags seja um array
        if (!Array.isArray(ignoreTags)) {
            ignoreTags = [];
        }

        for (const post of response.data) {
            const fileUrl = post.file_url;
            const fileExtension = fileUrl.split('.').pop().toLowerCase();
            const postTags = post.tags.split(' ').map(tag => tag.toLowerCase());

            // Se alguma tag proibida for encontrada, pula o post
            if (ignoreTags.some(tag => postTags.includes(tag))) {
                console.log(`❌ Ignorando post ${post.id} (tags proibidas: ${postTags.filter(tag => ignoreTags.includes(tag)).join(', ')})`);
                continue;
            }

            // Log das tags antes de enviar a imagem
            console.log(`✅ Enviando post ${post.id}`);
            console.log(`📌 Tags: ${postTags.join(', ')}`);
            console.log(`🔗 URL: ${fileUrl}`);

            sendMedia(fileUrl, fileExtension, undefined, sendImageFromURL, sendVideoFromURL);
            resultsSent++;

            if (resultsSent >= limit) break; // Para quando atingir o limite solicitado
        }

        if (resultsSent === 0) {
            await sendReply("Todos os resultados encontrados continham tags proibidas.");
        } else {
            // Se a função sendSuccessReact estiver definida, chama ela
            if (typeof sendSuccessReact === 'function') {
                await sendSuccessReact();
            } else {
                console.log("sendSuccessReact não está definida");
            }
        }
    } catch (error) {
        console.error('Erro ao buscar imagens no Rule34:', error.response?.data || error.toString());
        await sendReply('Erro ao buscar imagens no Rule34. Por favor, tente novamente mais tarde.');
    }
}
// Envia a mídia correta (imagem ou vídeo)
function sendMedia(fileUrl, fileExtension, caption, sendImageFromURL, sendVideoFromURL) {
    if (["jpg", "jpeg", "png"].includes(fileExtension)) {
        sendImageFromURL(fileUrl, caption || undefined);
    } else if (["gif"].includes(fileExtension)) {
        // Envia gif como vídeo, se necessário
        sendVideoFromURL(fileUrl, caption || undefined, true);  // true significa que é um gif
    } else if (["mp4", "webm"].includes(fileExtension)) {
        sendVideoFromURL(fileUrl, caption || undefined, false); // false para vídeos comuns
    }
}
