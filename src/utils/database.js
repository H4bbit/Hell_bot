const path = require("path");
const Datastore = require("@seald-io/nedb");

const databasePath = path.resolve(__dirname, "..", "..", "database");

let db = {}
// Inicializando bancos de dados
db.messages = new Datastore({
    filename: path.join(databasePath, "messages.db"),
    autoload: true
});

db.userMarks = new Datastore({
    filename: path.join(databasePath, "user_marks.db"),
    autoload: true
});

db.activeGroups = new Datastore({
    filename: path.join(databasePath, "active_groups.db"),
    autoload: true
});

db.antilinkGroups = new Datastore({
    filename: path.join(databasePath, "antilink_groups.db"),
    autoload: true
});

db.nsfwGroups = new Datastore({
    filename: path.join(databasePath, "nsfw_groups.db"),
    autoload: true
});

//
// Armazenar mesagens
exports.storeMessages = async (chatId, messageId, message) => {
    const data = {
        chatId,
        messageId,
        message: JSON.stringify(message),
        timestamp: Date.now(),
    };
    await db.messages.insertAsync(data)
};

// Obter mesagens
exports.getMessages = async (chatId, messageId) => {
    console.log(await db.messages.findOneAsync({}))
    return await db.messages.findOneAsync({ chatId, messageId })
};
// clear messages 
exports.clearMessages = async () => {
    await db.messages.removeAsync({}, { multi: true })
};


/*
exports.saveUserMark = (userJid, autor, pack) => {
    return new Promise((resolve, reject) => {
        db.userMarks.update(
            { userJid },
            { userJid, autor, pack },
            { upsert: true },
            (err) => {
                if (err) {
                    console.error("Erro ao salvar marca do usuário:", err);
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
};

exports.getUserMark = (userJid) => {
    return new Promise((resolve, reject) => {
        db.userMarks.findOne({ userJid }, (err, doc) => {
            if (err) {
                console.error("Erro ao obter marca do usuário:", err);
                reject(err);
            } else {
                resolve(doc || null);
            }
        });
    });
};
*/

// Ativar grupo
exports.activateGroup = async (groupId) => {
    await db.activeGroups.insertAsync({ groupId })
    console.log(await db.activeGroups.findOneAsync({}))
};

// Desativar grupo
exports.deactivateGroup = async (groupId) => {
    await db.activeGroups.removeAsync({ groupId })
    console.log(await db.activeGroups.findOneAsync({}))
};

// Verificar se o grupo está ativo
exports.isActiveGroup = async (groupId) => {
    console.log(await db.activeGroups.findOneAsync({}))
    return await db.activeGroups.findOneAsync({ groupId })
};


exports.activateAntiLinkGroup = async (groupId) => {
    await db.antilinkGroups.insertAsync({ groupId })
}

exports.deactivateAntiLinkGroup = async (groupId) => {
    await db.antilinkGroups.removeAsync({ groupId })
}

exports.isActivateNSFWGroup = async (groupId) => {
    console.log(await db.nsfwGroups.findOneAsync({}));
    return await db.nsfwGroups.findOneAsync({ groupId })
}
exports.activateNSFWGroup = async (groupId) => {
    await db.nsfwGroups.insertAsync({ groupId })
    console.log(await db.nsfwGroups.findOneAsync({}));
}

exports.deactivateNSFWGroup = async (groupId) => {
    await db.nsfwGroups.removeAsync({ groupId })
    console.log(await db.nsfwGroups.findOneAsync({}));
}
