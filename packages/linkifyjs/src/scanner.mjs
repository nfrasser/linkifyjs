/**
	The scanner provides an interface that takes a string of text as input, and
	outputs an array of tokens instances that can be used for easy URL parsing.
*/

import { encodedTlds, encodedUtlds } from './tlds.mjs';
import { State, addToGroups, tr, ts, tt } from './fsm.mjs';
import * as fsm from './fsm.mjs';
import * as tk from './text.mjs';
import * as re from './regexp.mjs';
import assign from './assign.mjs';

const NL = '\n'; // New line character
const EMOJI_VARIATION = '\ufe0f'; // Variation selector, follows heart and others
const EMOJI_JOINER = '\u200d'; // zero-width joiner

let tlds = null,
	utlds = null; // don't change so only have to be computed once

/**
 * Scanner output token:
 * - `t` is the token name (e.g., 'NUM', 'EMOJI', 'TLD')
 * - `v` is the value of the token (e.g., '123', '❤️', 'com')
 * - `s` is the start index of the token in the original string
 * - `e` is the end index of the token in the original string
 * @typedef {{t: string, v: string, s: number, e: number}} Token
 */

/**
 * @template T
 * @typedef {{ [collection: string]: T[] }} Collections
 */

/**
 * Initialize the scanner character-based state machine for the given start
 * state
 * @param {[string, boolean][]} customSchemes List of custom schemes, where each
 * item is a length-2 tuple with the first element set to the string scheme, and
 * the second element set to `true` if the `://` after the scheme is optional
 */
