export declare const DEFAULT_NUM_TESTS_PER_PLUGIN = 5;
export declare const REDTEAM_MODEL = "openai:chat:gpt-4.1-2025-04-14";
export declare const LLAMA_GUARD_REPLICATE_PROVIDER = "replicate:moderation:meta/llama-guard-3-8b:146d1220d447cdcc639bc17c5f6137416042abee6ae153a2615e6ef5749205c8";
export declare const LLAMA_GUARD_ENABLED_CATEGORIES: string[];
export declare const FOUNDATION_PLUGINS: readonly ["ascii-smuggling", "beavertails", "bias:gender", "contracts", "cyberseceval", "donotanswer", "divergent-repetition", "excessive-agency", "hallucination", "harmful:chemical-biological-weapons", "harmful:child-exploitation", "harmful:copyright-violations", "harmful:cybercrime", "harmful:cybercrime:malicious-code", "harmful:graphic-content", "harmful:harassment-bullying", "harmful:hate", "harmful:illegal-activities", "harmful:illegal-drugs", "harmful:illegal-drugs:meth", "harmful:indiscriminate-weapons", "harmful:insults", "harmful:intellectual-property", "harmful:misinformation-disinformation", "harmful:non-violent-crime", "harmful:profanity", "harmful:radicalization", "harmful:self-harm", "harmful:sex-crime", "harmful:sexual-content", "harmful:specialized-advice", "harmful:unsafe-practices", "harmful:violent-crime", "harmful:weapons:ied", "hijacking", "imitation", "overreliance", "pii:direct", "pliny", "politics", "religion"];
export declare const AGENTIC_PLUGINS: readonly ["agentic:memory-poisoning"];
export type AgenticPlugin = (typeof AGENTIC_PLUGINS)[number];
export declare const COLLECTIONS: readonly ["default", "foundation", "harmful", "pii"];
export type Collection = (typeof COLLECTIONS)[number];
export declare const UNALIGNED_PROVIDER_HARM_PLUGINS: {
    readonly 'bias:gender': "Gender Bias";
    readonly 'harmful:child-exploitation': "Child Exploitation";
    readonly 'harmful:hate': "Hate";
    readonly 'harmful:indiscriminate-weapons': "Indiscriminate Weapons";
    readonly 'harmful:non-violent-crime': "Non-Violent Crimes";
    readonly 'harmful:self-harm': "Self-Harm";
    readonly 'harmful:sex-crime': "Sex Crimes";
    readonly 'harmful:sexual-content': "Sexual Content";
    readonly 'harmful:violent-crime': "Violent Crimes";
    readonly 'harmful:chemical-biological-weapons': "Chemical & Biological Weapons";
    readonly 'harmful:copyright-violations': "Copyright Violations - Copyrighted text";
    readonly 'harmful:cybercrime': "Cybercrime & Unauthorized Intrusion - Hacking and Malware";
    readonly 'harmful:graphic-content': "Graphic & age-restricted content";
    readonly 'harmful:harassment-bullying': "Harassment & Bullying";
    readonly 'harmful:illegal-activities': "Illegal Activities - Fraud & scams";
    readonly 'harmful:illegal-drugs': "Illegal Drugs";
    readonly 'harmful:unsafe-practices': "Promotion of unsafe practices";
    readonly 'harmful:insults': "Insults and personal attacks";
    readonly 'harmful:profanity': "Requests containing profanity";
    readonly 'harmful:radicalization': "Radicalization";
    readonly 'harmful:illegal-drugs:meth': "Methamphetamine";
    readonly 'harmful:weapons:ied': "Improvised Explosive Devices";
    readonly 'harmful:cybercrime:malicious-code': "Malicious Code";
};
export type UnalignedProviderHarmPlugin = keyof typeof UNALIGNED_PROVIDER_HARM_PLUGINS;
export declare const REDTEAM_PROVIDER_HARM_PLUGINS: {
    readonly 'harmful:intellectual-property': "Intellectual Property violation";
    readonly 'harmful:privacy': "Privacy violations";
};
export type RedTeamProviderHarmPlugin = keyof typeof REDTEAM_PROVIDER_HARM_PLUGINS;
export declare const HARM_PLUGINS: {
    readonly 'harmful:intellectual-property': "Intellectual Property violation";
    readonly 'harmful:privacy': "Privacy violations";
    readonly 'bias:gender': "Gender Bias";
    readonly 'harmful:child-exploitation': "Child Exploitation";
    readonly 'harmful:hate': "Hate";
    readonly 'harmful:indiscriminate-weapons': "Indiscriminate Weapons";
    readonly 'harmful:non-violent-crime': "Non-Violent Crimes";
    readonly 'harmful:self-harm': "Self-Harm";
    readonly 'harmful:sex-crime': "Sex Crimes";
    readonly 'harmful:sexual-content': "Sexual Content";
    readonly 'harmful:violent-crime': "Violent Crimes";
    readonly 'harmful:chemical-biological-weapons': "Chemical & Biological Weapons";
    readonly 'harmful:copyright-violations': "Copyright Violations - Copyrighted text";
    readonly 'harmful:cybercrime': "Cybercrime & Unauthorized Intrusion - Hacking and Malware";
    readonly 'harmful:graphic-content': "Graphic & age-restricted content";
    readonly 'harmful:harassment-bullying': "Harassment & Bullying";
    readonly 'harmful:illegal-activities': "Illegal Activities - Fraud & scams";
    readonly 'harmful:illegal-drugs': "Illegal Drugs";
    readonly 'harmful:unsafe-practices': "Promotion of unsafe practices";
    readonly 'harmful:insults': "Insults and personal attacks";
    readonly 'harmful:profanity': "Requests containing profanity";
    readonly 'harmful:radicalization': "Radicalization";
    readonly 'harmful:illegal-drugs:meth': "Methamphetamine";
    readonly 'harmful:weapons:ied': "Improvised Explosive Devices";
    readonly 'harmful:cybercrime:malicious-code': "Malicious Code";
    readonly 'harmful:misinformation-disinformation': "Misinformation & Disinformation - Harmful lies and propaganda";
    readonly 'harmful:specialized-advice': "Specialized Advice - Financial";
};
export type HarmPlugin = keyof typeof HARM_PLUGINS;
export declare const PII_PLUGINS: readonly ["pii:api-db", "pii:direct", "pii:session", "pii:social"];
export type PIIPlugin = (typeof PII_PLUGINS)[number];
export declare const BASE_PLUGINS: readonly ["contracts", "excessive-agency", "hallucination", "hijacking", "politics"];
export type BasePlugin = (typeof BASE_PLUGINS)[number];
export declare const ADDITIONAL_PLUGINS: readonly ["ascii-smuggling", "beavertails", "bfla", "bola", "cca", "competitors", "cross-session-leak", "cyberseceval", "debug-access", "divergent-repetition", "donotanswer", "harmbench", "imitation", "indirect-prompt-injection", "mcp", "overreliance", "pliny", "prompt-extraction", "rag-document-exfiltration", "rag-poisoning", "rbac", "reasoning-dos", "religion", "shell-injection", "sql-injection", "ssrf", "system-prompt-override", "tool-discovery:multi-turn", "tool-discovery", "unsafebench", "xstest"];
export type AdditionalPlugin = (typeof ADDITIONAL_PLUGINS)[number];
export declare const CONFIG_REQUIRED_PLUGINS: readonly ["intent", "policy"];
export type ConfigRequiredPlugin = (typeof CONFIG_REQUIRED_PLUGINS)[number];
export declare const STRATEGY_EXEMPT_PLUGINS: readonly ["pliny", "system-prompt-override", "tool-discovery:multi-turn", "unsafebench"];
export type StrategyExemptPlugin = (typeof STRATEGY_EXEMPT_PLUGINS)[number];
export type Plugin = AdditionalPlugin | BasePlugin | Collection | ConfigRequiredPlugin | HarmPlugin | PIIPlugin | AgenticPlugin;
export declare const DEFAULT_PLUGINS: ReadonlySet<Plugin>;
export declare const ALL_PLUGINS: readonly Plugin[];
export declare const FRAMEWORK_NAMES: Record<string, string>;
export declare const OWASP_LLM_TOP_10_NAMES: string[];
export declare const OWASP_API_TOP_10_NAMES: string[];
export declare const OWASP_AGENTIC_NAMES: string[];
export declare const OWASP_LLM_TOP_10_MAPPING: Record<string, {
    plugins: Plugin[];
    strategies: Strategy[];
}>;
export declare const OWASP_API_TOP_10_MAPPING: Record<string, {
    plugins: Plugin[];
    strategies: Strategy[];
}>;
/**
 * OWASP Agentic AI - Threats and Mitigations v1.0 (February 2025)
 */
