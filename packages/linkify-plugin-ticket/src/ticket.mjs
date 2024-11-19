import { createTokenClass, State } from 'linkifyjs';

const TicketToken = createTokenClass('ticket', { isLink: true });

/**
 * @type {import('linkifyjs').Plugin}
 */
export default function ticket({ scanner, parser }) {
	// TODO: Add cross-repo style tickets? e.g., Hypercontext/linkifyjs#42
	// Is that even feasible?
	const { POUND, groups } = scanner.tokens;

	const Hash = parser.start.tt(POUND);
	const Ticket = new State(TicketToken);
	Hash.ta(groups.numeric, Ticket);
}