export function init(customSchemes = []) {
	// Frequently used states (name argument removed during minification)
	/** @type Collections<string> */
	const groups = {}; // of tokens
	State.groups = groups;
	/** @type State<string> */
	const Start = new State();

	if (tlds == null) {
		tlds = decodeTlds(encodedTlds);
	}
	if (utlds == null) {
		utlds = decodeTlds(encodedUtlds);
	}

	// States for special URL symbols that accept immediately after start
	tt(Start, "'", tk.APOSTROPHE);
	tt(Start, '{', tk.OPENBRACE);
	tt(Start, '}', tk.CLOSEBRACE);
	tt(Start, '[', tk.OPENBRACKET);
	tt(Start, ']', tk.CLOSEBRACKET);
	tt(Start, '(', tk.OPENPAREN);
	tt(Start, ')', tk.CLOSEPAREN);
	tt(Start, '<', tk.OPENANGLEBRACKET);
	tt(Start, '>', tk.CLOSEANGLEBRACKET);
	tt(Start, '（', tk.FULLWIDTHLEFTPAREN);
	tt(Start, '）', tk.FULLWIDTHRIGHTPAREN);
	tt(Start, '「', tk.LEFTCORNERBRACKET);
	tt(Start, '」', tk.RIGHTCORNERBRACKET);
	tt(Start, '『', tk.LEFTWHITECORNERBRACKET);
	tt(Start, '』', tk.RIGHTWHITECORNERBRACKET);
	tt(Start, '＜', tk.FULLWIDTHLESSTHAN);
	tt(Start, '＞', tk.FULLWIDTHGREATERTHAN);
	tt(Start, '&', tk.AMPERSAND);
	tt(Start, '*', tk.ASTERISK);
	tt(Start, '@', tk.AT);
	tt(Start, '`', tk.BACKTICK);
	tt(Start, '^', tk.CARET);
	tt(Start, ':', tk.COLON);
	tt(Start, ',', tk.COMMA);
	tt(Start, '$', tk.DOLLAR);
	tt(Start, '.', tk.DOT);
	tt(Start, '=', tk.EQUALS);
	tt(Start, '!', tk.EXCLAMATION);
	tt(Start, '-', tk.HYPHEN);
	tt(Start, '%', tk.PERCENT);
	tt(Start, '|', tk.PIPE);
	tt(Start, '+', tk.PLUS);
	tt(Start, '#', tk.POUND);
	tt(Start, '?', tk.QUERY);
	tt(Start, '"', tk.QUOTE);
	tt(Start, '/', tk.SLASH);
	tt(Start, ';', tk.SEMI);
	tt(Start, '~', tk.TILDE);
	tt(Start, '_', tk.UNDERSCORE);
	tt(Start, '\\', tk.BACKSLASH);
	tt(Start, '・', tk.FULLWIDTHMIDDLEDOT);

	const Num = tr(Start, re.DIGIT, tk.NUM, { [fsm.numeric]: true });
	tr(Num, re.DIGIT, Num);

	// State which emits a word token
	const Word = tr(Start, re.ASCII_LETTER, tk.WORD, { [fsm.ascii]: true });
	tr(Word, re.ASCII_LETTER, Word);

	// Same as previous, but specific to non-fsm.ascii alphabet words
	const UWord = tr(Start, re.LETTER, tk.UWORD, { [fsm.alpha]: true });
	tr(UWord, re.ASCII_LETTER); // Non-accepting
	tr(UWord, re.LETTER, UWord);

	// Whitespace jumps
	// Tokens of only non-newline whitespace are arbitrarily long
	// If any whitespace except newline, more whitespace!
	const Ws = tr(Start, re.SPACE, tk.WS, { [fsm.whitespace]: true });
	tt(Start, NL, tk.NL, { [fsm.whitespace]: true });
	tt(Ws, NL); // non-accepting state to avoid mixing whitespaces
	tr(Ws, re.SPACE, Ws);

	// Emoji tokens. They are not grouped by the scanner except in cases where a
	// zero-width joiner is present
	const Emoji = tr(Start, re.EMOJI, tk.EMOJI, { [fsm.emoji]: true });
	tr(Emoji, re.EMOJI, Emoji);
	tt(Emoji, EMOJI_VARIATION, Emoji);
	// tt(Start, EMOJI_VARIATION, Emoji); // This one is sketchy

	const EmojiJoiner = tt(Emoji, EMOJI_JOINER);
	tr(EmojiJoiner, re.EMOJI, Emoji);
	// tt(EmojiJoiner, EMOJI_VARIATION, Emoji); // also sketchy

	// Generates states for top-level domains
	// Note that this is most accurate when tlds are in alphabetical order
	const wordjr = [[re.ASCII_LETTER, Word]];
	const uwordjr = [
		[re.ASCII_LETTER, null],
		[re.LETTER, UWord],
	];
	for (let i = 0; i < tlds.length; i++) {
		fastts(Start, tlds[i], tk.TLD, tk.WORD, wordjr);
	}
	for (let i = 0; i < utlds.length; i++) {
		fastts(Start, utlds[i], tk.UTLD, tk.UWORD, uwordjr);
	}
	addToGroups(tk.TLD, { tld: true, ascii: true }, groups);
	addToGroups(tk.UTLD, { utld: true, alpha: true }, groups);

	// Collect the states generated by different protocols. NOTE: If any new TLDs
	// get added that are also protocols, set the token to be the same as the
	// protocol to ensure parsing works as expected.
	fastts(Start, 'file', tk.SCHEME, tk.WORD, wordjr);
	fastts(Start, 'mailto', tk.SCHEME, tk.WORD, wordjr);
	fastts(Start, 'http', tk.SLASH_SCHEME, tk.WORD, wordjr);
	fastts(Start, 'https', tk.SLASH_SCHEME, tk.WORD, wordjr);
	fastts(Start, 'ftp', tk.SLASH_SCHEME, tk.WORD, wordjr);
	fastts(Start, 'ftps', tk.SLASH_SCHEME, tk.WORD, wordjr);
	addToGroups(tk.SCHEME, { scheme: true, ascii: true }, groups);
	addToGroups(tk.SLASH_SCHEME, { slashscheme: true, ascii: true }, groups);

	// Register custom schemes. Assumes each scheme is asciinumeric with hyphens
	customSchemes = customSchemes.sort((a, b) => (a[0] > b[0] ? 1 : -1));
	for (let i = 0; i < customSchemes.length; i++) {
		const sch = customSchemes[i][0];
		const optionalSlashSlash = customSchemes[i][1];
		const flags = optionalSlashSlash ? { [fsm.scheme]: true } : { [fsm.slashscheme]: true };
		if (sch.indexOf('-') >= 0) {
			flags[fsm.domain] = true;
		} else if (!re.ASCII_LETTER.test(sch)) {
			flags[fsm.numeric] = true; // numbers only
		} else if (re.DIGIT.test(sch)) {
			flags[fsm.asciinumeric] = true;
		} else {
			flags[fsm.ascii] = true;
		}

		ts(Start, sch, sch, flags);
	}

	// Localhost token
	ts(Start, 'localhost', tk.LOCALHOST, { ascii: true });

	// Set default transition for start state (some symbol)
	Start.jd = new State(tk.SYM);
	return { start: Start, tokens: assign({ groups }, tk) };
}

