//const crypto = require('crypto');
import crypto from 'crypto'
//const webp = require('node-webpmux'); // Biblioteca para manipulação de WebP
import webp from "node-webpmux"
/**
 * Adiciona metadados EXIF personalizados a uma figurinha WebP
 * @param {Buffer} buffer - Buffer da imagem WebP original
 * @param {string} pack - Nome do pacote da figurinha
 * @param {string} autor - Nome do autor da figurinha
 * @returns {Promise<Buffer>} - Retorna um buffer da nova figurinha com os dados EXIF modificados
 */
export async function adicionarExif(buffer, pack, autor) {
    try {
        const img = new webp.Image();
        const stickerPackId = crypto.randomBytes(32).toString('hex');
        const json = {
            'sticker-pack-id': stickerPackId,
            'sticker-pack-name': pack,
            'sticker-pack-publisher': autor,
        };

        let exifAttr = Buffer.from([
            0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00,
            0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00,
            0x00, 0x00
        ]);

        let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
        let exif = Buffer.concat([exifAttr, jsonBuffer]);
        // Garante que o tamanho do JSON não exceda o limite 
        exif.writeUIntLE(jsonBuffer.length, 14, 4);
        await img.load(buffer);

        img.exif = exif;
        const bufferImagem = await img.save(null)
        return bufferImagem;

    } catch (err) {
        throw err;
    }
}


export async function lerMetadataWebp(buffer) {
    try {
        const img = new webp.Image();
        await img.load(buffer)
        const exifData = img.exif;
        if (!exifData) {
            return null;
        }

        let exifString = exifData.toString('utf8');
        const jsonStart = exifString.indexOf("{");
        console.log(exifString);
        exifString = exifString.substring(jsonStart);
        const jsonData = JSON.parse(exifString);
        return jsonData;
    } catch (error) {
        console.error("Erro ao ler metadados WebP:", error);
        return null;
    }

}

