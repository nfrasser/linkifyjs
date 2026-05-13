import { Parser as HTMLParser } from 'htmlparser2';
import { tokenize, Options } from 'linkifyjs';

// Known void elements in HTML5 — these never need a closing tag
const VOID_ELEMENTS = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr',
]);

// Elements with optional end tags in HTML5 — these may be implicitly closed
// by the parser (auto-closed), so an immediate implied close is NOT self-closing
const OPTIONAL_END_TAG = new Set([
	'body',
	'caption',
	'col',
	'colgroup',
	'dd',
	'dt',
	'head',
	'html',
	'li',
	'optgroup',
	'option',
	'p',
	'rb',
	'rp',
	'rt',
	'rtc',
	'summary',
	'tbody',
	'td',
	'tfoot',
	'th',
	'thead',
	'tr',
]);

/**
 * @param {string} str html string to link
 * @param {import('linkifyjs').Opts} [opts] linkify options
 * @returns {string} resulting string
 */
export default function linkifyHtml(str, opts = {}) {
	const options = new Options(opts, defaultRender);
	const output = [];

	// Stack of uppercase tag names whose content should not be linkified
	const ignoreDepth = [];

	// Pending open tag: stored until we know if it's self-closing or has content
	let pendingTag = null;

	// Buffer for text accumulation — htmlparser2 may split text at entity boundaries
	let textBuffer = '';

	function flushPendingTag() {
		if (pendingTag) {
			output.push(renderOpenTag(pendingTag.name, pendingTag.attrs, false));
			pendingTag = null;
		}
	}

	function flushTextBuffer() {
		if (!textBuffer) {
			return;
		}
		const text = textBuffer;
		textBuffer = '';
		if (ignoreDepth.length > 0) {
			// Inside an ignored tag: output escaped text, do not linkify
			output.push(escapeText(text));
		} else {
			const items = linkifyChars(text, options);
			for (let i = 0; i < items.length; i++) {
				output.push(items[i]);
			}
		}
	}

	function renderOpenTag(name, attrs, selfClosing) {
		let tag = `<${name}`;
		for (const attr in attrs) {
			tag += ` ${attr}="${escapeAttr(String(attrs[attr]))}"`;
		}
		tag += selfClosing ? ' />' : '>';
		return tag;
	}

	function pushIgnoreTag(name) {
		ignoreDepth.push(name.toUpperCase());
	}

	function popIgnoreTag(name) {
		const upper = name.toUpperCase();
		for (let i = ignoreDepth.length - 1; i >= 0; i--) {
			if (ignoreDepth[i] === upper) {
				ignoreDepth.splice(i, 1);
				break;
			}
		}
	}

	const parser = new HTMLParser({
		onprocessinginstruction(name, data) {
			flushTextBuffer();
			flushPendingTag();
			// Reconstruct the processing instruction / doctype using raw `data`
			output.push(`<${data}>`);
		},

		onopentag(name, attrs) {
			flushTextBuffer();
			flushPendingTag();
			const tagNameUpper = name.toUpperCase();
			const isIgnored = tagNameUpper === 'A' || options.ignoreTags.indexOf(tagNameUpper) >= 0;
			if (isIgnored) {
				pushIgnoreTag(name);
			}
			pendingTag = { name, attrs };
		},

		onclosetag(name, isImplied) {
			flushTextBuffer();
			if (pendingTag && pendingTag.name === name) {
				// Close fired before any content was emitted for this tag.
				if (!isImplied) {
					// Explicit close tag (e.g. <script></script> or <p></p>)
					output.push(renderOpenTag(name, pendingTag.attrs, false));
					output.push(`</${name}>`);
				} else if (VOID_ELEMENTS.has(name)) {
					// Void element — output bare open tag (no slash)
					output.push(renderOpenTag(name, pendingTag.attrs, false));
				} else if (OPTIONAL_END_TAG.has(name)) {
					// Optional-end-tag element that was auto-closed by the parser —
					// treat as a regular open (not self-closing)
					output.push(renderOpenTag(name, pendingTag.attrs, false));
				} else {
					// Non-void, non-optional element (SVG/MathML/custom) — self-closing
					output.push(renderOpenTag(name, pendingTag.attrs, true));
				}
				pendingTag = null;
			} else {
				flushPendingTag();
				if (!isImplied) {
					output.push(`</${name}>`);
				}
			}
			popIgnoreTag(name);
		},

		ontext(text) {
			// Flush the pending open tag before accumulating text
			flushPendingTag();
			textBuffer += text;
		},

		oncomment(data) {
			flushTextBuffer();
			flushPendingTag();
			output.push(`<!--${data}-->`);
		},
	});

	parser.write(str);
	parser.end();

	// Flush any remaining content after parsing is complete
	flushTextBuffer();
	flushPendingTag();

	return output.join('');
}

/**
 * Linkify a plain-text string, returning an array of HTML output strings.
 * @param {string} str
 * @param {import('linkifyjs').Options} options
 * @returns {string[]}
 */
function linkifyChars(str, options) {
	const tokens = tokenize(str);
	const result = [];
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.t === 'nl' && options.get('nl2br')) {
			result.push('<br />');
		} else if (!token.isLink || !options.check(token)) {
			result.push(escapeText(token.toString()));
		} else {
			result.push(options.render(token));
		}
	}
	return result;
}

function defaultRender({ tagName, attributes, content }) {
	return `<${tagName} ${attributesToString(attributes)}>${escapeText(content)}</${tagName}>`;
}

function escapeText(text) {
	return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(attr) {
	return attr.replace(/"/g, '&quot;');
}

function attributesToString(attributes) {
	const result = [];
	for (const attr in attributes) {
		const val = attributes[attr] + '';
		result.push(`${attr}="${escapeAttr(val)}"`);
	}
	return result.join(' ');
}
