// Note that these two Unicode ones expand into a really big one with Babel
export const ASCII_LETTER = /[a-z]/;
// `\p{}` property escapes need ICU, which some embedded JS runtimes ship
// without (e.g. NativeScript's V8). The literal form throws a SyntaxError
// at parse time — before any user code can catch it — so build them
// dynamically and keep ASCII-range fallbacks for engines without Unicode
// property escapes.
export let LETTER = /[a-z]/i; // Any Unicode character with letter data type
export let EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u; // Any Unicode emoji character
try {
	LETTER = new RegExp('\\p{L}', 'u');
	EMOJI = new RegExp('\\p{Emoji}', 'u');
} catch {}
export const EMOJI_VARIATION = /\ufe0f/;
export const DIGIT = /\d/;
export const SPACE = /\s/;
