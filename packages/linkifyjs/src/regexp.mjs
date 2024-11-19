// Note that these two Unicode ones expand into a really big one with Babel
export const ASCII_LETTER = /[a-z]/;
export const LETTER = /\p{L}/u; // Any Unicode character with letter data type
export const EMOJI = /\p{Emoji}/u; // Any Unicode emoji character
export const EMOJI_VARIATION = /\ufe0f/;
export const DIGIT = /\d/;
export const SPACE = /\s/;
