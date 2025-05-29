import type { Assertion, ApiProvider, CallApiContextParams, CallApiOptionsParams, ProviderResponse, RedteamObjectConfig, TestCase } from '../../types';
import { RedteamPluginBase, RedteamGraderBase } from './base';
export declare const PLUGIN_ID = "promptfoo:redteam:tool-discovery:multi-turn";
interface ToolDiscoveryConfig extends RedteamObjectConfig {
    injectVar: string;
    [key: string]: any;
}
export declare class ToolDiscoveryMultiTurnPlugin extends RedteamPluginBase {
    readonly id = "promptfoo:redteam:tool-discovery:multi-turn";
    protected config: ToolDiscoveryConfig;
    constructor(provider: ApiProvider, purpose: string, injectVar: string, config: any);
    protected getTemplate(): Promise<string>;
    protected getAssertions(): Assertion[];
    callApi(prompt: string, context?: CallApiContextParams, options?: CallApiOptionsParams): Promise<ProviderResponse>;
    generateTests(n: number): Promise<TestCase[]>;
    private getRandomTemplate;
}
export declare class ToolDiscoveryMultiTurnGrader extends RedteamGraderBase {
    readonly id = "promptfoo:redteam:tool-discovery:multi-turn";
    rubric: string;
}
export {};
//# sourceMappingURL=toolDiscoveryMultiTurn.d.ts.map