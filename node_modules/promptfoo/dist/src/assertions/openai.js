"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIsValidOpenAiToolsCall = void 0;
const util_1 = require("../providers/openai/util");
const util_2 = require("../util");
const invariant_1 = __importDefault(require("../util/invariant"));
const handleIsValidOpenAiToolsCall = ({ assertion, output, provider, test, }) => {
    if (typeof output === 'object' && 'tool_calls' in output) {
        output = output.tool_calls;
    }
    const toolsOutput = output;
    if (!Array.isArray(toolsOutput) ||
        toolsOutput.length === 0 ||
        typeof toolsOutput[0].function.name !== 'string' ||
        typeof toolsOutput[0].function.arguments !== 'string') {
        return {
            pass: false,
            score: 0,
            reason: `OpenAI did not return a valid-looking tools response: ${JSON.stringify(toolsOutput)}`,
            assertion,
        };
    }
    let tools = provider.config.tools;
    if (tools) {
        tools = (0, util_2.maybeLoadToolsFromExternalFile)(tools, test.vars);
    }
    (0, invariant_1.default)(tools, `Tools are expected to be an array of objects with a function property. Got: ${JSON.stringify(tools)}`);
    try {
        toolsOutput.forEach((toolOutput) => {
            (0, util_1.validateFunctionCall)(toolOutput.function, tools.map((tool) => tool.function), test.vars);
        });
        return {
            pass: true,
            score: 1,
            reason: 'Assertion passed',
            assertion,
        };
    }
    catch (err) {
        return {
            pass: false,
            score: 0,
            reason: err.message,
            assertion,
        };
    }
};
exports.handleIsValidOpenAiToolsCall = handleIsValidOpenAiToolsCall;
//# sourceMappingURL=openai.js.map