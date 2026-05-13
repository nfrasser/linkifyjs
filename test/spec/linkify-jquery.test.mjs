import applyLinkify from 'linkify-jquery/src/linkify-jquery.mjs';
import htmlOptions from './html/options.mjs';
import { expect } from 'chai';
let $, doc, testContainer;

try {
	// Browser environment (e.g. Browserify): use existing document and require jQuery
	doc = document;
	$ = require('jquery');
} catch (e) {
	doc = null;
	$ = null;
}

describe('linkify-jquery', function () {
	this.timeout(10000);

	/**
		Set up the JavaScript document and the element for it
		This code allows testing on Node.js and on Browser environments
	*/
	before(async function () {
		if (!doc) {
			// Node.js environment: use jsdom + jQuery 4 factory
			const { JSDOM } = await import('jsdom');
			const { jQueryFactory } = await import('jquery/factory');
			const dom = new JSDOM('<html><head><title>Linkify Test</title></head><body></body></html>');
			doc = dom.window.document;
			$ = jQueryFactory(dom.window);
		}

		doc.body.innerHTML = htmlOptions.extra;

		// Add the linkify plugin to jQuery
		applyLinkify($, doc);

		// Wait for jQuery's async ready callbacks to finish.
		// applyLinkify registers data-linkify processing via $(function(){…});
		// since the jsdom document is already complete when jQuery initialises,
		// those callbacks are queued as microtasks. Awaiting a new $(fn) promise
		// (which is appended after them) ensures they have all run first.
		await new Promise((resolve) => $(resolve));

		testContainer = doc.createElement('div');
		testContainer.id = 'linkify-jquery-test-container';
		doc.body.appendChild(testContainer);
	});

	// Make sure we start out with a fresh DOM every time
	beforeEach(() => (testContainer.innerHTML = htmlOptions.original));

	it('Works with the DOM Data API', () => {
		expect($('header').first().html()).to.be.eql('Have a link to:<br><a href="https://github.com">github.com</a>!');
		expect($('#linkify-test-div').html()).to.be.eql(
			'Another <i href="mailto:test@gmail.com" class="test-class" ' +
				'target="_parent">test@gmail.com</i> email as well as a <i ' +
				'href="http://t.co" class="test-class" target="_parent">' +
				'http://t.co</i> link.',
		);
	});

	it('Works with default options', () => {
		var $container = $('#linkify-jquery-test-container');
		expect($container.length).to.be.eql(1);
		var result = $container.linkify();
		// `should` is not defined on jQuery objects
		expect(result === $container).to.be.ok; // should return the same element
		expect($container.html()).to.be.oneOf(htmlOptions.linkified);
	});

	it('Works with overriden options (general)', () => {
		var $container = $('#linkify-jquery-test-container');
		expect($container.length).to.be.eql(1);
		var result = $container.linkify(htmlOptions.altOptions);
		// `should` is not defined on jQuery objects
		expect(result === $container).to.be.ok; // should return the same element
		expect($container.html()).to.be.oneOf(htmlOptions.linkifiedAlt);
	});

	it('Works with overriden options (validate)', () => {
		var $container = $('#linkify-jquery-test-container');
		expect($container.length).to.be.eql(1);
		var result = $container.linkify(htmlOptions.validateOptions);
		// `should` is not defined on jQuery objects
		expect(result === $container).to.be.ok; // should return the same element
		expect($container.html()).to.be.oneOf(htmlOptions.linkifiedValidate);
	});
});
