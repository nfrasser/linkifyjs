import * as linkify from 'linkifyjs/src/linkify.js';
import { keyword, tokens, registerKeywords } from 'linkify-plugin-keyword/src/keyword.js';
import { expect } from 'chai';

describe('linkify-plugin-keyword', () => {
	beforeEach(() => {
		linkify.reset();
	});

	it('cannot parse keywords before applying the plugin', () => {
		expect(linkify.find('Hello, World!')).to.be.eql([]);
	});

	describe('#registerKeywords()', () => {
		it('Throws on empty keywords', () => {
			expect(() => registerKeywords([''])).to.throw();
		});

		it('Throws on non-string keywords', () => {
			expect(() => registerKeywords([42])).to.throw();
		});
	});

	describe('after plugin is applied with no keywords', () => {
		beforeEach(() => {
			registerKeywords([]); // just to test the branch
			linkify.registerTokenPlugin('keyword', tokens);
			linkify.registerPlugin('keyword', keyword);
		});

		it('Does not interfere with initialization', () => {
			expect(linkify.find('http.org')).to.be.ok;
		});
	});

	describe('after plugin is applied', () => {
		const keywords = [
			'42',
			'hello',
			'world',
			'500px',
			'テスト',
			'öko123',
			'http',
			'view-source',
			'view--source',
			'-view-source-',
			'🍕💩',
			'Hello, World!',
			'world', // repeat
			'~ ^_^ ~',
		];

		const potentiallyConflictingStrings = [
			['http://192.168.0.42:4242', 'url'],
			['http.org', 'url'],
			['hello.world', 'url'],
			['world.world', 'url'],
			['hello42öko123.world', 'url'],
			['https://hello.world', 'url'],
			['500px.com', 'url'],
			['テスト@example.com', 'email'],
			['example@テスト.to', 'email'],
			['www.view-source.com', 'url'],
			['🍕💩.kz', 'url'],
		];

		beforeEach(() => {
			registerKeywords(keywords);
			linkify.registerTokenPlugin('keyword', tokens);
			linkify.registerPlugin('keyword', keyword);
		});

		it('finds numeric keywords', () => {
			expect(linkify.find('The magic number is 42!')).to.be.eql([
				{
					type: 'keyword',
					value: '42',
					href: '42',
					isLink: true,
					start: 20,
					end: 22,
				},
			]);
		});

		for (const keyword of keywords) {
			it(`Detects keyword ${keyword}`, () => {
				expect(linkify.test(keyword, 'keyword')).to.be.ok;
			});
		}

		for (const [str, type] of potentiallyConflictingStrings) {
			it(`Does not conflict with existing token ${type} ${str}`, () => {
				expect(linkify.test(str, type)).to.be.ok;
			});
		}
	});
});
