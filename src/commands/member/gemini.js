//gemini ia command 
const axios = require('axios');
const { PREFIX, GEMINI_API_KEY } = require('../../config');

module.exports = {
    name: 'gemini',
    description: '',
    commands: ['gemini'],
    usage: `${PREFIX}gemini <pergunta>`,
    handle: async ({
        args,
        sendReact,
        sendReply,
        sendWaitReact,
        sendSuccessReact
    }) => {
        if (!args || args.length === 0) {
            await sendReact('❓');
            return await sendReply(' Por favor, insira uma pergunta para o Gemini.');
        }
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const question = args.join(' ');

        try {
            await sendWaitReact();
            const response = await axios.post(url, {
                contents: [{
                    parts: [{
                        text: question
                    }]
                }]
            });

            const answer = response.data.candidates[0].content.parts[0].text;
            await sendSuccessReact();
            await sendReply(answer);

        } catch (error) {
            console.error('Erro ao chamar a API Gemini:', error);
            await sendReact('❌');
            await sendReply(' Ocorreu um erro ao processar a sua pergunta.');
        }

    }
}
