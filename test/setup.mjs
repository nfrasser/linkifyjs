import * as linkify from 'linkifyjs/src/linkify.mjs';

/**
	Gracefully truncate a string to a given limit. Will replace extraneous
	text with a single ellipsis character (`…`).
*/
String.prototype.truncate = function (limit) {
	limit = limit || Infinity;
	return this.length > limit ? this.substring(0, limit) + '…' : this;
};

// eslint-disable-next-line mocha/no-top-level-hooks
beforeEach(() => {
	linkify.reset();
});
