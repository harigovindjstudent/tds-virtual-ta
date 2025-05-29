export declare enum BrowserBehavior {
    ASK = 0,
    OPEN = 1,
    SKIP = 2,
    OPEN_TO_REPORT = 3,
    OPEN_TO_REDTEAM_CREATE = 4
}
/**
 * Prompts the user with a question and returns a Promise that resolves with their answer
 */
export declare function promptUser(question: string): Promise<string>;
/**
 * Prompts the user with a yes/no question and returns a Promise that resolves with a boolean
 */
export declare function promptYesNo(question: string, defaultYes?: boolean): Promise<boolean>;
export declare function checkServerRunning(port?: number): Promise<boolean>;
export declare function openBrowser(browserBehavior: BrowserBehavior, port?: number): Promise<void>;
//# sourceMappingURL=server.d.ts.map