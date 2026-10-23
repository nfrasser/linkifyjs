import linkifyElement from 'linkify-element/src/linkify-element.mjs';
import htmlOptions from './html/options.mjs';
import { expect } from 'chai';

let doc, testContainer, JSDOM;
try {
	doc = document;
} catch (e) {
	doc = null;
}

if (!doc) {
	const jsdom = await import('jsdom');
	JSDOM = jsdom.JSDOM;
}

describe('linkify-element', () => {
	/**
		Set up the JavaScript document and the element for it
		This code allows testing on Node.js and on Browser environments
	*/
	before(function (done) {
		function onDoc(doc) {
			testContainer = doc.createElement('div');
			testContainer.id = 'linkify-element-test-container';
			doc.body.appendChild(testContainer);
			done();
		}

		if (doc) {
			return onDoc(doc);
		}

		const dom = new JSDOM('<html><head><title>Linkify Test</title></head><body></body></html>');
		doc = dom.window.document;
		onDoc(dom.window.document);
	});

	beforeEach(() => {
		// Make sure we start out with a fresh DOM every time
		testContainer.innerHTML = htmlOptions.original;
	});

	it('Has a helper function', () => {
		expect(linkifyElement.helper).to.be.a('function');
	});

	it('Works with default options', () => {
		var result = linkifyElement(testContainer, null, doc);
		expect(result).to.equal(testContainer); // should return the same element
		expect(testContainer.innerHTML).to.be.oneOf(htmlOptions.linkified);
	});

	it('Works with overriden options (general)', () => {
		var result = linkifyElement(testContainer, htmlOptions.altOptions, doc);
		expect(result).to.equal(testContainer); // should return the same element
		expect(testContainer.innerHTML).to.be.oneOf(htmlOptions.linkifiedAlt);
	});

	it('Works with overriden options (validate)', () => {
		var result = linkifyElement(testContainer, htmlOptions.validateOptions, doc);
		expect(result).to.equal(testContainer); // should return the same element
		expect(testContainer.innerHTML).to.be.oneOf(htmlOptions.linkifiedValidate);
	});

	it('Obeys ignoreElementClasses option', () => {
		testContainer.innerHTML =
			'<p class="linkify-ignore other">ignore.example.com</p>' +
			'<p class="other">link.example.com</p>';
		linkifyElement(testContainer, { ignoreElementClasses: ['linkify-ignore'] }, doc);
		expect(testContainer.innerHTML).to.equal(
			'<p class="linkify-ignore other">ignore.example.com</p>' +
			'<p class="other"><a href="http://link.example.com">link.example.com</a></p>',
		);
	});

	it('Works when there is an empty text nodes', () => {
		testContainer.appendChild(doc.createTextNode(''));
		var result = linkifyElement(testContainer, null, doc);
		expect(result).to.equal(testContainer); // should return the same element
		expect(testContainer.innerHTML).to.be.oneOf(htmlOptions.linkified);
	});
});
