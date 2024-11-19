import React from 'react';
import ReactDOMServer from 'react-dom/server';
import * as linkify from 'linkifyjs';
import Linkify from 'linkify-react/src/linkify-react.mjs';
import mention from 'linkify-plugin-mention/src/mention.mjs';
import { expect } from 'chai';

const options = {
	// test options
	tagName: 'em',
	target: '_parent',
	nl2br: true,
	className: 'my-linkify-class',
	defaultProtocol: 'https',
	rel: 'nofollow',
	attributes: {
		onClick() {
			alert('Hello World!');
		},
	},
	format: function (val) {
		return val.truncate(40);
	},
	formatHref: {
		email: (href) => href + '?subject=Hello%20from%20Linkify',
	},
};

describe('linkify-react', () => {
	// For each element in this array
	// [0] - Original text
	// [1] - Linkified with default options
	// [2] - Linkified with new options
	let tests = [
		['Test with no links', 'Test with no links', '<div class="lambda">Test with no links</div>'],
		[
			'The URL is google.com and the email is test@example.com',
			'The URL is <a href="http://google.com">google.com</a> and the email is <a href="mailto:test@example.com">test@example.com</a>',
			'<div class="lambda">The URL is <em href="https://google.com" target="_parent" rel="nofollow" class="my-linkify-class">google.com</em> and the email is <em href="mailto:test@example.com?subject=Hello%20from%20Linkify" target="_parent" rel="nofollow" class="my-linkify-class">test@example.com</em></div>',
		],
		[
			'Super long maps URL https://www.google.ca/maps/@43.472082,-80.5426668,18z?hl=en, a #hash-tag, and an email: test.wut.yo@gmail.co.uk!\n',
			'Super long maps URL <a href="https://www.google.ca/maps/@43.472082,-80.5426668,18z?hl=en">https://www.google.ca/maps/@43.472082,-80.5426668,18z?hl=en</a>, a #hash-tag, and an email: <a href="mailto:test.wut.yo@gmail.co.uk">test.wut.yo@gmail.co.uk</a>!\n',
			'<div class="lambda">Super long maps URL <em href="https://www.google.ca/maps/@43.472082,-80.5426668,18z?hl=en" target="_parent" rel="nofollow" class="my-linkify-class">https://www.google.ca/maps/@43.472082,-8…</em>, a #hash-tag, and an email: <em href="mailto:test.wut.yo@gmail.co.uk?subject=Hello%20from%20Linkify" target="_parent" rel="nofollow" class="my-linkify-class">test.wut.yo@gmail.co.uk</em>!<br/></div>',
		],
		[
			'Link with @some.username\nshould not work as a link',
			'Link with @some.username\nshould not work as a link',
			'<div class="lambda">Link with @some.username<br/>should not work as a link</div>',
		],
	];

	it('Works with default options', function () {
		tests.map((test) => {
			var linkified = React.createElement(Linkify, null, test[0]);
			var result = ReactDOMServer.renderToStaticMarkup(linkified);
			expect(result).to.be.oneOf([test[1], `<span>${test[1]}</span>`]);
		});
	});

	it('Works with overriden options', function () {
		tests.map((test) => {
			var props = { options, as: 'div', className: 'lambda' };
			var linkified = React.createElement(Linkify, props, test[0]);
			var result = ReactDOMServer.renderToStaticMarkup(linkified);
			expect(result).to.be.eql(test[2]);
		});
	});

	it('Finds links recursively', function () {
		var strong = React.createElement('strong', null, 'https://facebook.github.io/react/');
		var linkified = React.createElement(Linkify, null, 'A great site is google.com AND ', strong);
		var result = ReactDOMServer.renderToStaticMarkup(linkified);
		var expected =
			'A great site is <a href="http://google.com">google.com</a> AND <strong><a href="https://facebook.github.io/react/">https://facebook.github.io/react/</a></strong>';
		expect(result).to.be.oneOf([expected, `<span>${expected}</span>`]);
	});

	it('Excludes self-closing elements', () => {
		class Delta extends React.Component {
			render() {
				return React.createElement('strong', this.props, 'https://facebook.github.io/react/');
			}
		}

		var delta = React.createElement(Delta);
		var linkified = React.createElement(Linkify, null, 'A great site is google.com AND ', delta);
		var result = ReactDOMServer.renderToStaticMarkup(linkified);
		var expected =
			'A great site is <a href="http://google.com">google.com</a> AND <strong>https://facebook.github.io/react/</strong>';
		expect(result).to.be.oneOf([expected, `<span>${expected}</span>`]);
	});

	it('Obeys ignoreTags option', () => {
		var options = {
			ignoreTags: ['em'],
		};
		var em = React.createElement('em', null, 'https://facebook.github.io/react/');
		var linkified = React.createElement(Linkify, { options }, 'A great site is google.com AND ', em);
		var result = ReactDOMServer.renderToStaticMarkup(linkified);
		var expected =
			'A great site is <a href="http://google.com">google.com</a> AND <em>https://facebook.github.io/react/</em>';
		expect(result).to.be.oneOf([expected, `<span>${expected}</span>`]);
	});

	it('Correctly renders multiple text and element children', () => {
		const options = { nl2br: true };
		const foo = `hello

		`;
		const bar = `hello

		`;
		const linkified = React.createElement(
			Linkify,
			{ options },
			foo,
			' ',
			bar,
			React.createElement('em', { key: 0 }, ['or contact nfrasser@example.com']),
			'For the latest javascript.net\n',
			React.createElement('strong', { key: 1 }, ['and also\n', '🥺👄.ws']),
		);
		const result = ReactDOMServer.renderToStaticMarkup(linkified);
		const expected = [
			'hello<br/><br/>\t\t ',
			'hello<br/><br/>\t\t',
			'<em>or contact <a href="mailto:nfrasser@example.com">nfrasser@example.com</a></em>',
			'For the latest <a href="http://javascript.net">javascript.net</a><br/>',
			'<strong>and also<br/><a href="http://🥺👄.ws">🥺👄.ws</a></strong>',
		].join('');
		expect(result).to.be.oneOf([expected, `<span>${expected}</span>`]);
	});

	describe('Custom render', () => {
		beforeEach(() => {
			linkify.reset();
			linkify.registerPlugin('mention', mention);
		});

		it('Renders dedicated mentions component', () => {
			const options = {
				formatHref: {
					mention: (href) => `/users${href}`,
				},
				render: {
					mention: ({ attributes, content }) => {
						const { href, ...props } = attributes;
						return React.createElement('span', { 'data-to': href, ...props }, content);
					},
				},
			};
			const linkified = React.createElement(
				Linkify,
				{ options },
				'Check out linkify.js.org or contact @nfrasser',
			);
			const result = ReactDOMServer.renderToStaticMarkup(linkified);
			const expected =
				'Check out <a href="http://linkify.js.org">linkify.js.org</a> or contact <span data-to="/users/nfrasser">@nfrasser</span>';
			expect(result).to.be.oneOf([expected, `<span>${expected}</span>`]);
		});
	});
});
