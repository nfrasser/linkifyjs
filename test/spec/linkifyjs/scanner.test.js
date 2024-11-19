import { expect } from 'chai';
import * as scanner from 'linkifyjs/src/scanner.js';
import * as t from 'linkifyjs/src/text.js';

// The elements are
// 1. input string
// 2. Types for the resulting instances
// 3. String values for the resulting instances
const tests = [
	['', [], []],
	['@', [t.AT], ['@']],
	[':', [t.COLON], [':']],
	['.', [t.DOT], ['.']],
	['-', [t.HYPHEN], ['-']],
	['\n', [t.NL], ['\n']],
	['+', [t.PLUS], ['+']],
	['#', [t.POUND], ['#']],
	['/', [t.SLASH], ['/']],
	['&', [t.AMPERSAND], ['&']],
	['*', [t.ASTERISK], ['*']],
	['\\', [t.BACKSLASH], ['\\']],
	['%', [t.PERCENT], ['%']],
	['`', [t.BACKTICK], ['`']],
	['^', [t.CARET], ['^']],
	['|', [t.PIPE], ['|']],
	['~', [t.TILDE], ['~']],
	['$', [t.DOLLAR], ['$']],
	['=', [t.EQUALS], ['=']],
	['-', [t.HYPHEN], ['-']],
	['・', [t.FULLWIDTHMIDDLEDOT], ['・']],
	['&?<>(', [t.AMPERSAND, t.QUERY, t.OPENANGLEBRACKET, t.CLOSEANGLEBRACKET, t.OPENPAREN], ['&', '?', '<', '>', '(']],
	[
		'([{}])',
		[t.OPENPAREN, t.OPENBRACKET, t.OPENBRACE, t.CLOSEBRACE, t.CLOSEBRACKET, t.CLOSEPAREN],
		['(', '[', '{', '}', ']', ')'],
	],
	["!,;'", [t.EXCLAMATION, t.COMMA, t.SEMI, t.APOSTROPHE], ['!', ',', ';', "'"]],
	['hello', [t.WORD], ['hello']],
	['Hello123', [t.WORD, t.NUM], ['Hello', '123']],
	['hello123world', [t.WORD, t.NUM, t.TLD], ['hello', '123', 'world']],
	['0123', [t.NUM], ['0123']],
	['123abc', [t.NUM, t.TLD], ['123', 'abc']],
	['http', [t.SLASH_SCHEME], ['http']],
	['http:', [t.SLASH_SCHEME, t.COLON], ['http', ':']],
	['https:', [t.SLASH_SCHEME, t.COLON], ['https', ':']],
	['files:', [t.WORD, t.COLON], ['files', ':']],
	['file//', [t.SCHEME, t.SLASH, t.SLASH], ['file', '/', '/']],
	['ftp://', [t.SLASH_SCHEME, t.COLON, t.SLASH, t.SLASH], ['ftp', ':', '/', '/']],
	['mailto', [t.SCHEME], ['mailto']],
	['mailto:', [t.SCHEME, t.COLON], ['mailto', ':']],
	['c', [t.WORD], ['c']],
	['co', [t.TLD], ['co']],
	['com', [t.TLD], ['com']],
	['comm', [t.WORD], ['comm']],
	[
		'vermögensberater السعودية москва',
		[t.TLD, t.WS, t.UTLD, t.WS, t.UTLD],
		['vermögensberater', ' ', 'السعودية', ' ', 'москва'],
	],
	['abc 123  DoReMi', [t.TLD, t.WS, t.NUM, t.WS, t.WORD], ['abc', ' ', '123', '  ', 'DoReMi']],
	[
		'abc 123 \n  DoReMi',
		[t.TLD, t.WS, t.NUM, t.WS, t.NL, t.WS, t.WORD],
		['abc', ' ', '123', ' ', '\n', '  ', 'DoReMi'],
	],
	['local', [t.WORD], ['local']],
	['localhost', [t.LOCALHOST], ['localhost']],
	['localhosts', [t.WORD], ['localhosts']],
	['500px', [t.NUM, t.WORD], ['500', 'px']],
	['500-px', [t.NUM, t.HYPHEN, t.WORD], ['500', '-', 'px']],
	['-500px', [t.HYPHEN, t.NUM, t.WORD], ['-', '500', 'px']],
	['500px-', [t.NUM, t.WORD, t.HYPHEN], ['500', 'px', '-']],
	['123-456', [t.NUM, t.HYPHEN, t.NUM], ['123', '-', '456']],
	['foo\u00a0bar', [t.TLD, t.WS, t.TLD], ['foo', '\u00a0', 'bar']], // nbsp
	['çïrâ.ca', [t.UWORD, t.WORD, t.UWORD, t.DOT, t.TLD], ['çï', 'r', 'â', '.', 'ca']],
	['❤️💚', [t.EMOJI], ['❤️💚']],
	['👊🏿🧑🏼‍🔬🌚', [t.EMOJI], ['👊🏿🧑🏼‍🔬🌚']], // contains zero-width joiner \u200d
	['www.🍕💩.ws', [t.WORD, t.DOT, t.EMOJI, t.DOT, t.TLD], ['www', '.', '🍕💩', '.', 'ws']],
	[
		'za̡͊͠͝lgό.gay', // May support diacritics in the future if someone complains
		[t.TLD, t.SYM, t.SYM, t.SYM, t.SYM, t.WORD, t.UWORD, t.DOT, t.TLD],
		['za', '͠', '̡', '͊', '͝', 'lg', 'ό', '.', 'gay'],
	],
	[
		"Direniş İzleme Grubu'nun",
		[t.WORD, t.UWORD, t.WS, t.UWORD, t.WORD, t.WS, t.WORD, t.APOSTROPHE, t.WORD],
		['Direni', 'ş', ' ', 'İ', 'zleme', ' ', 'Grubu', "'", 'nun'],
	],
	[
		'example.com　　　テスト', // spaces are ideographic space
		[t.WORD, t.DOT, t.TLD, t.WS, t.UWORD],
		['example', '.', 'com', '　　　', 'テスト'],
	],
	[
		'#АБВ_бв #한글 #سلام',
		[t.POUND, t.UWORD, t.UNDERSCORE, t.UWORD, t.WS, t.POUND, t.UWORD, t.WS, t.POUND, t.UWORD],
		['#', 'АБВ', '_', 'бв', ' ', '#', '한글', ' ', '#', 'سلام'],
	],
	['#おは・よう', [t.POUND, t.UWORD, t.FULLWIDTHMIDDLEDOT, t.UWORD], ['#', 'おは', '・', 'よう']],
	['テストexample.comテスト', [t.UWORD, t.WORD, t.DOT, t.TLD, t.UWORD], ['テスト', 'example', '.', 'com', 'テスト']],
	[
		'テストhttp://example.comテスト',
		[t.UWORD, t.SLASH_SCHEME, t.COLON, t.SLASH, t.SLASH, t.WORD, t.DOT, t.TLD, t.UWORD],
		['テスト', 'http', ':', '/', '/', 'example', '.', 'com', 'テスト'],
	],
];

