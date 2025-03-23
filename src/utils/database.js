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

db.inactiveGroups = new Datastore({
    filename: path.join(databasePath, "inactive_groups.db"),
    autoload: true
});

//let  messages = {}
// message.store = async ...
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
    await db.messages.findOneAsync({ chatId, messageId })
};
// clear messages 
exports.clearMessages = async () => {
    await db.messages.removeAsync({}, { multi: true })
};



// Salvar marca do usuário
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

// Obter marca do usuário
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

// Ativar grupo
exports.activateGroup = (groupId) => {
    return new Promise((resolve, reject) => {
        db.inactiveGroups.remove({ groupId }, {}, (err, numRemoved) => {
            if (err) {
                console.error("Erro ao ativar grupo:", err);
                reject(err);
            } else {
                resolve(numRemoved > 0);
            }
        });
    });
};

// Desativar grupo
exports.deactivateGroup = (groupId) => {
    return new Promise((resolve, reject) => {
        db.inactiveGroups.insert({ groupId }, (err) => {
            if (err) {
                console.error("Erro ao desativar grupo:", err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// Verificar se o grupo está ativo
exports.isActiveGroup = (groupId) => {
    return new Promise((resolve, reject) => {
        db.inactiveGroups.findOne({ groupId }, (err, doc) => {
            if (err) {
                console.error("Erro ao verificar status do grupo:", err);
                reject(err);
            } else {
                resolve(!doc);
            }
        });
    });
};
