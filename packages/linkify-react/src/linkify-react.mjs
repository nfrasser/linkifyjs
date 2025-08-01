import * as React from 'react';
import { tokenize, Options } from 'linkifyjs';

/**
 * Given a string, converts to an array of valid React components
 * (which may include strings)
 * @param {string} str
 * @param {Options} opts
 * @param {{ [elementId: string]: number }} meta
 * @returns {React.ReactNodeArray}
 */
function stringToElements(str, opts, meta) {
	const tokens = tokenize(str);
	const elements = [];

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];

		if (token.t === 'nl' && opts.get('nl2br')) {
			const key = `__linkify-el-${meta.elementId++}`;
			elements.push(React.createElement('br', { key }));
		} else if (!token.isLink || !opts.check(token)) {
			// Regular text
			elements.push(token.toString());
		} else {
			let rendered = opts.render(token);
			if (!('key' in rendered.props)) {
				// Ensure generated element has unique key
				const key = `__linkify-el-${meta.elementId++}`;
				const props = Object.assign({ key }, rendered.props);
				rendered = React.cloneElement(rendered, props);
			}
			elements.push(rendered);
		}
	}

	return elements;
}

// Recursively linkify the contents of the given React Element instance
/**
 * @template P
 * @template {string | React.JSXElementConstructor<P>} T
 * @param {React.ReactElement<P, T>} element
 * @param {Options} opts
 * @param {{ [elementId: string]: number }} meta
 * @returns {React.ReactElement<P, T>}
 */
function linkifyReactElement(element, opts, meta) {
	if (React.Children.count(element.props.children) === 0) {
		// No need to clone if the element had no children
		return element;
	}

	const children = [];

	React.Children.forEach(element.props.children, (child) => {
		if (typeof child === 'string') {
			// ensure that we always generate unique element IDs for keys
			children.push.apply(children, stringToElements(child, opts, meta));
		} else if (React.isValidElement(child)) {
			if (typeof child.type === 'string' && opts.ignoreTags.indexOf(child.type.toUpperCase()) >= 0) {
				// Don't linkify this element
				children.push(child);
			} else {
				children.push(linkifyReactElement(child, opts, meta));
			}
		} else {
			// Unknown element type, just push
			children.push(child);
		}
	});

	// Set a default unique key, copy over remaining props
	const key = `__linkify-el-${meta.elementId++}`;
	const newProps = Object.assign({ key }, element.props);
	return React.cloneElement(element, newProps, children);
}

/**
 * @template P
 * @template {string | React.JSXElementConstructor<P>} T
 * @param {P & { as?: T, tagName?: T, options?: import('linkifyjs').Opts, children?: React.ReactNode}} props
 * @returns {React.ReactElement<P, T>}
 */
const Linkify = (props) => {
	// Copy over all non-linkify-specific props
	let linkId = 0;

	const defaultLinkRender = ({ tagName, attributes, content }) => {
		attributes.key = `__linkify-lnk-${linkId++}`;
		if (attributes.class) {
			attributes.className = attributes.class;
			delete attributes.class;
		}
		return React.createElement(tagName, attributes, content);
	};

	const newProps = { key: '__linkify-wrapper' };
	for (const prop in props) {
		if (prop !== 'options' && prop !== 'as' && prop !== 'tagName' && prop !== 'children') {
			newProps[prop] = props[prop];
		}
	}

	const opts = new Options(props.options, defaultLinkRender);
	const as = props.as || props.tagName || React.Fragment || 'span';
	const children = props.children;
	const element = React.createElement(as, newProps, children);

	return linkifyReactElement(element, opts, { elementId: 0 });
};

export default Linkify;
