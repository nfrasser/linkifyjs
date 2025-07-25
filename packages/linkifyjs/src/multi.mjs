import { COLON, LOCALHOST } from './text.mjs';
import { defaults } from './options.mjs';

/******************************************************************************
	Multi-Tokens
	Tokens composed of arrays of TextTokens
******************************************************************************/

/**
 * @param {string} value
 * @param {Token[]} tokens
 */
export function MultiToken(value, tokens) {
	this.t = 'token';
	this.v = value;
	this.tk = tokens;
}

/**
 * Abstract class used for manufacturing tokens of text tokens. That is rather
 * than the value for a token being a small string of text, it's value an array
 * of text tokens.
 *
 * Used for grouping together URLs, emails, hashtags, and other potential
 * creations.
 * @class MultiToken
 * @property {string} t
 * @property {string} v
 * @property {Token[]} tk
 * @abstract
 */
MultiToken.prototype = {
	isLink: false,

	/**
	 * Return the string this token represents.
	 * @return {string}
	 */
	toString() {
		return this.v;
	},

	/**
	 * What should the value for this token be in the `href` HTML attribute?
	 * Returns the `.toString` value by default.
	 * @param {string} [scheme]
	 * @return {string}
	 */
	toHref(scheme) {
		!!scheme;
		return this.toString();
	},

	/**
	 * @param {Options} options Formatting options
	 * @returns {string}
	 */
	toFormattedString(options) {
		const val = this.toString();
		const truncate = options.get('truncate', val, this);
		const formatted = options.get('format', val, this);
		return truncate && formatted.length > truncate ? formatted.substring(0, truncate) + '…' : formatted;
	},

	/**
	 *
	 * @param {Options} options
	 * @returns {string}
	 */
	toFormattedHref(options) {
		return options.get('formatHref', this.toHref(options.get('defaultProtocol')), this);
	},

	/**
	 * The start index of this token in the original input string
	 * @returns {number}
	 */
	startIndex() {
		return this.tk[0].s;
	},

	/**
	 * The end index of this token in the original input string (up to this
	 * index but not including it)
	 * @returns {number}
	 */
	endIndex() {
		return this.tk[this.tk.length - 1].e;
	},

	/**
		Returns an object  of relevant values for this token, which includes keys
		* type - Kind of token ('url', 'email', etc.)
		* value - Original text
		* href - The value that should be added to the anchor tag's href
			attribute

		@method toObject
		@param {string} [protocol] `'http'` by default
	*/
	toObject(protocol = defaults.defaultProtocol) {
		return {
			type: this.t,
			value: this.toString(),
			isLink: this.isLink,
			href: this.toHref(protocol),
			start: this.startIndex(),
			end: this.endIndex(),
		};
	},

	/**
	 *
	 * @param {Options} options Formatting option
	 */
	toFormattedObject(options) {
		return {
			type: this.t,
			value: this.toFormattedString(options),
			isLink: this.isLink,
			href: this.toFormattedHref(options),
			start: this.startIndex(),
			end: this.endIndex(),
		};
	},

	/**
	 * Whether this token should be rendered as a link according to the given options
	 * @param {Options} options
	 * @returns {boolean}
	 */
	validate(options) {
		return options.get('validate', this.toString(), this);
	},

	/**
	 * Return an object that represents how this link should be rendered.
	 * @param {Options} options Formattinng options
	 */
	render(options) {
		const token = this;
		const href = this.toHref(options.get('defaultProtocol'));
		const formattedHref = options.get('formatHref', href, this);
		const tagName = options.get('tagName', href, token);
		const content = this.toFormattedString(options);

		const attributes = {};
		const className = options.get('className', href, token);
		const target = options.get('target', href, token);
		const rel = options.get('rel', href, token);
		const attrs = options.getObj('attributes', href, token);
		const eventListeners = options.getObj('events', href, token);

		attributes.href = formattedHref;
		if (className) {
			attributes.class = className;
		}
		if (target) {
			attributes.target = target;
		}
		if (rel) {
			attributes.rel = rel;
		}
		if (attrs) {
			Object.assign(attributes, attrs);
		}

		return { tagName, attributes, content, eventListeners };
	},
};

// Base token
export { MultiToken as Base };

/**
 * Create a new token that can be emitted by the parser state machine
 * @param {string} type readable type of the token
 * @param {object} props properties to assign or override, including isLink = true or false
 * @returns {new (value: string, tokens: Token[]) => MultiToken} new token class
 */
export function createTokenClass(type, props) {
	class Token extends MultiToken {
		constructor(value, tokens) {
			super(value, tokens);
			this.t = type;
		}
	}
	for (const p in props) {
		Token.prototype[p] = props[p];
	}
	Token.t = type;
	return Token;
}

/**
	Represents a list of tokens making up a valid email address
*/
export const Email = createTokenClass('email', {
	isLink: true,
	toHref() {
		return 'mailto:' + this.toString();
	},
});

/**
	Represents some plain text
*/
export const Text = createTokenClass('text');

/**
	Multi-linebreak token - represents a line break
	@class Nl
*/
export const Nl = createTokenClass('nl');

/**
	Represents a list of text tokens making up a valid URL
	@class Url
*/
export const Url = createTokenClass('url', {
	isLink: true,

	/**
		Lowercases relevant parts of the domain and adds the protocol if
		required. Note that this will not escape unsafe HTML characters in the
		URL.

		@param {string} [scheme] default scheme (e.g., 'https')
		@return {string} the full href
	*/
	toHref(scheme = defaults.defaultProtocol) {
		// Check if already has a prefix scheme
		return this.hasProtocol() ? this.v : `${scheme}://${this.v}`;
	},

	/**
	 * Check whether this URL token has a protocol
	 * @return {boolean}
	 */
	hasProtocol() {
		const tokens = this.tk;
		return tokens.length >= 2 && tokens[0].t !== LOCALHOST && tokens[1].t === COLON;
	},
});
