import type { ApiProvider, CallApiContextParams, CallApiOptionsParams } from '../../types';
export declare class ServerToolDiscoveryMultiProvider implements ApiProvider {
    config: any;
    private sessionId;
    private messages;
    private roundNum;
    private state;
    constructor(config: any);
    id(): string;
    private formatMessageContent;
    private parseToolsFromResponse;
    callApi(prompt: string | unknown, context?: CallApiContextParams, options?: CallApiOptionsParams): Promise<any>;
}
//# sourceMappingURL=toolDiscoveryMulti.d.ts.map