import * as linkify from 'linkifyjs/src/linkify.mjs';
import { init as initScanner, run as runScanner } from 'linkifyjs/src/scanner.mjs';
import { ipv4Tokens, ipv6Tokens, ip } from 'linkify-plugin-ip/src/ip.mjs';
import { expect } from 'chai';

describe('linkify-plugin-ip', () => {
	beforeEach(() => {
		linkify.reset();
	});

	it('cannot parse IP addresse before applying the plugin', () => {
		expect(linkify.find('No place like 127.0.0.1')).to.be.eql([]);
		expect(linkify.test('255.255.255.255', 'ipv4')).to.not.be.ok;
		expect(linkify.test('http://[2001:db8::ff00:42:8329]', 'url')).to.not.be.ok;
	});

	describe('scanner', () => {
		let scanner;

		beforeEach(() => {
			scanner = initScanner();
			ipv4Tokens({ scanner });
			ipv6Tokens({ scanner });
		});

		it('Scans IPV6 tokens', () => {
			const tokens = runScanner(scanner.start, '[2606:4700:4700:0:0:0:0:1111]');
			expect(tokens).to.eql([
				{
					t: 'B_IPV6_B',
					v: '[2606:4700:4700:0:0:0:0:1111]',
					s: 0,
					e: 29,
				},
			]);
		});
	});

	describe('after plugin is applied', () => {
		beforeEach(() => {
			linkify.registerTokenPlugin('ipv4', ipv4Tokens);
			linkify.registerTokenPlugin('ipv6', ipv6Tokens);
			linkify.registerPlugin('ip', ip);
		});

		it('can parse ips after applying the plugin', () => {
			expect(linkify.find('No place like 127.0.0.1')).to.be.eql([
				{
					type: 'ipv4',
					value: '127.0.0.1',
					href: 'http://127.0.0.1',
					isLink: true,
					start: 14,
					end: 23,
				},
			]);

			expect(linkify.test('255.255.255.255', 'ipv4')).to.be.ok;
		});

		const validTests = [
			['0.0.0.0', 'ipv4'],
			['192.168.0.1', 'ipv4'],
			['255.255.255.255', 'ipv4'],
			['232.121.20.3/', 'url'],
			['232.121.20.3:255', 'url'],
			['232.121.20.3:3000', 'url'],
			['http://[::]', 'url'],
			['http://[1::]', 'url'],
			['http://[123::]', 'url'],
			['http://[::1]', 'url'],
			['http://[::123]', 'url'],
			['http://[1::1]', 'url'],
			['http://[123::123]', 'url'],
			['http://[12ef::12ef]', 'url'],
			['http://[::1:2:3]', 'url'],
			['http://[f:f::f:f]', 'url'],
			['http://[f:f:f:f:f:f:f:f]', 'url'],
			['http://[:f:f:f:f:f:f:f]', 'url'],
			['http://[::1:2:3:a:b:c]', 'url'],
			['http://[11:22:33:aa:bb:cc::]', 'url'],
			['http://[2606:4700:4700:0:0:0:0:1111]/', 'url'],
			['https://[2606:4700:4700:0:0:0:0:1111]:443/', 'url'],
			['http://[2001:db8::ff00:42:8329]', 'url'],
		];

		const invalidTests = [
			'0.0.0.0.0',
			'255.255.256.255',
			'232.121.20/',
			'232.121.3:255',
			'121.20.3.242.232:3000',
			'http://[f:f:f:f:f:f:f]', // too few components
			'http://[:f:f:f:f:f:f]', // too few components
			'http://[f:f:f:f:f:f:]', // too few components
			'http://[f:f:f:f:f:f:f:f:f]', // too many components
			'http://[f:f:f:f:::f]', // too many colons
			'http://[::123ef]', // component too long
			'http://[123ef::]', // component too long
			'http://[123ef::fed21]', // component too long
			'http://[::g]', // invalid hex digit
			// 'http://[::f:f:f:f:f:f:f:f]',  // too many components (hard to implement)
			// 'http://[f:f:f:f::f:f:f:f]',  // too many components (hard to implement)
			// 'http://[f::ff:ff::f]', // too many colons, ambiguous (hard to implement)
		];

		for (const [value, type] of validTests) {
			it(`Detects ${value} as ${type}`, () => {
				expect(linkify.test(value, type)).to.be.ok;
			});
		}

		for (const test of invalidTests) {
			it(`Does not detect ${test}`, () => {
				expect(linkify.test(test)).to.not.be.ok;
			});
		}
	});
});
