import { init as initScanner, run as runScanner } from './scanner.js';
import { init as initParser, run as runParser } from './parser.js';
import { Options } from './options.js';
import { State } from './fsm.js';

const warn = (typeof console !== 'undefined' && console && console.warn) || (() => {});
const warnAdvice =
	'until manual call of linkify.init(). Register all schemes and plugins before invoking linkify the first time.';

// Side-effect initialization state
const INIT = {
	scanner: null,
	parser: null,
	tokenQueue: [],
	pluginQueue: [],
	customSchemes: [],
	initialized: false,
};

/**
 * @typedef {{
 * 	start: State<string>,
 * 	tokens: { groups: Collections<string> } & typeof tk
 * }} ScannerInit
 */

/**
 * @typedef {{
 * 	start: State<MultiToken>,
 * 	tokens: typeof multi
 * }} ParserInit
 */

/**
 * @typedef {(arg: { scanner: ScannerInit }) => void} TokenPlugin
 */

/**
 * @typedef {(arg: { scanner: ScannerInit, parser: ParserInit }) => void} Plugin
 */

/**
 * De-register all plugins and reset the internal state-machine. Used for
 * testing; not required in practice.
 * @private
 */
export function reset() {
	State.groups = {};
	INIT.scanner = null;
	INIT.parser = null;
	INIT.tokenQueue = [];
	INIT.pluginQueue = [];
	INIT.customSchemes = [];
	INIT.initialized = false;
	return INIT;
}

/**
 * Register a token plugin to allow the scanner to recognize additional token
 * types before the parser state machine is constructed from the results.
 * @param {string} name of plugin to register
 * @param {TokenPlugin} plugin function that accepts the scanner state machine
 * and available scanner tokens and collections and extends the state machine to
 * recognize additional tokens or groups.
 */
export function registerTokenPlugin(name, plugin) {
	if (typeof plugin !== 'function') {
		throw new Error(`linkifyjs: Invalid token plugin ${plugin} (expects function)`);
	}
	for (let i = 0; i < INIT.tokenQueue.length; i++) {
		if (name === INIT.tokenQueue[i][0]) {
			warn(`linkifyjs: token plugin "${name}" already registered - will be overwritten`);
			INIT.tokenQueue[i] = [name, plugin];
			return;
		}
	}
	INIT.tokenQueue.push([name, plugin]);
	if (INIT.initialized) {
		warn(`linkifyjs: already initialized - will not register token plugin "${name}" ${warnAdvice}`);
	}
}

/**
 * Register a linkify plugin
 * @param {string} name of plugin to register
 * @param {Plugin} plugin function that accepts the parser state machine and
 * extends the parser to recognize additional link types
 */
export function registerPlugin(name, plugin) {
	if (typeof plugin !== 'function') {
		throw new Error(`linkifyjs: Invalid plugin ${plugin} (expects function)`);
	}
	for (let i = 0; i < INIT.pluginQueue.length; i++) {
		if (name === INIT.pluginQueue[i][0]) {
			warn(`linkifyjs: plugin "${name}" already registered - will be overwritten`);
			INIT.pluginQueue[i] = [name, plugin];
			return;
		}
	}
	INIT.pluginQueue.push([name, plugin]);
	if (INIT.initialized) {
		warn(`linkifyjs: already initialized - will not register plugin "${name}" ${warnAdvice}`);
	}
}

/**
 * Detect URLs with the following additional protocol. Anything with format
 * "protocol://..." will be considered a link. If `optionalSlashSlash` is set to
 * `true`, anything with format "protocol:..." will be considered a link.
 * @param {string} protocol
 * @param {boolean} [optionalSlashSlash]
 */
export function registerCustomProtocol(scheme, optionalSlashSlash = false) {
	if (INIT.initialized) {
		warn(`linkifyjs: already initialized - will not register custom scheme "${scheme}" ${warnAdvice}`);
	}
	if (!/^[0-9a-z]+(-[0-9a-z]+)*$/.test(scheme)) {
		throw new Error(`linkifyjs: incorrect scheme format.
1. Must only contain digits, lowercase ASCII letters or "-"
2. Cannot start or end with "-"
3. "-" cannot repeat`);
	}
	INIT.customSchemes.push([scheme, optionalSlashSlash]);
}

/**
 * Initialize the linkify state machine. Called automatically the first time
 * linkify is called on a string, but may be called manually as well.
 */
export function init() {
	// Initialize scanner state machine and plugins
	INIT.scanner = initScanner(INIT.customSchemes);
	for (let i = 0; i < INIT.tokenQueue.length; i++) {
		INIT.tokenQueue[i][1]({
			scanner: INIT.scanner,
		});
	}

	// Initialize parser state machine and plugins
	INIT.parser = initParser(INIT.scanner.tokens);
	for (let i = 0; i < INIT.pluginQueue.length; i++) {
		INIT.pluginQueue[i][1]({
			scanner: INIT.scanner,
			parser: INIT.parser,
		});
	}
	INIT.initialized = true;
	return INIT;
}

/**
 * Parse a string into tokens that represent linkable and non-linkable sub-components
 * @param {string} str
 * @return {MultiToken[]} tokens
 */
export function tokenize(str) {
	if (!INIT.initialized) {
		init();
	}
	return runParser(INIT.parser.start, str, runScanner(INIT.scanner.start, str));
}
tokenize.scan = runScanner; // for testing

/**
 * Find a list of linkable items in the given string.
 * @param {string} str string to find links in
 * @param {string | Opts} [type] either formatting options or specific type of
 * links to find, e.g., 'url' or 'email'
 * @param {Opts} [opts] formatting options for final output. Cannot be specified
 * if opts already provided in `type` argument
 */
export function find(str, type = null, opts = null) {
	if (type && typeof type === 'object') {
		if (opts) {
			throw Error(`linkifyjs: Invalid link type ${type}; must be a string`);
		}
		opts = type;
		type = null;
	}
	const options = new Options(opts);
	const tokens = tokenize(str);
	const filtered = [];

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.isLink && (!type || token.t === type) && options.check(token)) {
			filtered.push(token.toFormattedObject(options));
		}
	}

	return filtered;
}

/**
 * Is the given string valid linkable text of some sort. Note that this does not
 * trim the text for you.
 *
 * Optionally pass in a second `type` param, which is the type of link to test
 * for.
 *
 * For example,
 *
 *     linkify.test(str, 'email');
 *
 * Returns `true` if str is a valid email.
 * @param {string} str string to test for links
 * @param {string} [type] optional specific link type to look for
 * @returns boolean true/false
 */
export function test(str, type = null) {
	const tokens = tokenize(str);
	return tokens.length === 1 && tokens[0].isLink && (!type || tokens[0].t === type);
}

export * as options from './options.js';
export * as regexp from './regexp.js';
export * as multi from './multi.js';
export * as text from './multi.js';
export { MultiToken, createTokenClass } from './multi.js';
export { stringToArray } from './scanner.js';
export { State } from './fsm.js';
export { Options };
