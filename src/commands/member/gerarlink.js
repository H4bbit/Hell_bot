const fs = require('fs');
const axios = require('axios');
const path = require('path');
const FormData = require('form-data');
const { getRandomNumber } = require('../../utils');
const { PREFIX, TEMP_DIR } = require('../../config');

module.exports = {
    name: 'gerarlink',
    description: 'Transforma mídias do WhatsApp em links do Telegra.ph',
    commands: ['gerarlink', 'uplink'],
    usage: `${PREFIX}gerarlink (img/vid)`,

    handle: async ({
        isImage,
        isVideo,
        webMessage,
        sendWaitReact,
        sendSuccessReact,
        downloadImage,
        downloadVideo,
        sendMessage,
    }) => {
        if (!isImage && !isVideo) {
            await sendMessage("❌ Responda a uma imagem ou vídeo com o comando gerarlink.");
            return;
        }

        await sendWaitReact();

        // Define um nome aleatório para o arquivo
        const tempFilename = `${getRandomNumber(10_000, 99_999)}.${isImage ? 'jpg' : 'mp4'}`;
        const outputPath = path.resolve(TEMP_DIR, tempFilename);

        // Faz o download da mídia e atualiza o caminho real do arquivo baixado
        let filePath;
        try {
            filePath = isImage
                ? await downloadImage(webMessage, outputPath)
                : await downloadVideo(webMessage, outputPath);
        } catch (error) {
            console.error("Erro ao baixar a mídia:", error);
            await sendMessage("❌ Erro ao baixar a mídia.");
            return;
        }

        // Verifica se o arquivo realmente existe
        if (!fs.existsSync(filePath)) {
            await sendMessage("❌ Erro: O arquivo não foi encontrado após o download.");
            return;
        }

        // Fazendo o upload para Telegra.ph
        const formData = new FormData();
        formData.append("file", fs.createReadStream(filePath));

        try {
            const response = await axios.post("https://telegra.ph/upload", formData, {
                headers: { ...formData.getHeaders() }
            });

            if (response.data && response.data[0]?.src) {
                const link = `https://telegra.ph${response.data[0].src}`;
                await sendMessage(`✅ Mídia enviada com sucesso: ${link}`);
            } else {
                throw new Error("Erro ao enviar mídia para Telegra.ph.");
            }
        } catch (error) {
            console.error("Erro no upload:", error);
            await sendMessage("❌ Falha ao enviar mídia.");
        } finally {
            // Remove o arquivo temporário
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error("Erro ao deletar arquivo temporário:", err);
            }
        }

        await sendSuccessReact();
    },
};
