import assign from './assign.js';

/**
 * An object where each key is a valid DOM Event Name such as `click` or `focus`
 * and each value is an event handler function.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Element#events
 * @typedef {?{ [event: string]: Function }} EventListeners
 */

/**
 * All formatted properties required to render a link, including `tagName`,
 * `attributes`, `content` and `eventListeners`.
 * @typedef {{ tagName: any, attributes: {[attr: string]: any}, content: string,
 * eventListeners: EventListeners }} IntermediateRepresentation
 */

/**
 * Specify either an object described by the template type `O` or a function.
 *
 * The function takes a string value (usually the link's href attribute), the
 * link type (`'url'`, `'hashtag`', etc.) and an internal token representation
 * of the link. It should return an object of the template type `O`
 * @template O
 * @typedef {O | ((value: string, type: string, token: MultiToken) => O)} OptObj
 */

/**
 * Specify either a function described by template type `F` or an object.
 *
 * Each key in the object should be a link type (`'url'`, `'hashtag`', etc.). Each
 * value should be a function with template type `F` that is called when the
 * corresponding link type is encountered.
 * @template F
 * @typedef {F | { [type: string]: F}} OptFn
 */

/**
 * Specify either a value with template type `V`, a function that returns `V` or
 * an object where each value resolves to `V`.
 *
 * The function takes a string value (usually the link's href attribute), the
 * link type (`'url'`, `'hashtag`', etc.) and an internal token representation
 * of the link. It should return an object of the template type `V`
 *
 * For the object, each key should be a link type (`'url'`, `'hashtag`', etc.).
 * Each value should either have type `V` or a function that returns V. This
 * function similarly takes a string value and a token.
 *
 * Example valid types for `Opt<string>`:
 *
 * ```js
 * 'hello'
 * (value, type, token) => 'world'
 * { url: 'hello', email: (value, token) => 'world'}
 * ```
 * @template V
 * @typedef {V | ((value: string, type: string, token: MultiToken) => V) | { [type: string]: V | ((value: string, token: MultiToken) => V) }} Opt
 */

/**
 * See available options: https://linkify.js.org/docs/options.html
 * @typedef {{
 * 	defaultProtocol?: string,
 *  events?: OptObj<EventListeners>,
 * 	format?: Opt<string>,
 * 	formatHref?: Opt<string>,
 * 	nl2br?: boolean,
 * 	tagName?: Opt<any>,
 * 	target?: Opt<string>,
 * 	rel?: Opt<string>,
 * 	validate?: Opt<boolean>,
 * 	truncate?: Opt<number>,
 * 	className?: Opt<string>,
 * 	attributes?: OptObj<({ [attr: string]: any })>,
 *  ignoreTags?: string[],
 * 	render?: OptFn<((ir: IntermediateRepresentation) => any)>
 * }} Opts
 */

/**
 * @type Required<Opts>
 */
export const defaults = {
	defaultProtocol: 'http',
	events: null,
	format: noop,
	formatHref: noop,
	nl2br: false,
	tagName: 'a',
	target: null,
	rel: null,
	validate: true,
	truncate: Infinity,
	className: null,
	attributes: null,
	ignoreTags: [],
	render: null,
};

/**
 * Utility class for linkify interfaces to apply specified
 * {@link Opts formatting and rendering options}.
 *
 * @param {Opts | Options} [opts] Option value overrides.
 * @param {(ir: IntermediateRepresentation) => any} [defaultRender] (For
 *   internal use) default render function that determines how to generate an
 *   HTML element based on a link token's derived tagName, attributes and HTML.
 *   Similar to render option
 */
export function Options(opts, defaultRender = null) {
	let o = assign({}, defaults);
	if (opts) {
		o = assign(o, opts instanceof Options ? opts.o : opts);
	}

	// Ensure all ignored tags are uppercase
	const ignoredTags = o.ignoreTags;
	const uppercaseIgnoredTags = [];
	for (let i = 0; i < ignoredTags.length; i++) {
		uppercaseIgnoredTags.push(ignoredTags[i].toUpperCase());
	}
	/** @protected */
	this.o = o;
	if (defaultRender) {
		this.defaultRender = defaultRender;
	}
	this.ignoreTags = uppercaseIgnoredTags;
}

Options.prototype = {
	o: defaults,

	/**
	 * @type string[]
	 */
	ignoreTags: [],

	/**
	 * @param {IntermediateRepresentation} ir
	 * @returns {any}
	 */
	defaultRender(ir) {
		return ir;
	},

	/**
	 * Returns true or false based on whether a token should be displayed as a
	 * link based on the user options.
	 * @param {MultiToken} token
	 * @returns {boolean}
	 */
	check(token) {
		return this.get('validate', token.toString(), token);
	},

	// Private methods

	/**
	 * Resolve an option's value based on the value of the option and the given
	 * params. If operator and token are specified and the target option is
	 * callable, automatically calls the function with the given argument.
	 * @template {keyof Opts} K
	 * @param {K} key Name of option to use
	 * @param {string} [operator] will be passed to the target option if it's a
	 * function. If not specified, RAW function value gets returned
	 * @param {MultiToken} [token] The token from linkify.tokenize
	 * @returns {Opts[K] | any}
	 */
	get(key, operator, token) {
		const isCallable = operator != null;
		let option = this.o[key];
		if (!option) {
			return option;
		}
		if (typeof option === 'object') {
			option = token.t in option ? option[token.t] : defaults[key];
			if (typeof option === 'function' && isCallable) {
				option = option(operator, token);
			}
		} else if (typeof option === 'function' && isCallable) {
			option = option(operator, token.t, token);
		}

		return option;
	},

	/**
	 * @template {keyof Opts} L
	 * @param {L} key Name of options object to use
	 * @param {string} [operator]
	 * @param {MultiToken} [token]
	 * @returns {Opts[L] | any}
	 */
	getObj(key, operator, token) {
		let obj = this.o[key];
		if (typeof obj === 'function' && operator != null) {
			obj = obj(operator, token.t, token);
		}
		return obj;
	},

	/**
	 * Convert the given token to a rendered element that may be added to the
	 * calling-interface's DOM
	 * @param {MultiToken} token Token to render to an HTML element
	 * @returns {any} Render result; e.g., HTML string, DOM element, React
	 *   Component, etc.
	 */
	render(token) {
		const ir = token.render(this); // intermediate representation
		const renderFn = this.get('render', null, token) || this.defaultRender;
		return renderFn(ir, token.t, token);
	},
};

export { assign };

function noop(val) {
	return val;
}