export declare const OWASP_AGENTIC_REDTEAM_MAPPING: Record<string, {
    plugins: Plugin[];
    strategies: Strategy[];
}>;
/**
 * Maps each major phase of the OWASP GenAI Red Teaming Blueprint
 * to relevant Promptfoo plugins and strategies for automated testing.
 */
export declare const OWASP_LLM_RED_TEAM_MAPPING: Record<string, {
    plugins: Plugin[];
    strategies: Strategy[];
}>;
export declare const NIST_AI_RMF_MAPPING: Record<string, {
    plugins: Plugin[];
    strategies: Strategy[];
}>;
export declare const MITRE_ATLAS_MAPPING: Record<string, {
    plugins: Plugin[];
    strategies: Strategy[];
}>;
/**
 *  EU Artificial Intelligence Act
 *  ▸ Art. 5  (Prohibited AI practices)           – unacceptable-risk
 *  ▸ Annex III (High-risk AI systems, Art. 6(2)) – high-risk
 *
 *  Sources:
 *   * Art. 5 list of prohibitions  [oai_citation:0‡Artificial Intelligence Act](https://artificialintelligenceact.eu/article/5/?utm_source=chatgpt.com)
 *   * Annex III high-risk categories  [oai_citation:1‡Lexology](https://www.lexology.com/library/detail.aspx?g=ec2aab25-67aa-4635-87a0-fc43d9fd1f51&utm_source=chatgpt.com)
 */
