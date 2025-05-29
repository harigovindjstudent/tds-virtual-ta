"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserBehavior = void 0;
exports.promptUser = promptUser;
exports.promptYesNo = promptYesNo;
exports.checkServerRunning = checkServerRunning;
exports.openBrowser = openBrowser;
const opener_1 = __importDefault(require("opener"));
const readline_1 = __importDefault(require("readline"));
const constants_1 = require("../constants");
const logger_1 = __importDefault(require("../logger"));
var BrowserBehavior;
(function (BrowserBehavior) {
    BrowserBehavior[BrowserBehavior["ASK"] = 0] = "ASK";
    BrowserBehavior[BrowserBehavior["OPEN"] = 1] = "OPEN";
    BrowserBehavior[BrowserBehavior["SKIP"] = 2] = "SKIP";
    BrowserBehavior[BrowserBehavior["OPEN_TO_REPORT"] = 3] = "OPEN_TO_REPORT";
    BrowserBehavior[BrowserBehavior["OPEN_TO_REDTEAM_CREATE"] = 4] = "OPEN_TO_REDTEAM_CREATE";
})(BrowserBehavior || (exports.BrowserBehavior = BrowserBehavior = {}));
/**
 * Prompts the user with a question and returns a Promise that resolves with their answer
 */
async function promptUser(question) {
    return new Promise((resolve, reject) => {
        try {
            const rl = readline_1.default.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer);
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
/**
 * Prompts the user with a yes/no question and returns a Promise that resolves with a boolean
 */
async function promptYesNo(question, defaultYes = false) {
    const suffix = defaultYes ? '(Y/n): ' : '(y/N): ';
    const answer = await promptUser(`${question} ${suffix}`);
    if (defaultYes) {
        return !answer.toLowerCase().startsWith('n');
    }
    return answer.toLowerCase().startsWith('y');
}
async function checkServerRunning(port = (0, constants_1.getDefaultPort)()) {
    try {
        const response = await fetch(`http://localhost:${port}/health`);
        const data = await response.json();
        return data.status === 'OK' && data.version === constants_1.VERSION;
    }
    catch (err) {
        logger_1.default.debug(`Failed to check server health: ${String(err)}`);
        return false;
    }
}
async function openBrowser(browserBehavior, port = (0, constants_1.getDefaultPort)()) {
    const baseUrl = `http://localhost:${port}`;
    let url = baseUrl;
    if (browserBehavior === BrowserBehavior.OPEN_TO_REPORT) {
        url = `${baseUrl}/report`;
    }
    else if (browserBehavior === BrowserBehavior.OPEN_TO_REDTEAM_CREATE) {
        url = `${baseUrl}/redteam/setup`;
    }
    const doOpen = async () => {
        try {
            logger_1.default.info('Press Ctrl+C to stop the server');
            await (0, opener_1.default)(url);
        }
        catch (err) {
            logger_1.default.error(`Failed to open browser: ${String(err)}`);
        }
    };
    if (browserBehavior === BrowserBehavior.ASK) {
        const shouldOpen = await promptYesNo('Open URL in browser?', false);
        if (shouldOpen) {
            await doOpen();
        }
    }
    else if (browserBehavior !== BrowserBehavior.SKIP) {
        await doOpen();
    }
}
//# sourceMappingURL=server.js.map