const customSchemeTests = [
	['stea', [t.WORD], ['stea']],
	['steam', ['steam'], ['steam']],
	['steams', [t.WORD], ['steams']],
	['view', [t.WORD], ['view']],
	['view-', [t.WORD, t.HYPHEN], ['view', '-']],
	['view-s', [t.WORD, t.HYPHEN, t.WORD], ['view', '-', 's']],
	['view-sour', [t.WORD, t.HYPHEN, t.WORD], ['view', '-', 'sour']],
	['view-source', ['view-source'], ['view-source']],
	['view-sources', ['view-source', t.WORD], ['view-source', 's']], // This is an unfortunate consequence :(
	['twitter dot com', ['twitter', t.WS, t.TLD, t.WS, t.TLD], ['twitter', ' ', 'dot', ' ', 'com']],
	['ms-settings', ['ms-settings'], ['ms-settings']],
	['geo', ['geo'], ['geo']],
	['42', ['42'], ['42']],
];

describe('linkifyjs/scanner', () => {
	let start, tokens;

	before(() => {
		const result = scanner.init();
		start = result.start;
		tokens = result.tokens;
	});

	function makeTest(test) {
		return it('Tokenizes the string "' + test[0] + '"', () => {
			var str = test[0];
			var types = test[1];
			var values = test[2];
			var result = scanner.run(start, str);

			expect(result.map((token) => token.t)).to.eql(types);
			expect(result.map((token) => token.v)).to.eql(values);
		});
	}

	// eslint-disable-next-line mocha/no-setup-in-describe
	tests.map(makeTest, this);

	it('Correctly sets start and end indexes', () => {
		expect(scanner.run(start, 'Hello, World!')).to.eql([
			{ t: t.WORD, v: 'Hello', s: 0, e: 5 },
			{ t: t.COMMA, v: ',', s: 5, e: 6 },
			{ t: t.WS, v: ' ', s: 6, e: 7 },
			{ t: t.TLD, v: 'World', s: 7, e: 12 },
			{ t: t.EXCLAMATION, v: '!', s: 12, e: 13 },
		]);
	});

	describe('Custom protocols', () => {
		before(() => {
			const result = scanner.init([
				['twitter', false],
				['steam', true],
				['org', false], // TLD is also a domain
				['geo', false],
				['42', true],
				['view-source', false],
				['ms-settings', true],
			]);
			start = result.start;
			tokens = result.tokens;
		});

		// eslint-disable-next-line mocha/no-setup-in-describe
		customSchemeTests.map(makeTest, this);

		it('Updates collections correctly', () => {
			expect(tokens.groups.scheme).to.eql([t.SCHEME, '42', 'ms-settings', 'steam']);
			expect(tokens.groups.slashscheme).to.eql([t.SLASH_SCHEME, 'geo', 'org', 'twitter', 'view-source']);
			expect(tokens.groups.tld).includes('org');
		});

		it('Correctly tokenizes a full custom protocols', () => {
			expect(scanner.run(start, 'steam://hello')).to.eql([
				{ t: 'steam', v: 'steam', s: 0, e: 5 },
				{ t: t.COLON, v: ':', s: 5, e: 6 },
				{ t: t.SLASH, v: '/', s: 6, e: 7 },
				{ t: t.SLASH, v: '/', s: 7, e: 8 },
				{ t: t.WORD, v: 'hello', s: 8, e: 13 },
			]);
		});

		it('Classifies partial schemes', () => {
			expect(scanner.run(start, 'twitter dot com')).to.eql([
				{ t: 'twitter', v: 'twitter', s: 0, e: 7 },
				{ t: t.WS, v: ' ', s: 7, e: 8 },
				{ t: t.TLD, v: 'dot', s: 8, e: 11 },
				{ t: t.WS, v: ' ', s: 11, e: 12 },
				{ t: t.TLD, v: 'com', s: 12, e: 15 },
			]);
		});
	});
});