/**
	Given a string, returns an array of TOKEN instances representing the
	composition of that string.

	@method run
	@param {State<string>} start scanner starting state
	@param {string} str input string to scan
	@return {Token[]} list of tokens, each with a type and value
*/
export function run(start, str) {
	// State machine is not case sensitive, so input is tokenized in lowercased
	// form (still returns regular case). Uses selective `toLowerCase` because
	// lowercasing the entire string causes the length and character position to
	// vary in some non-English strings with V8-based runtimes.
	const iterable = stringToArray(str.replace(/[A-Z]/g, (c) => c.toLowerCase()));
	const charCount = iterable.length; // <= len if there are emojis, etc
	const tokens = []; // return value

	// cursor through the string itself, accounting for characters that have
	// width with length 2 such as emojis
	let cursor = 0;

	// Cursor through the array-representation of the string
	let charCursor = 0;

	// Tokenize the string
	while (charCursor < charCount) {
		let state = start;
		let nextState = null;
		let tokenLength = 0;
		let latestAccepting = null;
		let sinceAccepts = -1;
		let charsSinceAccepts = -1;

		while (charCursor < charCount && (nextState = state.go(iterable[charCursor]))) {
			state = nextState;

			// Keep track of the latest accepting state
			if (state.accepts()) {
				sinceAccepts = 0;
				charsSinceAccepts = 0;
				latestAccepting = state;
			} else if (sinceAccepts >= 0) {
				sinceAccepts += iterable[charCursor].length;
				charsSinceAccepts++;
			}

			tokenLength += iterable[charCursor].length;
			cursor += iterable[charCursor].length;
			charCursor++;
		}

		// Roll back to the latest accepting state
		cursor -= sinceAccepts;
		charCursor -= charsSinceAccepts;
		tokenLength -= sinceAccepts;

		// No more jumps, just make a new token from the last accepting one
		tokens.push({
			t: latestAccepting.t, // token type/name
			v: str.slice(cursor - tokenLength, cursor), // string value
			s: cursor - tokenLength, // start index
			e: cursor, // end index (excluding)
		});
	}

	return tokens;
}

/**
 * Convert a String to an Array of characters, taking into account that some
 * characters like emojis take up two string indexes.
 *
 * Adapted from core-js (MIT license)
 * https://github.com/zloirock/core-js/blob/2d69cf5f99ab3ea3463c395df81e5a15b68f49d9/packages/core-js/internals/string-multibyte.js
 *
 * @function stringToArray
 * @param {string} str
 * @returns {string[]}
 */
export function stringToArray(str) {
	const result = [];
	const len = str.length;
	let index = 0;
	while (index < len) {
		let first = str.charCodeAt(index);
		let second;
		let char =
			first < 0xd800 ||
			first > 0xdbff ||
			index + 1 === len ||
			(second = str.charCodeAt(index + 1)) < 0xdc00 ||
			second > 0xdfff
				? str[index] // single character
				: str.slice(index, index + 2); // two-index characters
		result.push(char);
		index += char.length;
	}
	return result;
}

/**
 * Fast version of ts function for when transition defaults are well known
 * @param {State<string>} state
 * @param {string} input
 * @param {string} t
 * @param {string} defaultt
 * @param {[RegExp, State<string>][]} jr
 * @returns {State<string>}
 */
function fastts(state, input, t, defaultt, jr) {
	let next;
	const len = input.length;
	for (let i = 0; i < len - 1; i++) {
		const char = input[i];
		if (state.j[char]) {
			next = state.j[char];
		} else {
			next = new State(defaultt);
			next.jr = jr.slice();
			state.j[char] = next;
		}
		state = next;
	}
	next = new State(t);
	next.jr = jr.slice();
	state.j[input[len - 1]] = next;
	return next;
}

/**
 * Converts a string of Top-Level Domain names encoded in update-tlds.js back
 * into a list of strings.
 * @param {str} encoded encoded TLDs string
 * @returns {str[]} original TLDs list
 */
function decodeTlds(encoded) {
	const words = [];
	const stack = [];
	let i = 0;
	let digits = '0123456789';
	while (i < encoded.length) {
		let popDigitCount = 0;
		while (digits.indexOf(encoded[i + popDigitCount]) >= 0) {
			popDigitCount++; // encountered some digits, have to pop to go one level up trie
		}
		if (popDigitCount > 0) {
			words.push(stack.join('')); // whatever preceded the pop digits must be a word
			for (let popCount = parseInt(encoded.substring(i, i + popDigitCount), 10); popCount > 0; popCount--) {
				stack.pop();
			}
			i += popDigitCount;
		} else {
			stack.push(encoded[i]); // drop down a level into the trie
			i++;
		}
	}
	return words;
}
