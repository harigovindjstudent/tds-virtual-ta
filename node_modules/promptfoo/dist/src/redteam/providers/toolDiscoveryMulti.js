"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerToolDiscoveryMultiProvider = void 0;
const crypto_1 = require("crypto");
const logger_1 = __importDefault(require("../../logger"));
const remoteGeneration_1 = require("../remoteGeneration");
// Match server's MAX_ROUNDS constant
const MAX_ROUNDS = 15;
class ServerToolDiscoveryMultiProvider {
    constructor(config) {
        this.config = config;
        this.messages = [];
        this.roundNum = 0;
        this.state = {
            discoveredTools: [],
            currentPhase: 0,
            currentToolIndex: 0,
        };
        logger_1.default.debug(`[ServerToolDiscovery] Initialized with config: ${JSON.stringify(config)}`);
        // Generate a unique session ID for this provider instance using cryptographically secure random bytes
        this.sessionId = `session_${Date.now()}_${(0, crypto_1.randomBytes)(16).toString('hex')}`;
    }
    id() {
        return 'tool-discovery:multi-turn';
    }
    formatMessageContent(content) {
        if (typeof content === 'string') {
            return content;
        }
        // Handle function calls
        if (Array.isArray(content) && content.length > 0 && content[0].type === 'function') {
            return JSON.stringify(content);
        }
        // Handle other non-string content
        try {
            return JSON.stringify(content);
        }
        catch {
            return String(content);
        }
    }
    parseToolsFromResponse(response) {
        try {
            // Look for JSON block in the response
            const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
            if (!jsonMatch) {
                return [];
            }
            const tools = JSON.parse(jsonMatch[1]);
            return tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters.map((p) => `${p.name} (${p.type}): ${p.description}`),
                usage: tool.example,
            }));
        }
        catch (error) {
            logger_1.default.warn(`[ServerToolDiscovery] Failed to parse tools from response: ${error}`);
            return [];
        }
    }
    async callApi(prompt, context, options) {
        if (!context?.originalProvider) {
            throw new Error('Expected originalProvider to be set');
        }
        try {
            let isComplete = false;
            let lastResponse = null;
            let metadata = {};
            // Continue conversation until max rounds or server indicates completion
            while (!isComplete && this.roundNum < MAX_ROUNDS) {
                logger_1.default.debug(`[ServerToolDiscovery] Round ${this.roundNum}, sending messages: ${JSON.stringify(this.messages)}`);
                // Get server's next message
                const response = await fetch((0, remoteGeneration_1.getRemoteGenerationUrl)(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        task: 'tool-discovery:multi-turn',
                        i: this.roundNum,
                        messages: this.messages,
                        state: this.state,
                    }),
                });
                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }
                const data = await response.json();
                logger_1.default.debug(`[ServerToolDiscovery] Server response: ${JSON.stringify(data)}`);
                // Check if server signals completion
                if (data.done) {
                    isComplete = true;
                }
                // Update state from server response
                if (data.state) {
                    this.state = data.state;
                }
                // Process server's message and get target response
                if (data.message?.content) {
                    // Add attacker message (from server) with correct role
                    const attackerMessage = {
                        role: 'user',
                        content: data.message.content,
                    };
                    this.messages.push(attackerMessage);
                    logger_1.default.debug(`[ServerToolDiscovery] Added attacker message: ${JSON.stringify(attackerMessage)}`);
                    // Get response from target model
                    const targetResponse = await context.originalProvider.callApi(data.message.content, context, options);
                    // Add target's response with correct role
                    const assistantMessage = {
                        role: 'assistant',
                        content: this.formatMessageContent(targetResponse.output),
                    };
                    this.messages.push(assistantMessage);
                    logger_1.default.debug(`[ServerToolDiscovery] Added assistant message: ${JSON.stringify(assistantMessage)}`);
                    lastResponse = targetResponse.output;
                }
                // Update metadata and increment round number
                this.roundNum++;
                metadata = {
                    state: this.state,
                    messages: this.messages,
                    sessionId: this.sessionId,
                    roundsCompleted: this.roundNum,
                };
                // Check if conversation is complete
                isComplete =
                    isComplete || // Either server signaled done
                        (this.state.currentPhase === 3 && // Or we're in EXPLOITATION phase
                            this.state.currentToolIndex >= this.state.discoveredTools.length - 1);
            }
            // Parse tools from the last response if available
            if (lastResponse) {
                const parsedTools = this.parseToolsFromResponse(lastResponse);
                if (parsedTools.length > 0) {
                    metadata = {
                        ...metadata,
                        state: {
                            ...this.state,
                            discoveredTools: parsedTools,
                        },
                    };
                }
            }
            // Set final metadata with accurate stop reason
            metadata = {
                ...metadata,
                stopReason: isComplete ? 'Full exploitation complete' : 'Max rounds reached',
            };
            return {
                output: lastResponse,
                metadata,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_1.default.error(`[ServerToolDiscovery] Error: ${errorMessage}`);
            throw error;
        }
    }
}
exports.ServerToolDiscoveryMultiProvider = ServerToolDiscoveryMultiProvider;
//# sourceMappingURL=toolDiscoveryMulti.js.map