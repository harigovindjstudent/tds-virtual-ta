"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncodingType = void 0;
exports.toMorseCode = toMorseCode;
exports.toPigLatin = toPigLatin;
exports.addOtherEncodings = addOtherEncodings;
/**
 * Convert text to Morse code
 */
function toMorseCode(text) {
    const morseMap = {
        a: '.-',
        b: '-...',
        c: '-.-.',
        d: '-..',
        e: '.',
        f: '..-.',
        g: '--.',
        h: '....',
        i: '..',
        j: '.---',
        k: '-.-',
        l: '.-..',
        m: '--',
        n: '-.',
        o: '---',
        p: '.--.',
        q: '--.-',
        r: '.-.',
        s: '...',
        t: '-',
        u: '..-',
        v: '...-',
        w: '.--',
        x: '-..-',
        y: '-.--',
        z: '--..',
        '0': '-----',
        '1': '.----',
        '2': '..---',
        '3': '...--',
        '4': '....-',
        '5': '.....',
        '6': '-....',
        '7': '--...',
        '8': '---..',
        '9': '----.',
        '.': '.-.-.-',
        ',': '--..--',
        '?': '..--..',
        "'": '.----.',
        '!': '-.-.--',
        '/': '-..-.',
        '(': '-.--.',
        ')': '-.--.-',
        '&': '.-...',
        ':': '---...',
        ';': '-.-.-.',
        '=': '-...-',
        '+': '.-.-.',
        '-': '-....-',
        _: '..--.-',
        '"': '.-..-.',
        $: '...-..-',
        '@': '.--.-.',
    };
    return text
        .toLowerCase()
        .split('')
        .map((char) => {
        if (char === ' ') {
            return '/';
        }
        return morseMap[char] || char;
    })
        .join(' ');
}
/**
 * Convert text to Pig Latin
 */
function toPigLatin(text) {
    // Split by spaces to get words
    return text
        .split(' ')
        .map((word) => {
        // Extract any trailing punctuation
        const punctuationMatch = word.match(/([a-zA-Z0-9]+)([^a-zA-Z0-9]*)$/);
        if (!punctuationMatch && // Skip empty strings or non-alphabet characters
            !word.match(/^[a-zA-Z]/)) {
            return word;
        }
        // Split the word into base and punctuation if there's punctuation
        const baseWord = punctuationMatch ? punctuationMatch[1] : word;
        const punctuation = punctuationMatch ? punctuationMatch[2] : '';
        // If the base word doesn't start with a letter, return as is
        if (!baseWord.match(/^[a-zA-Z]/)) {
            return word;
        }
        // Check if word starts with vowel
        if (/^[aeiouAEIOU]/.test(baseWord)) {
            return baseWord + 'way' + punctuation;
        }
        // Find position of first vowel
        const vowelIndex = baseWord.search(/[aeiouAEIOU]/i);
        // If no vowels, just add 'ay' at the end
        if (vowelIndex === -1) {
            return baseWord + 'ay' + punctuation;
        }
        // Move consonants before first vowel to end and add 'ay'
        const prefix = baseWord.substring(0, vowelIndex);
        const suffix = baseWord.substring(vowelIndex);
        return suffix + prefix + 'ay' + punctuation;
    })
        .join(' ');
}
exports.EncodingType = {
    MORSE: 'morse',
    PIG_LATIN: 'piglatin',
};
/**
 * Apply the specified encoding transformation to test cases
 */
function addOtherEncodings(testCases, injectVar, encodingType = exports.EncodingType.MORSE) {
    // Choose the transformation based on encoding type
    const transformer = (() => {
        switch (encodingType) {
            case exports.EncodingType.MORSE:
                return toMorseCode;
            case exports.EncodingType.PIG_LATIN:
                return toPigLatin;
            default:
                return toMorseCode; // Default to Morse code
        }
    })();
    // Get a display name for the encoding
    const encodingName = (() => {
        switch (encodingType) {
            case exports.EncodingType.MORSE:
                return 'Morse';
            case exports.EncodingType.PIG_LATIN:
                return 'PigLatin';
            default:
                return encodingType;
        }
    })();
    return testCases.map((testCase) => ({
        ...testCase,
        assert: testCase.assert?.map((assertion) => ({
            ...assertion,
            metric: `${assertion.metric}/${encodingName}`,
        })),
        vars: {
            ...testCase.vars,
            [injectVar]: transformer(String(testCase.vars[injectVar])),
        },
        metadata: {
            ...testCase.metadata,
            // Use the specific strategy ID based on encoding type
            strategyId: encodingType === exports.EncodingType.MORSE ? 'morse' : 'piglatin',
            encodingType,
        },
    }));
}
//# sourceMappingURL=otherEncodings.js.map