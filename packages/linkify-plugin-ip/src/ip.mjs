import { createTokenClass, State, options, multi } from 'linkifyjs';

const B_IPV6_B = 'B_IPV6_B'; // 'bracket [', IPV6, '] bracket'

const IPv4Token = createTokenClass('ipv4', {
	isLink: true,
	toHref(scheme = options.defaults.defaultProtocol) {
		return `${scheme}://${this.v}`;
	},
});

/**
 * @type {import('linkifyjs').TokenPlugin}
 */
export function ipv4Tokens({ scanner }) {
	const { start } = scanner;
	const flags = { byte: true, numeric: true };

	// States for [0, 9]
	const Digits = [];
	for (let i = 0; i < 10; i++) {
		const x = start.tt(`${i}`, `${i}`, flags);
		Digits.push(x);
	}

	// States [10, 99]
	for (let i = 1; i < 10; i++) {
		const x = Digits[i];
		for (let j = 0; j < 10; j++) {
			x.tt(`${j}`, `${i}${j}`, flags);
		}
	}

	// States for [100, 199]
	for (let i = 0; i < 10; i++) {
		let xx = Digits[1].tt(`${i}`);
		for (let j = 0; j < 10; j++) {
			xx.tt(`${j}`, `1${i}${j}`, flags);
		}
	}

	// States for [200, 249]
	for (let i = 0; i < 5; i++) {
		let xx = Digits[2].tt(`${i}`);
		for (let j = 0; j < 10; j++) {
			xx.tt(`${j}`, `2${i}${j}`, flags);
		}
	}

	// States for [250, 255]
	let xx = Digits[2].tt('5');
	for (let i = 0; i < 6; i++) {
		xx.tt(`${i}`, `25${i}`, flags);
	}
}

/**
 * @type {import('linkifyjs').TokenPlugin}
 */
export const ipv6Tokens = ({ scanner }) => {
	const { start } = scanner;

	const HEX = /[0-9a-f]/;
	let z = start.tt('[');  // [
	let _ = z.tt(':'); // [:

	let x = z.tr(HEX);
	let x_ = x.tt(':');
	let x_x = x_.tr(HEX);
	let x_x_ = x_x.tt(':');
	let x_x_x = x_x_.tr(HEX);
	let x_x_x_ = x_x_x.tt(':');
	let x_x_x_x = x_x_x_.tr(HEX);
	let x_x_x_x_ = x_x_x_x.tt(':');
	let x_x_x_x_x = x_x_x_x_.tr(HEX);
	let x_x_x_x_x_ = x_x_x_x_x.tt(':');
	let x_x_x_x_x_x = x_x_x_x_x_.tr(HEX);
	let x_x_x_x_x_x_ = x_x_x_x_x_x.tt(':');
	let x_x_x_x_x_x_x = x_x_x_x_x_x_.tr(HEX);
	let x_x_x_x_x_x_x_ = x_x_x_x_x_x_x.tt(':');
	let x_x_x_x_x_x_x_x = x_x_x_x_x_x_x_.tr(HEX);

	let BIpv6B = x_x_x_x_x_x_x_x.tt(']', B_IPV6_B);
	x_x_x_x_x_x_x_.tt(']', BIpv6B);

	// Note: This isn't quite right because it allows unlimited components but
	// it's proved difficult to come up with a correct implementation.
	let __ = _.tt(':'); // [::
	let __x = __.tr(HEX);
	let __x_ = __x.tt(':');
	__x_.tt(':', __);
	__x_.tr(HEX, __x);

	x_.tt(':', __);
	x_x_.tt(':', __);
	x_x_x_.tt(':', __);
	x_x_x_x_.tt(':', __);
	x_x_x_x_x_.tt(':', __);
	x_x_x_x_x_x_.tt(':', __);

	_.tr(HEX, x_x);
	__.tt(']', BIpv6B);
	__x.tt(']', BIpv6B);
	__x_.tt(']', BIpv6B);

	// Ensures max of 4 items per component are allowed
	for (let i = 1; i < 4; i++) {
		x = x.tr(HEX);
		x_x = x_x.tr(HEX);
		x_x_x = x_x_x.tr(HEX);
		x_x_x_x = x_x_x_x.tr(HEX);
		x_x_x_x_x = x_x_x_x_x.tr(HEX);
		x_x_x_x_x_x = x_x_x_x_x_x.tr(HEX);
		x_x_x_x_x_x_x = x_x_x_x_x_x_x.tr(HEX);
		x_x_x_x_x_x_x_x = x_x_x_x_x_x_x_x.tr(HEX);


		x.tt(':', x_);
		x_x.tt(':', x_x_);
		x_x_x.tt(':', x_x_x_);
		x_x_x_x.tt(':', x_x_x_x_);
		x_x_x_x_x.tt(':', x_x_x_x_x_);
		x_x_x_x_x_x.tt(':', x_x_x_x_x_x_);
		x_x_x_x_x_x_x.tt(':', x_x_x_x_x_x_x_);
		x_x_x_x_x_x_x_x.tt(']', BIpv6B);

		__x = __x.tr(HEX);
		__x.tt(':', __x_);
		__x.tt(']', BIpv6B);
	}
};

/**
 * @type {import('linkifyjs').Plugin}
 */
export function ip({ scanner, parser }) {
	const { COLON, DOT, SLASH, LOCALHOST, SLASH_SCHEME, groups } =
		scanner.tokens;

	const ByteDot = new State();
	const ByteDotByte = new State();
	const ByteDotByteDotByte = new State();
	const IPv4 = new State(IPv4Token);

	for (let i = 0; i < groups.byte.length; i++) {
		parser.start.tt(groups.byte[i]).tt(DOT, ByteDot);
	}

	ByteDot.ta(groups.byte, ByteDotByte);
	ByteDotByte.tt(DOT).ta(groups.byte, ByteDotByteDotByte);
	ByteDotByteDotByte.tt(DOT).ta(groups.byte, IPv4);

	// If IP followed by port or slash, make URL. Get existing URL state
	const Url = parser.start.go(LOCALHOST).go(SLASH);
	IPv4.tt(SLASH, Url);

	const IPv4Colon = IPv4.tt(COLON);
	const IPv4ColonPort = new State(multi.Url);
	IPv4Colon.ta(groups.numeric, IPv4ColonPort);
	IPv4ColonPort.tt(SLASH, Url);

	// Detect IPv6 when followed by URL prefix
	const UriPrefix = parser.start.go(SLASH_SCHEME).go(COLON).go(SLASH).go(SLASH);
	const UriPrefixIPv6 = UriPrefix.tt(B_IPV6_B, multi.Url);
	UriPrefixIPv6.tt(SLASH, Url);
	const UriPrefixIPv6Colon = UriPrefixIPv6.tt(COLON);
	const UriPrefixIPv6ColonPort = new State(multi.Url);
	UriPrefixIPv6Colon.ta(groups.numeric, UriPrefixIPv6ColonPort);
	UriPrefixIPv6ColonPort.tt(SLASH, Url);
}
