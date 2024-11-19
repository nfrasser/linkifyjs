import { Options } from 'linkifyjs/src/options.mjs';
import { expect } from 'chai';
import * as tk from 'linkifyjs/src/text.mjs';
import * as mtk from 'linkifyjs/src/multi.mjs';
import * as scanner from 'linkifyjs/src/scanner.mjs';

describe('linkifyjs/multi', () => {
	let scannerStart;
	const defaultOpts = new Options();
	const opts = new Options({
		tagName: 'Link',
		target: '_parent',
		nl2br: true,
		className: 'my-linkify-class',
		defaultProtocol: 'https',
		rel: 'nofollow',
		attributes: { onclick: "console.log('Hello World!')" },
		truncate: 40,
		format: (val) => val.replace(/^(ht|f)tps?:\/\/(www\.)?/i, ''),
		formatHref: {
			email: (href) => href + '?subject=Hello%20from%20Linkify',
		},
	});

	before(() => {
		scannerStart = scanner.init().start;
	});

	describe('Multitoken', () => {
		it('Constructor runs', () => {
			expect(new mtk.Base()).to.be.ok;
		});
	});

	describe('Url', () => {
		let input1 = 'Ftps://www.github.com/Hypercontext/linkify';
		let input2 = 'co.co/?o=%2D&p=@gc#wat';
		let input3 =
			'https://www.google.com/maps/place/The+DMZ/@43.6578984,-79.3819437,17z/data=!4m9!1m2!2m1!1sRyerson+DMZ!3m5!1s0x882b34cad13907bf:0x393038cf922e1378!8m2!3d43.6563702!4d-79.3793919!15sCgtSeWVyc29uIERNWloNIgtyeWVyc29uIGRtepIBHmJ1c2luZXNzX21hbmFnZW1lbnRfY29uc3VsdGFudA';
		let url1, url2, url3;

		before(() => {
			const urlTextTokens1 = scanner.run(scannerStart, input1);
			const urlTextTokens2 = scanner.run(scannerStart, input2);
			const urlTextTokens3 = scanner.run(scannerStart, input3);

			url1 = new mtk.Url(input1, urlTextTokens1);
			url2 = new mtk.Url(input2, urlTextTokens2);
			url3 = new mtk.Url(input3, urlTextTokens3);
		});

		describe('#isLink', () => {
			it('Is true in all cases', () => {
				expect(url1.isLink).to.be.ok;
				expect(url2.isLink).to.be.ok;
			});
		});

		describe('#toString()', () => {
			it('Returns the exact URL text', () => {
				expect(url1.toString()).to.be.eql('Ftps://www.github.com/Hypercontext/linkify');
				expect(url2.toString()).to.be.eql('co.co/?o=%2D&p=@gc#wat');
			});
		});

		describe('#toHref()', () => {
			it('Keeps the protocol the same as the original URL', () => {
				expect(url1.toHref()).to.be.eql('Ftps://www.github.com/Hypercontext/linkify');
			});

			it('Adds a default protocol, if required', () => {
				expect(url2.toHref()).to.be.eql('http://co.co/?o=%2D&p=@gc#wat');
			});
		});

		describe('#toObject()', () => {
			it('Returns a hash with correct type, value, and href', () => {
				expect(url1.toObject('file')).to.be.eql({
					type: 'url',
					value: input1,
					href: input1,
					isLink: true,
					start: 0,
					end: input1.length,
				});

				expect(url2.toObject('https')).to.be.eql({
					type: 'url',
					value: input2,
					href: 'https://co.co/?o=%2D&p=@gc#wat',
					isLink: true,
					start: 0,
					end: input2.length,
				});
			});
		});

		describe('#hasProtocol()', () => {
			it('Tests true when there is a protocol', () => {
				expect(url1.hasProtocol()).to.be.ok;
			});

			it('Tests false when there is no protocol', () => {
				expect(url2.hasProtocol()).to.not.be.ok;
			});
		});

		describe('#toFormattedString()', () => {
			it('Formats with default options', () => {
				expect(url1.toFormattedString(defaultOpts)).to.eql('Ftps://www.github.com/Hypercontext/linkify');
			});

			it('Formats short link', () => {
				expect(url1.toFormattedString(opts)).to.eql('github.com/Hypercontext/linkify');
			});

			it('Formats long link', () => {
				expect(url3.toFormattedString(opts)).to.eql('google.com/maps/place/The+DMZ/@43.657898…');
			});
		});

		describe('#toFormattedHref()', () => {
			it('Formats href with scheme', () => {
				expect(url1.toFormattedHref(opts)).to.eql('Ftps://www.github.com/Hypercontext/linkify');
			});

			it('Formats href without scheme', () => {
				expect(url2.toFormattedHref(opts)).to.eql('https://co.co/?o=%2D&p=@gc#wat');
			});
		});

		describe('#toFormattedObject()', () => {
			it('Returns correctly formatted object', () => {
				expect(url1.toFormattedObject(opts)).to.eql({
					type: 'url',
					value: 'github.com/Hypercontext/linkify',
					isLink: true,
					href: 'Ftps://www.github.com/Hypercontext/linkify',
					start: 0,
					end: 42,
				});
			});
		});

		describe('#validate()', () => {
			it('Returns true for URL', () => {
				expect(url1.validate(opts)).to.be.ok;
			});
		});

		describe('#render()', () => {
			it('Works with default options', () => {
				expect(url1.render(defaultOpts)).to.eql({
					tagName: 'a',
					attributes: { href: 'Ftps://www.github.com/Hypercontext/linkify' },
					content: 'Ftps://www.github.com/Hypercontext/linkify',
					eventListeners: null,
				});
			});

			it('Works with overriden options', () => {
				expect(url1.render(opts)).to.eql({
					tagName: 'Link',
					attributes: {
						href: 'Ftps://www.github.com/Hypercontext/linkify',
						class: 'my-linkify-class',
						target: '_parent',
						rel: 'nofollow',
						onclick: "console.log('Hello World!')",
					},
					content: 'github.com/Hypercontext/linkify',
					eventListeners: null,
				});
			});
		});
	});

	describe('Email', () => {
		let input = 'test@example.com';
		let email;

		before(() => {
			const emailTextTokens = scanner.run(scannerStart, input);
			email = new mtk.Email(input, emailTextTokens);
		});

		describe('#isLink', () => {
			it('Is true in all cases', () => {
				expect(email.isLink).to.be.ok;
			});
		});

		describe('#toString()', () => {
			it('Returns the exact email address text', () => {
				expect(email.toString()).to.be.eql('test@example.com');
			});
		});

		describe('#toHref()', () => {
			it('Appends "mailto:" to the email address', () => {
				expect(email.toHref()).to.be.eql('mailto:test@example.com');
			});
		});
	});

	describe('MailtoEmail', () => {
		let input = 'mailto:test@example.com';
		let email;

		before(() => {
			const emailTextTokens = scanner.run(scannerStart, input);
			email = new mtk.Url(input, emailTextTokens);
		});

		describe('#isLink', () => {
			it('Is true in all cases', () => {
				expect(email.isLink).to.be.ok;
			});
		});

		describe('#toString()', () => {
			it('Returns mailto:test@example.com', () => {
				expect(email.toString()).to.be.eql('mailto:test@example.com');
			});
		});

		describe('#toHref()', () => {
			it('Returns mailto:test@example.com', () => {
				expect(email.toHref()).to.be.eql('mailto:test@example.com');
			});
		});
	});

	describe('Nl', () => {
		var nlTokens, nl;

		before(() => {
			nlTokens = [{ t: tk.NL, v: '\n', s: 0, e: 1 }];
			nl = new mtk.Nl('\n', nlTokens);
		});

		describe('#isLink', () => {
			it('Is false in all cases', () => {
				expect(nl.isLink).to.not.be.ok;
			});
		});

		describe('#toString()', () => {
			it('Returns a single newline character', () => {
				expect(nl.toString()).to.be.eql('\n');
			});
		});
	});

	describe('Text', () => {
		let text,
			input = 'Hello, World!';

		before(() => {
			const textTokens = scanner.run(scannerStart, input);
			text = new mtk.Text(input, textTokens);
		});

		describe('#isLink', () => {
			it('Is false in all cases', () => {
				expect(text.isLink).to.not.be.ok;
			});
		});

		describe('#toString()', () => {
			it('Returns the original string text', () => {
				expect(text.toString()).to.be.eql('Hello, World!');
			});
		});
	});
});
