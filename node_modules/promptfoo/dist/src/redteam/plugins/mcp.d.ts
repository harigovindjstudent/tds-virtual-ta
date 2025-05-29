import { RedteamGraderBase } from './base';
export declare const PLUGIN_DESCRIPTION: string;
export declare class MCPPluginGrader extends RedteamGraderBase {
    readonly id = "promptfoo:redteam:mcp";
    rubric: string;
    renderRubric(vars: {
        purpose: string;
        testVars: {
            attack_prompt: string;
        };
        output: string;
    }): string;
}
//# sourceMappingURL=mcp.d.ts.map