export declare const EU_AI_ACT_MAPPING: Record<string, {
    plugins: Plugin[];
    strategies: Strategy[];
}>;
export declare const ALIASED_PLUGINS: readonly ["mitre:atlas", "nist:ai", "nist:ai:measure", "owasp:api", "owasp:llm", "owasp:llm:redteam:model", "owasp:llm:redteam:implementation", "owasp:llm:redteam:system", "owasp:llm:redteam:runtime", "toxicity", "bias", "misinformation", "illegal-activity", "personal-safety", "eu:ai-act", ...string[]];
export declare const ALIASED_PLUGIN_MAPPINGS: Record<string, Record<string, {
    plugins: string[];
    strategies: string[];
}>>;
export declare const FRAMEWORK_COMPLIANCE_IDS: readonly ["mitre:atlas", "nist:ai:measure", "owasp:api", "owasp:llm", "eu:ai-act"];
export type FrameworkComplianceId = (typeof FRAMEWORK_COMPLIANCE_IDS)[number];
export declare const DEFAULT_STRATEGIES: readonly ["basic", "jailbreak", "jailbreak:composite"];
export type DefaultStrategy = (typeof DEFAULT_STRATEGIES)[number];
export declare const MULTI_TURN_STRATEGIES: readonly ["crescendo", "goat"];
export type MultiTurnStrategy = (typeof MULTI_TURN_STRATEGIES)[number];
export declare const AGENTIC_STRATEGIES: readonly ["crescendo", "goat", "jailbreak", "jailbreak:tree", "pandamonium"];
export type AgenticStrategy = (typeof AGENTIC_STRATEGIES)[number];
export declare const DATASET_PLUGINS: readonly ["beavertails", "cyberseceval", "donotanswer", "harmbench", "pliny", "unsafebench", "xstest"];
export type DatasetPlugin = (typeof DATASET_PLUGINS)[number];
export declare const ADDITIONAL_STRATEGIES: readonly ["audio", "base64", "best-of-n", "citation", "crescendo", "gcg", "goat", "hex", "homoglyph", "image", "jailbreak:likert", "jailbreak:tree", "leetspeak", "math-prompt", "morse", "multilingual", "pandamonium", "piglatin", "prompt-injection", "retry", "rot13", "video"];
export type AdditionalStrategy = (typeof ADDITIONAL_STRATEGIES)[number];
export declare const STRATEGY_COLLECTIONS: readonly ["other-encodings"];
export type StrategyCollection = (typeof STRATEGY_COLLECTIONS)[number];
export declare const STRATEGY_COLLECTION_MAPPINGS: Record<StrategyCollection, string[]>;
export declare const ALL_STRATEGIES: ("default" | "basic" | "jailbreak" | "jailbreak:composite" | "audio" | "base64" | "best-of-n" | "citation" | "crescendo" | "gcg" | "goat" | "hex" | "homoglyph" | "image" | "jailbreak:likert" | "jailbreak:tree" | "leetspeak" | "math-prompt" | "morse" | "multilingual" | "pandamonium" | "piglatin" | "prompt-injection" | "retry" | "rot13" | "video" | "other-encodings")[];
export type Strategy = (typeof ALL_STRATEGIES)[number];
export declare const subCategoryDescriptions: Record<Plugin | Strategy, string>;
export declare const displayNameOverrides: Record<Plugin | Strategy, string>;
export declare enum Severity {
    Critical = "critical",
    High = "high",
    Medium = "medium",
    Low = "low"
}
export declare const severityDisplayNames: Record<Severity, string>;
export declare const riskCategorySeverityMap: Record<Plugin, Severity>;
export declare const riskCategories: Record<string, Plugin[]>;
export declare const categoryDescriptions: {
    'Security & Access Control': string;
    'Compliance & Legal': string;
    'Trust & Safety': string;
    Brand: string;
    Datasets: string;
};
export type TopLevelCategory = keyof typeof riskCategories;
export declare const categoryMapReverse: Record<string, string>;
export declare const categoryLabels: string[];
export declare const categoryAliases: Record<Plugin, string>;
export declare const categoryAliasesReverse: Record<string, string>;
export declare const pluginDescriptions: Record<Plugin, string>;
export declare const strategyDescriptions: Record<Strategy, string>;
export declare const strategyDisplayNames: Record<Strategy, string>;
export declare const PLUGIN_PRESET_DESCRIPTIONS: Record<string, string>;
export declare const DEFAULT_OUTPUT_PATH = "redteam.yaml";
//# sourceMappingURL=constants.d.ts.map