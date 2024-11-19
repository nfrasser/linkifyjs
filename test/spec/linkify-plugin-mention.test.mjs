import { expect } from 'chai';
import * as linkify from 'linkifyjs/src/linkify.mjs';
import mention from 'linkify-plugin-mention/src/mention.mjs';

describe('linkify-plugin-mention', () => {
	beforeEach(() => {
		linkify.reset();
	});

	it('Cannot parse mentions before applying the plugin', () => {
		expect(linkify.find('There is a @mention @YOLO2016 and @1234 and @%^&*( should not work')).to.be.eql([]);

		expect(linkify.test('@wat', 'mention')).to.not.be.ok;
		expect(linkify.test('@007', 'mention')).to.not.be.ok;
	});

	describe('after plugin is applied', () => {
		beforeEach(() => {
			linkify.registerPlugin('mention', mention);
		});

		it('Can parse mentions after applying the plugin', () => {
			expect(linkify.find('There is a @mention @YOLO2016 and @1234 and @%^&*( should not work')).to.deep.equal([
				{
					type: 'mention',
					value: '@mention',
					href: '/mention',
					isLink: true,
					start: 11,
					end: 19,
				},
				{
					type: 'mention',
					value: '@YOLO2016',
					href: '/YOLO2016',
					isLink: true,
					start: 20,
					end: 29,
				},
				{
					type: 'mention',
					value: '@1234',
					href: '/1234',
					isLink: true,
					start: 34,
					end: 39,
				},
			]);

			expect(linkify.test('@wat', 'mention')).to.be.ok;
			expect(linkify.test('@987', 'mention')).to.be.ok;
		});

		it('detects mentions with just text', () => {
			expect(linkify.find('Hey @nfrasser')).to.deep.equal([
				{
					type: 'mention',
					value: '@nfrasser',
					href: '/nfrasser',
					isLink: true,
					start: 4,
					end: 13,
				},
			]);
		});

		it('parses mentions that begin and end with underscores', () => {
			expect(linkify.find('Mention for @__lI3t__')).to.deep.equal([
				{
					type: 'mention',
					value: '@__lI3t__',
					href: '/__lI3t__',
					isLink: true,
					start: 12,
					end: 21,
				},
			]);
		});

		it('parses mentions with hyphens and underscores', () => {
			expect(linkify.find('Paging @sir_mc-lovin')).to.deep.equal([
				{
					type: 'mention',
					value: '@sir_mc-lovin',
					href: '/sir_mc-lovin',
					isLink: true,
					start: 7,
					end: 20,
				},
			]);
		});

		it('parses github team-style mentions with slashes', () => {
			expect(linkify.find('Hey @500px/web please review this')).to.deep.equal([
				{
					type: 'mention',
					value: '@500px/web',
					href: '/500px/web',
					isLink: true,
					start: 4,
					end: 14,
				},
			]);
		});

		it('ignores extra slashes at the end of mentions', () => {
			expect(linkify.find('We should get ///@soapbox/_developers/@soapbox/cs//// to review these')).to.deep.equal(
				[
					{
						type: 'mention',
						value: '@soapbox/_developers',
						href: '/soapbox/_developers',
						isLink: true,
						start: 17,
						end: 37,
					},
					{
						type: 'mention',
						value: '@soapbox/cs',
						href: '/soapbox/cs',
						isLink: true,
						start: 38,
						end: 49,
					},
				],
			);
		});

		it('parses mentions with dots (ignores past the dots)', () => {
			expect(linkify.find('Hey @john.doe please review this')).to.deep.equal([
				{
					type: 'mention',
					value: '@john',
					href: '/john',
					isLink: true,
					start: 4,
					end: 9,
				},
			]);
		});

		it('ignores extra dots at the end of mentions', () => {
			expect(linkify.find('We should get ...@soapbox-_developers.@soapbox_cs.... to be awesome')).to.deep.equal([
				{
					type: 'mention',
					value: '@soapbox-_developers',
					href: '/soapbox-_developers',
					isLink: true,
					start: 17,
					end: 37,
				},
				{
					type: 'mention',
					value: '@soapbox_cs',
					href: '/soapbox_cs',
					isLink: true,
					start: 38,
					end: 49,
				},
			]);
		});

		it('does not treat @/.* as a mention', () => {
			expect(linkify.find('What about @/ and @/nfrasser?')).to.deep.equal([]);
		});

		it('ignores text only made up of symbols', () => {
			expect(linkify.find('Is @- or @~! a person? What about @%_% no, probably not')).to.deep.equal([]);
		});

		it('ignores punctuation at the end of mentions', () => {
			expect(linkify.find('These people are awesome: @graham, @brennan, and @chris! Also @nick.')).to.deep.equal([
				{
					type: 'mention',
					value: '@graham',
					href: '/graham',
					isLink: true,
					start: 26,
					end: 33,
				},
				{
					type: 'mention',
					value: '@brennan',
					href: '/brennan',
					isLink: true,
					start: 35,
					end: 43,
				},
				{
					type: 'mention',
					value: '@chris',
					href: '/chris',
					isLink: true,
					start: 49,
					end: 55,
				},
				{
					type: 'mention',
					value: '@nick',
					href: '/nick',
					isLink: true,
					start: 62,
					end: 67,
				},
			]);
		});

		it('detects numerical mentions', () => {
			expect(linkify.find('Hey @123 and @456_78910__')).to.deep.equal([
				{
					type: 'mention',
					value: '@123',
					href: '/123',
					isLink: true,
					start: 4,
					end: 8,
				},
				{
					type: 'mention',
					value: '@456_78910__',
					href: '/456_78910__',
					isLink: true,
					start: 13,
					end: 25,
				},
			]);
		});

		it('detects trailing hyphen', () => {
			expect(linkify.test('@123-', 'mention')).to.be.ok;
		});

		it('detects interjecting hyphen', () => {
			expect(linkify.test('@123-abc', 'mention')).to.be.ok;
		});

		it('detects single underscore', () => {
			expect(linkify.test('@_', 'mention')).to.be.ok;
		});

		it('detects multiple underscore', () => {
			expect(linkify.test('@__', 'mention')).to.be.ok;
		});

		it('ignores interjecting dot', () => {
			expect(linkify.test('@hello.world', 'mention')).to.not.be.ok;
		});

		it('begin with hyphen', () => {
			expect(linkify.test('@-advanced', 'mention')).to.be.ok;
		});
	});

	afterEach(() => {
		linkify.reset();
	});
});
