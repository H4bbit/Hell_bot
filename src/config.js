const path = require('path');
require('dotenv').config();
const env = process.env;
//gemini api key 
exports.GEMINI_API_KEY = env.GEMINI_API_KEY || "";
exports.BOT_NAME = "𐙞 Hell Bot  ⃟😈";

exports.BOT_NUMBER = env.BOT_NUMBER;
exports.BOT_OWNER = env.BOT_OWNER;
exports.ASSETS_DIR = path.join(__dirname, '..', 'assets');
exports.COMMANDS_DIR = path.join(__dirname, 'commands');
exports.TIMEOUT_IN_MS_BY_EVENT = 500;
exports.PREFIX = ",";
exports.TEMP_DIR = path.resolve(__dirname, '..', 'assets', 'temp');

// exports.OPEN_IA_KEY = "";
