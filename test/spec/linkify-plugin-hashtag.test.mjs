import * as linkify from 'linkifyjs/src/linkify.mjs';
import hashtag from 'linkify-plugin-hashtag/src/hashtag.mjs';
import { expect } from 'chai';

describe('linkify-plugin-hashtag', () => {
	beforeEach(() => {
		linkify.reset();
	});

	it('cannot parse hashtags before applying the plugin', () => {
		expect(linkify.find('There is a #hashtag #YOLO-2015 and #1234 and #%^&*( should not work')).to.be.eql([]);

		expect(linkify.test('#wat', 'hashtag')).to.not.be.ok;
		expect(linkify.test('#987', 'hashtag')).to.not.be.ok;
	});

	describe('after plugin is applied', () => {
		beforeEach(() => {
			linkify.registerPlugin('hashtag', hashtag);
		});

		it('can parse hashtags after applying the plugin', () => {
			expect(
				linkify.find('There is a #hashtag 💃#YOLO_2015 #__swag__ and #1234 and #%^&*( #_ #__ should not work'),
			).to.be.eql([
				{
					type: 'hashtag',
					value: '#hashtag',
					href: '#hashtag',
					isLink: true,
					start: 11,
					end: 19,
				},
				{
					type: 'hashtag',
					value: '#YOLO_2015',
					href: '#YOLO_2015',
					isLink: true,
					start: 22,
					end: 32,
				},
				{
					type: 'hashtag',
					value: '#__swag__',
					href: '#__swag__',
					isLink: true,
					start: 33,
					end: 42,
				},
			]);
		});

		it('Works with basic hashtags', () => {
			expect(linkify.test('#wat', 'hashtag')).to.be.ok;
		});

		it('Works with trailing underscores', () => {
			expect(linkify.test('#bug_', 'hashtag')).to.be.ok;
		});

		it('Works with underscores', () => {
			expect(linkify.test('#bug_test', 'hashtag')).to.be.ok;
		});

		it('Works with double underscores', () => {
			expect(linkify.test('#bug__test', 'hashtag')).to.be.ok;
		});

		it('Works with number prefix', () => {
			expect(linkify.test('#123abc', 'hashtag')).to.be.ok;
		});

		it('Works with number/underscore prefix', () => {
			expect(linkify.test('#123_abc', 'hashtag')).to.be.ok;
		});

		it('Works with Hangul characters', () => {
			expect(linkify.test('#일상', 'hashtag')).to.be.ok;
		});

		it('Works with Cyrillic characters', () => {
			expect(linkify.test('#АБВ_бв', 'hashtag')).to.be.ok;
		});

		it('Works with Arabic characters', () => {
			expect(linkify.test('#سلام', 'hashtag')).to.be.ok;
		});

		it('Works with Japanese characters', () => {
			expect(linkify.test('#おはよう', 'hashtag')).to.be.ok;
		});

		it('Works with Japanese characters and full width middle dot', () => {
			expect(linkify.test('#おは・よう', 'hashtag')).to.be.ok;
		});

		it('Works with emojis', () => {
			expect(linkify.test('#🍭', 'hashtag')).to.be.ok;
		});

		it('Works with emojis and letters', () => {
			expect(linkify.test('#candy🍭', 'hashtag')).to.be.ok;
		});

		it('Works with emojis and letters and underscores', () => {
			expect(linkify.test('#__candy_🍭sdsd🖤_wat', 'hashtag')).to.be.ok;
		});

		it('Does not work with just numbers', () => {
			expect(linkify.test('#987', 'hashtag')).to.not.be.ok;
		});

		it('Does not work with just numbers and underscore', () => {
			expect(linkify.test('#987_654', 'hashtag')).to.not.be.ok;
		});
	});
});
