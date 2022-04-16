/**
	The scanner provides an interface that takes a string of text as input, and
	outputs an array of tokens instances that can be used for easy URL parsing.
*/

import { tlds, utlds } from './tlds';
import { State, tr, ts, tt } from './fsm';
import * as fsm from './fsm';
import * as tk from './text';
import * as re from './regexp';
import assign from './assign';

const NL = '\n'; // New line character
const EMOJI_VARIATION = '\ufe0f'; // Variation selector, follows heart and others
const EMOJI_JOINER = '\u200d'; // zero-width joiner

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
	const collections = {}; // of tokens
	/** @type State<string> */
	const Start = new State();
	// const NonAccepting = makeState('NonAccepting'); // must never have any transitions

	const Num = tr(Start, re.DIGIT, [tk.NUM, [fsm.numeric]], collections);
	tr(Num, re.DIGIT, Num);

	// State which emits a word token
	const Word = tr(Start, re.ASCII_LETTER, [tk.WORD, [fsm.ascii]], collections);
	tr(Word, re.ASCII_LETTER, Word);

	// Same as previous, but specific to non-fsm.ascii alphabet words
	const UWord = tr(Start, re.LETTER, [tk.UWORD, [fsm.alpha]], collections);
	tr(UWord, re.ASCII_LETTER); // Non-accepting
	tr(UWord, re.LETTER, UWord);

	// Emoji tokens. They are not grouped by the scanner except in cases where a
	// zero-width joiner is present
	const Emoji = tr(Start, re.EMOJI, [tk.EMOJI, [fsm.emoji]], collections);
	tr(Emoji, re.EMOJI, Emoji);
	tt(Emoji, EMOJI_VARIATION, Emoji);
	// tt(Start, EMOJI_VARIATION, Emoji); // This one is sketchy

	const EmojiJoiner = tt(Emoji, EMOJI_JOINER);
	tr(EmojiJoiner, re.EMOJI, Emoji);
	// tt(EmojiJoiner, EMOJI_VARIATION, Emoji); // also sketchy

	// Whitespace jumps
	// Tokens of only non-newline whitespace are arbitrarily long
	// If any whitespace except newline, more whitespace!
	const Ws = tr(Start, re.SPACE, [tk.WS, [fsm.whitespace]], collections);
	tt(Start, NL, [tk.NL, [fsm.whitespace]], collections);
	tt(Ws, NL); // non-accepting state to avoid mixing whitespaces
	tr(Ws, re.SPACE, Ws);

	// States for special URL symbols that accept immediately after start
	tt(Start, "'", tk.APOSTROPHE);
	tt(Start, '{', tk.OPENBRACE);
	tt(Start, '[', tk.OPENBRACKET);
	tt(Start, '<', tk.OPENANGLEBRACKET);
	tt(Start, '(', tk.OPENPAREN);
	tt(Start, '}', tk.CLOSEBRACE);
	tt(Start, ']', tk.CLOSEBRACKET);
	tt(Start, '>', tk.CLOSEANGLEBRACKET);
	tt(Start, ')', tk.CLOSEPAREN);
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

	// Generates states for top-level domains
	// Note that this is most accurate when tlds are in alphabetical order
	for (let i = 0; i < tlds.length; i++) {
		ts(Start, tlds[i], [tk.TLD, [fsm.tld, fsm.ascii]], collections);
	}
	for (let i = 0; i < utlds.length; i++) {
		ts(Start, utlds[i], [tk.UTLD, [fsm.utld, fsm.alpha]], collections);
	}

	// Collect the states generated by different protocols. NOTE: If any new TLDs
	// get added that are also protocols, set the token to be the same as the
	// protocol to ensure parsing works as expected.
	ts(Start, 'file', [tk.SCHEME, [fsm.scheme, fsm.ascii]], collections);
	ts(Start, 'mailto', [tk.SCHEME, [fsm.scheme, fsm.ascii]], collections);
	ts(Start, 'http', [tk.SLASH_SCHEME, [fsm.slashscheme, fsm.ascii]], collections);
	ts(Start, 'https', [tk.SLASH_SCHEME, [fsm.slashscheme, fsm.ascii]], collections);
	ts(Start, 'ftp', [tk.SLASH_SCHEME, [fsm.slashscheme, fsm.ascii]], collections);
	ts(Start, 'ftps', [tk.SLASH_SCHEME, [fsm.slashscheme, fsm.ascii]], collections);

	// Register custom schemes. Assumes each scheme is asciinumeric with hyphens
	customSchemes = customSchemes.sort((a, b) => a[0] > b[0] ? 1 : -1);
	for (let i = 0; i < customSchemes.length; i++) {
		const sch = customSchemes[i][0];
		const optionalSlashSlash = customSchemes[i][1];
		const c = [optionalSlashSlash ? fsm.scheme : fsm.slashscheme];
		if (sch.indexOf('-') >= 0) {
			c.push(fsm.domain);
		} else if (!re.ASCII_LETTER.test(sch)) {
			c.push(fsm.numeric); // numbers only??
		} else if (re.DIGIT.test(sch)) {
			c.push(fsm.asciinumeric);
		} else {
			c.push(fsm.ascii);
		}

		ts(Start, sch, [sch, c], collections);
	}

	// Localhost token
	ts(Start, 'localhost', [tk.LOCALHOST, [fsm.ascii]], collections);

	// Set default transition for start state (some symbol)
	Start.jd = new State(tk.SYM);
	return { start: Start, tokens: assign(collections, tk) };
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
	const iterable = tk.stringToArray(str.replace(/[A-Z]/g, (c) => c.toLowerCase()));
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
			e: cursor // end index (excluding)
		});
	}

	return tokens;
}

export { tk as tokens };
