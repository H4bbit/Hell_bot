const { BOT_NAME, PREFIX, ASSETS_DIR } = require(`./../../config`);

const date = new Date();
const path = require('path');

module.exports = {
    name: "menu",
    description: "Menu de comandos",
    commands: ["menu", "help"],
    usage: `${PREFIX}menu`,
    handle: async ({ sendImageFromFile, sendReact }) => {
        await sendReact("🤖");
        await sendImageFromFile(path.join(ASSETS_DIR, 'menu.png'),
            `
╭━━⪩ BEM VINDO! ⪨━━
▢
▢ • ${BOT_NAME}
▢ • Data: ${date.toLocaleDateString("pt-br")}
▢ • Hora: ${date.toLocaleTimeString("pt-br")}
▢ • Prefixo: "${PREFIX}"
▢
╰━━─「🪐」─━━

╭━━⪩ ADMINS ⪨━━
▢
▢ • ${PREFIX}anti-link (1/0)
▢ • ${PREFIX}ban
▢ • ${PREFIX}hidetag
▢
╰━━─「⭐」─━━

╭━━⪩ MENU ⪨━━
▢
▢ • ${PREFIX}ping
▢ • ${PREFIX}sticker
▢
╰━━─「🚀」─━━

╭━━⪩ MENU NSFW ⪨━━
▢
▢ • ${PREFIX}r34
▢
╰━━─「🌌」─━━
`);
    },
};
