"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleLiveProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
const ws_1 = __importDefault(require("ws"));
const envars_1 = require("../../envars");
const logger_1 = __importDefault(require("../../logger"));
const pythonUtils_1 = require("../../python/pythonUtils");
const util_1 = require("./util");
const formatContentMessage = (contents, contentIndex) => {
    if (contents[contentIndex].role != 'user') {
        throw new Error('Can only take user role inputs.');
    }
    if (contents[contentIndex].parts.length != 1) {
        throw new Error('Unexpected number of parts in user input.');
    }
    const userMessage = contents[contentIndex].parts[0].text;
    const contentMessage = {
        client_content: {
            turns: [
                {
                    role: 'user',
                    parts: [{ text: userMessage }],
                },
            ],
            turn_complete: true,
        },
    };
    return contentMessage;
};
class GoogleLiveProvider {
    constructor(modelName, options) {
        this.config = options.config;
        this.modelName = modelName;
    }
    id() {
        return `google:live:${this.modelName}`;
    }
    toString() {
        return `[Google Live Provider ${this.modelName}]`;
    }
    getApiKey() {
        return this.config.apiKey || (0, envars_1.getEnvString)('GOOGLE_API_KEY');
    }
    async callApi(prompt, context) {
        // https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini#gemini-pro
        if (!this.getApiKey()) {
            throw new Error('Google API key is not set. Set the GOOGLE_API_KEY environment variable or add `apiKey` to the provider config.');
        }
        const { contents, systemInstruction } = (0, util_1.geminiFormatAndSystemInstructions)(prompt, context?.vars, this.config.systemInstruction);
        let contentIndex = 0;
        let statefulApi;
        if (this.config.functionToolStatefulApi?.file) {
            try {
                // Use the validatePythonPath function to get the correct Python executable
                const pythonPath = await (0, pythonUtils_1.validatePythonPath)(this.config.functionToolStatefulApi.pythonExecutable ||
                    (0, envars_1.getEnvString)('PROMPTFOO_PYTHON') ||
                    'python3', !!this.config.functionToolStatefulApi.pythonExecutable ||
                    !!(0, envars_1.getEnvString)('PROMPTFOO_PYTHON'));
                logger_1.default.debug(`Spawning API with Python executable: ${pythonPath}`);
                statefulApi = (0, child_process_1.spawn)(pythonPath, [this.config.functionToolStatefulApi.file]);
                // Add error handling for the Python process
                statefulApi.on('error', (err) => {
                    logger_1.default.error(`Error spawning Python process: ${JSON.stringify(err)}`);
                });
                // Log output from the Python process for debugging
                statefulApi.stdout?.on('data', (data) => {
                    logger_1.default.debug(`Python API stdout: ${data.toString()}`);
                });
                statefulApi.stderr?.on('data', (data) => {
                    logger_1.default.error(`Python API stderr: ${data.toString()}`);
                });
            }
            catch (err) {
                logger_1.default.error(`Failed to spawn Python API: ${JSON.stringify(err)}`);
            }
        }
        return new Promise((resolve) => {
            const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.getApiKey()}`;
            const ws = new ws_1.default(url);
            const timeout = setTimeout(() => {
                ws.close();
                resolve({ error: 'WebSocket request timed out' });
            }, this.config.timeoutMs || 10000);
            let response_text_total = '';
            const function_calls_total = [];
            ws.onmessage = async (event) => {
                logger_1.default.debug(`Received WebSocket response: ${event.data}`);
                try {
                    let responseData;
                    if (typeof event.data === 'string') {
                        responseData = event.data;
                    }
                    else if (Buffer.isBuffer(event.data)) {
                        responseData = event.data.toString('utf-8');
                    }
                    else {
                        // Handle cases where event.data is of an unexpected type
                        logger_1.default.debug(`Unexpected event.data type: ${typeof event.data} ${event.data}`);
                        ws.close();
                        resolve({ error: 'Unexpected response data format' });
                        return;
                    }
                    const responseText = await new Response(responseData).text();
                    const response = JSON.parse(responseText);
                    // Handle setup complete response
                    if (response.setupComplete) {
                        const contentMessage = formatContentMessage(contents, contentIndex);
                        contentIndex += 1;
                        logger_1.default.debug(`WebSocket sent: ${JSON.stringify(contentMessage)}`);
                        ws.send(JSON.stringify(contentMessage));
                    }
                    // Handle model response
                    else if (response.serverContent?.modelTurn?.parts?.[0]?.text) {
                        response_text_total =
                            response_text_total + response.serverContent.modelTurn.parts[0].text;
                    }
                    else if (response.toolCall?.functionCalls) {
                        for (const functionCall of response.toolCall.functionCalls) {
                            function_calls_total.push(functionCall);
                            if (functionCall && functionCall.id && functionCall.name) {
                                let callbackResponse = {};
                                // Handle function tool callbacks
                                const functionName = functionCall.name;
                                try {
                                    if (this.config.functionToolCallbacks &&
                                        this.config.functionToolCallbacks[functionName]) {
                                        callbackResponse = await this.config.functionToolCallbacks[functionName](JSON.stringify(typeof functionCall.args === 'string'
                                            ? JSON.parse(functionCall.args)
                                            : functionCall.args));
                                    }
                                    else if (this.config.functionToolStatefulApi) {
                                        const url = new URL(functionName, this.config.functionToolStatefulApi.url).href;
                                        try {
                                            const axiosResponse = await axios_1.default.get(url, {
                                                params: functionCall.args || null,
                                            });
                                            callbackResponse = axiosResponse.data;
                                        }
                                        catch {
                                            const axiosResponse = await axios_1.default.post(url, functionCall.args || null);
                                            callbackResponse = axiosResponse.data;
                                        }
                                        logger_1.default.debug(`Stateful api response: ${JSON.stringify(callbackResponse)}`);
                                    }
                                }
                                catch (err) {
                                    callbackResponse = {
                                        error: `Error executing function ${functionName}: ${JSON.stringify(err)}`,
                                    };
                                    logger_1.default.error(`Error executing function ${functionName}: ${JSON.stringify(err)}`);
                                }
                                const toolMessage = {
                                    tool_response: {
                                        function_responses: {
                                            id: functionCall.id,
                                            name: functionName,
                                            response: callbackResponse,
                                        },
                                    },
                                };
                                logger_1.default.debug(`WebSocket sent: ${JSON.stringify(toolMessage)}`);
                                ws.send(JSON.stringify(toolMessage));
                            }
                        }
                    }
                    else if (response.serverContent?.turnComplete) {
                        if (contentIndex < contents.length) {
                            const contentMessage = formatContentMessage(contents, contentIndex);
                            contentIndex += 1;
                            logger_1.default.debug(`WebSocket sent: ${JSON.stringify(contentMessage)}`);
                            ws.send(JSON.stringify(contentMessage));
                        }
                        else {
                            let statefulApiState;
                            if (this.config.functionToolStatefulApi) {
                                try {
                                    const url = new URL('get_state', this.config.functionToolStatefulApi.url).href;
                                    const apiResponse = await axios_1.default.get(url);
                                    statefulApiState = apiResponse.data;
                                    logger_1.default.debug(`Stateful api state: ${JSON.stringify(statefulApiState)}`);
                                }
                                catch (err) {
                                    logger_1.default.error(`Error retrieving final state of api: ${JSON.stringify(err)}`);
                                }
                            }
                            resolve({
                                output: {
                                    text: response_text_total,
                                    toolCall: { functionCalls: function_calls_total },
                                    statefulApiState,
                                },
                                metadata: {
                                    ...(response.groundingMetadata && {
                                        groundingMetadata: response.groundingMetadata,
                                    }),
                                    ...(response.groundingChunks && { groundingChunks: response.groundingChunks }),
                                    ...(response.groundingSupports && {
                                        groundingSupports: response.groundingSupports,
                                    }),
                                    ...(response.webSearchQueries && { webSearchQueries: response.webSearchQueries }),
                                },
                            });
                            ws.close();
                        }
                    }
                }
                catch (err) {
                    logger_1.default.debug(`Failed to process response: ${JSON.stringify(err)}`);
                    ws.close();
                    resolve({ error: `Failed to process response: ${JSON.stringify(err)}` });
                }
            };
            ws.onerror = (err) => {
                clearTimeout(timeout);
                logger_1.default.debug(`WebSocket Error: ${JSON.stringify(err)}`);
                ws.close();
                resolve({ error: `WebSocket error: ${JSON.stringify(err)}` });
            };
            ws.onclose = (event) => {
                if (statefulApi && !statefulApi.killed) {
                    statefulApi.kill('SIGTERM');
                    logger_1.default.debug('Python process shutdown.');
                }
                clearTimeout(timeout);
            };
            ws.onopen = () => {
                logger_1.default.debug('WebSocket connection is opening...');
                const setupMessage = {
                    setup: {
                        model: `models/${this.modelName}`,
                        generation_config: {
                            context: this.config.context,
                            examples: this.config.examples,
                            stopSequences: this.config.stopSequences,
                            temperature: this.config.temperature,
                            maxOutputTokens: this.config.maxOutputTokens,
                            topP: this.config.topP,
                            topK: this.config.topK,
                            ...this.config.generationConfig,
                        },
                        ...(this.config.toolConfig ? { toolConfig: this.config.toolConfig } : {}),
                        ...(this.config.tools ? { tools: (0, util_1.loadFile)(this.config.tools, context?.vars) } : {}),
                        ...(systemInstruction ? { systemInstruction } : {}),
                    },
                };
                logger_1.default.debug(`WebSocket sent: ${JSON.stringify(setupMessage)}`);
                ws.send(JSON.stringify(setupMessage));
            };
        });
    }
}
exports.GoogleLiveProvider = GoogleLiveProvider;
//# sourceMappingURL=live.js.map