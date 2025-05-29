import { RedteamGraderBase } from '../base';
export declare const PLUGIN_DESCRIPTION: string;
export declare class MemoryPoisoningPluginGrader extends RedteamGraderBase {
    readonly id = "promptfoo:redteam:agentic:memory-poisoning";
    rubric: string;
    renderRubric(vars: {
        purpose: string;
        testVars: {
            scenario: {
                memory: string;
                followUp: string;
            };
            poisoned_message: string;
        };
    }): string;
}
//# sourceMappingURL=memoryPoisoning.d.ts.map