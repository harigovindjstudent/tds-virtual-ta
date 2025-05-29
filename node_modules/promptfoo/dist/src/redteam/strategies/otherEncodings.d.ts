import type { TestCase } from '../../types';
/**
 * Convert text to Morse code
 */
export declare function toMorseCode(text: string): string;
/**
 * Convert text to Pig Latin
 */
export declare function toPigLatin(text: string): string;
export declare const EncodingType: {
    readonly MORSE: "morse";
    readonly PIG_LATIN: "piglatin";
};
export type EncodingType = (typeof EncodingType)[keyof typeof EncodingType];
/**
 * Apply the specified encoding transformation to test cases
 */
export declare function addOtherEncodings(testCases: TestCase[], injectVar: string, encodingType?: EncodingType): TestCase[];
//# sourceMappingURL=otherEncodings.d.ts.map