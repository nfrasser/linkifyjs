import * as linkify from 'linkifyjs/src/linkify.js';

/**
	Gracefully truncate a string to a given limit. Will replace extraneous
	text with a single ellipsis character (`…`).
*/
String.prototype.truncate = function (limit) {
	limit = limit || Infinity;
	return this.length > limit ? this.substring(0, limit) + '…' : this;
};

beforeEach(() => {
	linkify.reset();
});
