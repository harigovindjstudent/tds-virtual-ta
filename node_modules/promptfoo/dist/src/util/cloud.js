"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRequest = makeRequest;
exports.targetApiBuildDate = targetApiBuildDate;
exports.getProviderFromCloud = getProviderFromCloud;
exports.getConfigFromCloud = getConfigFromCloud;
exports.cloudCanAcceptChunkedResults = cloudCanAcceptChunkedResults;
const fetch_1 = require("../fetch");
const cloud_1 = require("../globalConfig/cloud");
const logger_1 = __importDefault(require("../logger"));
const providers_1 = require("../validators/providers");
const invariant_1 = __importDefault(require("./invariant"));
const CHUNKED_RESULTS_BUILD_DATE = new Date('2025-01-10');
function makeRequest(path, method, body) {
    const apiHost = cloud_1.cloudConfig.getApiHost();
    const apiKey = cloud_1.cloudConfig.getApiKey();
    const url = `${apiHost}/${path}`;
    try {
        return (0, fetch_1.fetchWithProxy)(url, {
            method,
            body: JSON.stringify(body),
            headers: { Authorization: `Bearer ${apiKey}` },
        });
    }
    catch (e) {
        logger_1.default.error(`[Cloud] Failed to make request to ${url}: ${e}`);
        if (e.cause) {
            logger_1.default.error(`Cause: ${e.cause}`);
        }
        throw e;
    }
}
async function targetApiBuildDate() {
    try {
        const response = await makeRequest('version', 'GET');
        const data = await response.json();
        const { buildDate } = data;
        logger_1.default.debug(`[targetApiBuildDate] ${buildDate}`);
        if (buildDate) {
            return new Date(buildDate);
        }
        return null;
    }
    catch {
        return null;
    }
}
async function getProviderFromCloud(id) {
    if (!cloud_1.cloudConfig.isEnabled()) {
        throw new Error(`Could not fetch Provider ${id} from cloud. Cloud config is not enabled. Please run \`promptfoo auth login\` to login.`);
    }
    try {
        const response = await makeRequest(`api/providers/${id}`, 'GET');
        if (!response.ok) {
            const errorMessage = await response.text();
            logger_1.default.error(`[Cloud] Failed to fetch provider from cloud: ${errorMessage}. HTTP Status: ${response.status} -- ${response.statusText}.`);
            throw new Error(`Failed to fetch provider from cloud: ${response.statusText}`);
        }
        const body = await response.json();
        logger_1.default.debug(`Provider fetched from cloud: ${id}`);
        logger_1.default.debug(`Provider from cloud: ${JSON.stringify(body, null, 2)}`);
        const provider = providers_1.ProviderOptionsSchema.parse(body.config);
        // The provider options schema has ID field as optional but we know it's required for cloud providers
        (0, invariant_1.default)(provider.id, `Provider ${id} has no id in ${body.config}`);
        return { ...provider, id: provider.id };
    }
    catch (e) {
        logger_1.default.error(`Failed to fetch provider from cloud: ${id}.`);
        logger_1.default.error(String(e));
        throw new Error(`Failed to fetch provider from cloud: ${id}.`);
    }
}
async function getConfigFromCloud(id, providerId) {
    if (!cloud_1.cloudConfig.isEnabled()) {
        throw new Error(`Could not fetch Config ${id} from cloud. Cloud config is not enabled. Please run \`promptfoo auth login\` to login.`);
    }
    try {
        const response = await makeRequest(`api/redteam/configs/${id}/unified${providerId ? `?providerId=${providerId}` : ''}`, 'GET');
        if (!response.ok) {
            const errorMessage = await response.text();
            logger_1.default.error(`[Cloud] Failed to fetch config from cloud: ${errorMessage}. HTTP Status: ${response.status} -- ${response.statusText}.`);
            throw new Error(`Failed to fetch config from cloud: ${response.statusText}`);
        }
        const body = await response.json();
        logger_1.default.info(`Config fetched from cloud: ${id}`);
        logger_1.default.debug(`Config from cloud: ${JSON.stringify(body, null, 2)}`);
        return body;
    }
    catch (e) {
        logger_1.default.error(`Failed to fetch config from cloud: ${id}.`);
        logger_1.default.error(String(e));
        throw new Error(`Failed to fetch config from cloud: ${id}.`);
    }
}
async function cloudCanAcceptChunkedResults() {
    const buildDate = await targetApiBuildDate();
    return buildDate != null && buildDate > CHUNKED_RESULTS_BUILD_DATE;
}
//# sourceMappingURL=cloud.js.map