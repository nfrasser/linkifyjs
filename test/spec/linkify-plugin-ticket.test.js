import * as linkify from 'linkifyjs/src/linkify.js';
import ticket from 'linkify-plugin-ticket/src/ticket.js';
import { expect } from 'chai';

describe('linkify-plugin-ticket', () => {
	beforeEach(() => {
		linkify.reset();
	});

	it('cannot parse tickets before applying the plugin', () => {
		expect(linkify.find('This is ticket #2015 and #1234 and #%^&*( should not work')).to.be.eql([]);
		expect(linkify.test('#1422', 'ticket')).to.not.be.ok;
		expect(linkify.test('#987', 'ticket')).to.not.be.ok;
	});

	describe('after plugin is applied', () => {
		it('can parse tickets after applying the plugin', () => {
			linkify.registerPlugin('ticket', ticket);

			expect(linkify.find('Check out issue #42')).to.be.eql([
				{
					type: 'ticket',
					value: '#42',
					href: '#42',
					isLink: true,
					start: 16,
					end: 19,
				},
			]);

			expect(linkify.find('Check out issue #9999999 and also #0')).to.be.eql([
				{
					type: 'ticket',
					value: '#9999999',
					href: '#9999999',
					isLink: true,
					start: 16,
					end: 24,
				},
				{
					type: 'ticket',
					value: '#0',
					href: '#0',
					isLink: true,
					start: 34,
					end: 36,
				},
			]);
		});
	});
});
