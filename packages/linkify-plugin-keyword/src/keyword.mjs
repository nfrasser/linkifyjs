import { createTokenClass, stringToArray } from 'linkifyjs';

/**
 * Tokenize will emit token classes of this type
 */
const Keyword = createTokenClass('keyword', { isLink: true });


/**
 * Keys are registered tokens recognized by the scanner in the plugin
 * definition, associated with one or more collections. Values are the list of
 * keywords that get scanned into those tokens.
 *
 * Organized this way to ensure other links that rely on these collections are
 * still recognized by the parser.
 */
const registeredKeywordsGroups = {
	numeric: [],
	ascii: [],
	asciinumeric: [],
	alpha: [],
	alphanumeric: [],
	domain: [],
	keyword: [],
};

// Additional pre-processing regular expressions
// Clone from existing but add global flag
const ALL_LETTERS = /\p{L}/gu;
const ALL_EMOJIS = /\p{Emoji}/gu;
const ALL_EMOJI_VARIATIONS = /\ufe0f/g;

function pushIfMissing(item, list) {
	if (list.indexOf(item) < 0) {
		list.push(item);
	}
}

/**
 * Return the number of regexp matches in the given string
 * @param {string} str
 * @param {RegExp} regexp
 * @returns {number}
 */
function nMatch(str, regexp) {
	const matches = str.match(regexp);
	return matches ? matches.length : 0;
}

/**
 *
 * @param {string[]} keywords Keywords to linkify
 */
 export function registerKeywords(keywords) {
	// validate all keywords
	for (let i = 0; i < keywords.length; i++) {
		const keyword = keywords[i];
		if (typeof keyword !== 'string' || !keyword) {
			throw new Error(`linkify-plugin-keyword: Invalid keyword: ${keyword}`);
		}
	}

	for (let i = 0; i < keywords.length; i++) {
		const keyword = keywords[i].toLowerCase();
		if (/^[0-9]+$/.test(keyword)) {
			pushIfMissing(keyword, registeredKeywordsGroups.numeric);
			continue;
		}

		if (/^[a-z]+$/.test(keyword)) {
			pushIfMissing(keyword, registeredKeywordsGroups.ascii);
			continue;
		}

		if (/^[0-9a-z]+$/.test(keyword)) {
			pushIfMissing(keyword, registeredKeywordsGroups.asciinumeric);
			continue;
		}

		const nLetters = nMatch(keyword, ALL_LETTERS);
		if (nLetters === keyword.length) {
			pushIfMissing(keyword, registeredKeywordsGroups.alpha);
			continue;
		}

		const nNumbers = nMatch(keyword, /[0-9]/g);
		if (nLetters + nNumbers === keyword.length) {
			pushIfMissing(keyword, registeredKeywordsGroups.alphanumeric);
			continue;
		}

		const nEmojis = nMatch(keyword, ALL_EMOJIS) + nMatch(keyword, ALL_EMOJI_VARIATIONS);
		const nHyphens = nMatch(keyword, /-/g);
		if (nLetters + nNumbers + nEmojis + nHyphens === keyword.length && !/(^-|-$|--)/.test(keyword)) {
			// Composed of letters, numbers hyphens or emojis. No leading,
			// trailing or consecutive hyphens. Valid domain name.
			pushIfMissing(keyword, registeredKeywordsGroups.domain);
			continue;
		}

		// Keyword does not match any existing tokens that the scanner may recognize
		pushIfMissing(keyword, registeredKeywordsGroups.keyword);
	}
}

/**
 * @type import('linkifyjs').TokenPlugin
 */
export function tokens({ scanner }) {
	for (const group in registeredKeywordsGroups) {
		const keywords = registeredKeywordsGroups[group];
		for (let i = 0; i < keywords.length; i++) {
			const chars = stringToArray(keywords[i]);
			scanner.start.ts(chars, keywords[i], { keyword: true, [group]: true });
		}
	}
}

/**
 * @type import('linkifyjs').Plugin
 */
export function keyword({ scanner, parser }) {
	// Create parser transitions from all registered tokens
	const group = scanner.tokens.groups.keyword;
	if (group && group.length > 0) {
		parser.start.ta(group, Keyword);
	}
}
