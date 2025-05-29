import type { ApiProvider, CallApiContextParams, ProviderOptions, ProviderResponse } from '../../types/providers';
import { AwsBedrockGenericProvider, type BedrockAmazonNovaSonicGenerationOptions } from '../bedrock';
export declare class NovaSonicProvider extends AwsBedrockGenericProvider implements ApiProvider {
    private sessions;
    private bedrockClient;
    config: BedrockAmazonNovaSonicGenerationOptions;
    constructor(modelName?: string, options?: ProviderOptions);
    private createSession;
    private sendEvent;
    endSession(sessionId: string): Promise<void>;
    sendTextMessage(sessionId: string, role: 'USER' | 'ASSISTANT' | 'SYSTEM', prompt: string): Promise<void>;
    sendSystemPrompt(sessionId: string, prompt: string): Promise<void>;
    sendChatTextHistory(sessionId: string, role: 'USER' | 'ASSISTANT', prompt: string): Promise<void>;
    callApi(prompt: string, context?: CallApiContextParams): Promise<ProviderResponse>;
    private createAsyncIterable;
}
//# sourceMappingURL=nova-sonic.d.ts.map