import { expect } from 'chai';
import linkifyStr from 'linkify-string/src/linkify-string.mjs';

describe('linkify-string', () => {
	// For each element in this array
	// [0] - Original text
	// [1] - Linkified with default options
	// [2] - Linkified with new options
	const tests = [
		['Test with no links', 'Test with no links', 'Test with no links'],
		[
			'The URL is google.com and the email is test@example.com',
			'The URL is <a href="http://google.com">google.com</a> and the email is <a href="mailto:test@example.com">test@example.com</a>',
			'The URL is <span href="https://google.com" class="my-linkify-class" target="_parent" rel="nofollow" onclick="javascript:alert(&quot;Hello&quot;);">google.com</span> and the email is <span href="mailto:test@example.com?subject=Hello%20from%20Linkify" class="my-linkify-class" target="_parent" rel="nofollow" onclick="javascript:alert(&quot;Hello&quot;);">test@example.com</span>',
		],
		[
			'Super long maps URL https://www.google.ca/maps/@43.472082,-80.5426668,18z?hl=en, a #hash-tag, and an email: test.wut.yo@gmail.co.uk!\n',
			'Super long maps URL <a href="https://www.google.ca/maps/@43.472082,-80.5426668,18z?hl=en">https://www.google.ca/maps/@43.472082,-80.5426668,18z?hl=en</a>, a #hash-tag, and an email: <a href="mailto:test.wut.yo@gmail.co.uk">test.wut.yo@gmail.co.uk</a>!\n',
			'Super long maps URL <span href="https://www.google.ca/maps/@43.472082,-80.5426668,18z?hl=en" class="my-linkify-class" target="_parent" rel="nofollow" onclick="javascript:alert(&quot;Hello&quot;);">https://www.google.ca/maps/@43.472082,-8…</span>, a #hash-tag, and an email: <span href="mailto:test.wut.yo@gmail.co.uk?subject=Hello%20from%20Linkify" class="my-linkify-class" target="_parent" rel="nofollow" onclick="javascript:alert(&quot;Hello&quot;);">test.wut.yo@gmail.co.uk</span>!<br>\n',
		],
	];

	let options;

	before(() => {
		options = {
			// test options
			tagName: 'span',
			target: '_parent',
			nl2br: true,
			className: 'my-linkify-class',
			defaultProtocol: 'https',
			rel: 'nofollow',
			attributes: {
				onclick: 'javascript:alert("Hello");',
			},
			format: function (val) {
				return val.truncate(40);
			},
			formatHref: function (href, type) {
				if (type === 'email') {
					href += '?subject=Hello%20from%20Linkify';
				}
				return href;
			},
		};
	});

	it('Works with default options', () => {
		tests.map(function (test) {
			expect(linkifyStr(test[0])).to.be.eql(test[1]);
		});
	});

	it('Works with overriden options (general)', () => {
		tests.map(function (test) {
			expect(linkifyStr(test[0], options)).to.be.eql(test[2]);
		});
	});

	describe('Prototype method', () => {
		it('Works with default options', () => {
			tests.map(function (test) {
				expect(test[0].linkify()).to.be.eql(test[1]);
			});
		});

		it('Works with overriden options (general)', () => {
			tests.map(function (test) {
				expect(test[0].linkify(options)).to.be.eql(test[2]);
			});
		});
	});

	describe('Validation', () => {
		// Test specific options
		const options = {
			validate: {
				url: (text) => /^(http|ftp)s?:\/\//.test(text) || text.slice(0, 3) === 'www',
			},
		};

		const tests = [
			['1.Test with no links', '1.Test with no links'],
			[
				'2.The URL is google.com and the email is test@example.com',
				'2.The URL is google.com and the email is <a href="mailto:test@example.com">test@example.com</a>',
			],
			['3.The URL is www.google.com', '3.The URL is <a href="http://www.google.com">www.google.com</a>'],
			['4.The URL is http://google.com', '4.The URL is <a href="http://google.com">http://google.com</a>'],
			['5.The URL is ftp://google.com', '5.The URL is <a href="ftp://google.com">ftp://google.com</a>'],
			[
				'6.Test with no links.It is sloppy avoiding spaces after the dot',
				'6.Test with no links.It is sloppy avoiding spaces after the dot',
			],
		];

		it('Works with overriden options (validate)', function () {
			tests.map(function (test) {
				expect(linkifyStr(test[0], options)).to.be.eql(test[1]);
			});
		});
	});
});
