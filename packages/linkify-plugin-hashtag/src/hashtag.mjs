import { State, createTokenClass } from 'linkifyjs';

// Create a new token that class that the parser emits when it finds a hashtag
const HashtagToken = createTokenClass('hashtag', { isLink: true });

/**
 * @type {import('linkifyjs').Plugin}
 */
export default function hashtag({ scanner, parser }) {
	// Various tokens that may compose a hashtag
	const { POUND, UNDERSCORE, FULLWIDTHMIDDLEDOT } = scanner.tokens;
	const { alpha, numeric, alphanumeric, emoji } = scanner.tokens.groups;

	// Take or create a transition from start to the '#' sign (non-accepting)
	// Take transition from '#' to any text token to yield valid hashtag state
	// Account for leading underscore (non-accepting unless followed by alpha)
	const Hash = parser.start.tt(POUND);
	const HashPrefix = Hash.tt(UNDERSCORE);
	const Hashtag = new State(HashtagToken);

	Hash.ta(numeric, HashPrefix);
	Hash.ta(alpha, Hashtag);
	Hash.ta(emoji, Hashtag);
	Hash.ta(FULLWIDTHMIDDLEDOT, Hashtag);
	HashPrefix.ta(alpha, Hashtag);
	HashPrefix.ta(emoji, Hashtag);
	HashPrefix.ta(FULLWIDTHMIDDLEDOT, Hashtag);
	HashPrefix.ta(numeric, HashPrefix);
	HashPrefix.tt(UNDERSCORE, HashPrefix);
	Hashtag.ta(alphanumeric, Hashtag);
	Hashtag.ta(emoji, Hashtag);
	Hashtag.tt(FULLWIDTHMIDDLEDOT, Hashtag);
	Hashtag.tt(UNDERSCORE, Hashtag); // Trailing underscore is okay
}
