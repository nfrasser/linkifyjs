/* global QUnit */
/* global w */

/**
	Linkify basic global tests
*/
QUnit.assert.oneOf = function (value, possibleExpected, message) {
	message = message || 'Expected ' + value + ' to be contained in ' + possibleExpected + '.';
	var result = false;
	for (var i = 0; i < possibleExpected.length; i++) {
		if (value === possibleExpected[i]) {
			result = true;
			break;
		}
	}
	this.pushResult({
		result: result,
		actual: value,
		expected: possibleExpected[i - 1],
		message: message,
	});
};

QUnit.module('linkify');

QUnit.test('exists in window', function (assert) {
	assert.ok('linkify' in w);
});

QUnit.test('contains find function', function (assert) {
	assert.ok('find' in w.linkify);
	assert.equal(typeof w.linkify.find, 'function');
});

QUnit.test('contains test function', function (assert) {
	assert.ok('test' in w.linkify);
	assert.equal(typeof w.linkify.test, 'function');
});

QUnit.test('contains tokenize function', function (assert) {
	assert.ok('tokenize' in w.linkify);
	assert.equal(typeof w.linkify.tokenize, 'function');
});

QUnit.test('contains an options object', function (assert) {
	assert.ok('options' in w.linkify);
	assert.equal(typeof w.linkify.options, 'object');
});

QUnit.module('linkify.find');

QUnit.test('linkify.find correctly finds a URL', function (assert) {
	var result = w.linkify.find('The url is github.com');
	assert.equal(result.length, 1);
	assert.equal(result[0].type, 'url');
	assert.equal(result[0].value, 'github.com');
	assert.equal(result[0].href, 'http://github.com');
});

QUnit.test('linkify.find correctly finds an email address', function (assert) {
	var result = w.linkify.find('The url is github.com and the email is test@example.com', 'email');
	assert.equal(result.length, 1);
	assert.equal(result[0].type, 'email');
	assert.equal(result[0].value, 'test@example.com');
	assert.equal(result[0].href, 'mailto:test@example.com');
});

QUnit.module('linkify.test');

QUnit.test('correctly identifies a URL as a link', function (assert) {
	assert.ok(w.linkify.test('github.com'));
});

QUnit.test('correctly identifies a URL as NOT an email', function (assert) {
	assert.notOk(w.linkify.test('github.com', 'email'));
});

QUnit.test('correctly identifies text as not an email', function (assert) {
	assert.notOk(w.linkify.test('gobbledegook'));
});

QUnit.module('linkify.options');

QUnit.test('contains defaults object', function (assert) {
	assert.ok('defaults' in w.linkify.options);
	assert.equal(typeof w.linkify.options.defaults, 'object');
});

QUnit.test('contains Options class', function (assert) {
	assert.ok('Options' in w.linkify.options);
	assert.equal(typeof w.linkify.options.Options, 'function');
});

QUnit.module('linkify.options.Options');

QUnit.test('returns object of default options when given an empty object', function (assert) {
	var result = new w.linkify.options.Options({});

	assert.equal(typeof result.get('format'), 'function');
	assert.equal(typeof result.get('validate'), 'boolean');
	assert.equal(result.get('format')('test'), 'test');
	assert.equal(typeof result.get('formatHref'), 'function');
	assert.equal(result.get('formatHref')('test'), 'test');
	assert.equal(result.get('target'), null);
	assert.equal(result.get('rel'), null);
});

QUnit.module('linkify-plugin-hashtag');

QUnit.test('finds valid hashtags', function (assert) {
	var result = w.linkify.find('#urls are #awesome2015');
	assert.deepEqual(result, [
		{
			type: 'hashtag',
			value: '#urls',
			href: '#urls',
			isLink: true,
			start: 0,
			end: 5,
		},
		{
			type: 'hashtag',
			value: '#awesome2015',
			href: '#awesome2015',
			isLink: true,
			start: 10,
			end: 22,
		},
	]);
});

QUnit.module('linkify-plugin-mention');

QUnit.test('finds valid mentions', function (assert) {
	var result = w.linkify.find('Hey @foo say hello to @bar!');
	assert.deepEqual(result, [
		{
			type: 'mention',
			value: '@foo',
			href: '/foo',
			isLink: true,
			start: 4,
			end: 8,
		},
		{
			type: 'mention',
			value: '@bar',
			href: '/bar',
			isLink: true,
			start: 22,
			end: 26,
		},
	]);
});

QUnit.module('linkify-plugin-ticket');

QUnit.test('finds valid tickets', function (assert) {
	var result = w.linkify.find('Please see issue #42!');
	assert.deepEqual(result, [
		{
			type: 'ticket',
			value: '#42',
			href: '#42',
			isLink: true,
			start: 17,
			end: 20,
		},
	]);
});

// HTML rendered in body
var originalHtml =
	'Hello here are some links to ftp://awesome.com/?where=this and localhost:8080, pretty neat right? <p>Here is a nested github.com/Hypercontext/linkifyjs paragraph</p>';

// Possible results with regular settings (will vary by browser)
var linkifiedHtml = [
	'Hello here are some links to <a href="ftp://awesome.com/?where=this">ftp://awesome.com/?where=this</a> and <a href="http://localhost:8080">localhost:8080</a>, pretty neat right? <p>Here is a nested <a href="http://github.com/Hypercontext/linkifyjs">github.com/Hypercontext/linkifyjs</a> paragraph</p>',
];

// Possible results with overriden settings
var linkifiedHtmlAlt = [
	'Hello here are some links to <a href="ftp://awesome.com/?where=this" rel="nofollow">ftp://awesome.com/?where=this</a> and <a href="http://localhost:8080" rel="nofollow">localhost:8080</a>, pretty neat right? <p>Here is a nested <a href="http://github.com/Hypercontext/linkifyjs" rel="nofollow">github.com/Hypercontext/linkifyjs</a> paragraph</p>',
	'Hello here are some links to <a rel="nofollow" href="ftp://awesome.com/?where=this">ftp://awesome.com/?where=t fhis</a> and <a rel="nofollow" href="http://localhost:8080">localhost:8080</a>, pretty neat right? <p>Here is a nested <a rel="nofollow" href="http://github.com/Hypercontext/linkifyjs">github.com/Hypercontext/linkifyjs</a> paragraph</p>',
	'Hello here are some links to <a href="ftp://awesome.com/?where=this" rel="nofollow">ftp://awesome.com/?where=this</a> and <a href="http://localhost:8080" rel="nofollow">localhost:8080</a>, pretty neat right? <p>Here is a nested <a href="http://github.com/Hypercontext/linkifyjs" rel="nofollow">github.com/Hypercontext/linkifyjs</a> paragraph</p>',
	'Hello here are some links to <a href="ftp://awesome.com/?where=this" rel="nofollow">ftp://awesome.com/?where=this</a> and <a href="http://localhost:8080" rel="nofollow">localhost:8080</a>, pretty neat right? <p>Here is a nested <a href="http://github.com/Hypercontext/linkifyjs" rel="nofollow">github.com/Hypercontext/linkifyjs</a> paragraph</p>',
];

QUnit.module('linkify-jquery', {
	beforeEach: function () {
		var $elem = jQuery('<div id="linkify-test-elem"/>');
		$elem.html(originalHtml);
		jQuery('body').append($elem);
	},
	afterEach: function () {
		jQuery('#linkify-test-elem').remove();
	},
});

QUnit.test('jQuery plugin exists', function (assert) {
	assert.ok('linkify' in jQuery.fn);
	assert.equal(typeof jQuery.fn.linkify, 'function');
});

QUnit.test('works with default options', function (assert) {
	var $elem = jQuery('#linkify-test-elem').linkify();
	assert.oneOf($elem.html(), linkifiedHtml);
});

QUnit.test('works with overriden options', function (assert) {
	var $elem = jQuery('#linkify-test-elem').linkify({
		attributes: {
			rel: 'nofollow',
		},
	});
	assert.oneOf($elem.html(), linkifiedHtmlAlt);
});

QUnit.module('linkify-element', {
	beforeEach: function () {
		var $elem = jQuery('<div id="linkify-test-elem"/>');
		$elem.html(originalHtml);
		jQuery('body').append($elem);
	},
	afterEach: function () {
		jQuery('#linkify-test-elem').remove();
	},
});

QUnit.test('linkifyElement exists', function (assert) {
	assert.ok('linkifyElement' in w);
	assert.equal(typeof w.linkifyElement, 'function');
});

QUnit.test('works with default options', function (assert) {
	var elem = document.getElementById('linkify-test-elem');
	w.linkifyElement(elem);
	assert.oneOf(jQuery(elem).html(), linkifiedHtml);
});

QUnit.test('works with overriden options', function (assert) {
	var elem = document.getElementById('linkify-test-elem');
	w.linkifyElement(elem, {
		attributes: {
			rel: 'nofollow',
		},
	});
	assert.oneOf(jQuery(elem).html(), linkifiedHtmlAlt);
});

QUnit.module('linkify-html');

QUnit.test('linkifyHtml exists', function (assert) {
	assert.ok('linkifyHtml' in w);
	assert.equal(typeof w.linkifyHtml, 'function');
});

QUnit.test('works with default options', function (assert) {
	var result = w.linkifyHtml(originalHtml);
	assert.equal(result, linkifiedHtml[0]);
});

QUnit.test('works with overriden options', function (assert) {
	var result = w.linkifyHtml(originalHtml, {
		attributes: {
			rel: 'nofollow',
		},
	});
	assert.equal(result, linkifiedHtmlAlt[0]);
});

QUnit.module('linkify-string');

QUnit.test('linkifyStr exists', function (assert) {
	assert.ok('linkifyStr' in w);
	assert.equal(typeof w.linkifyStr, 'function');
});

QUnit.test('works with default options', function (assert) {
	var result = w.linkifyStr('google.ca and me@gmail.com');
	assert.equal(result, '<a href="http://google.ca">google.ca</a> and <a href="mailto:me@gmail.com">me@gmail.com</a>');
});

QUnit.test('works with overriden options', function (assert) {
	var result = w.linkifyStr('google.ca and me@gmail.com', {
		attributes: {
			rel: 'nofollow',
		},
	});
	assert.equal(
		result,
		'<a href="http://google.ca" rel="nofollow">google.ca</a> and <a href="mailto:me@gmail.com" rel="nofollow">me@gmail.com</a>',
	);
});

// React does not officially support IE8
// https://facebook.github.io/react/docs/working-with-the-browser.html#browser-support

QUnit.module('linkify-react');

QUnit.test('class exists', function (assert) {
	assert.ok('Linkify' in w);
	assert.equal(typeof w.Linkify, 'function');
});

QUnit.test('can be used to create valid components', function (assert) {
	var linkified = w.React.createElement(w.Linkify, null, 'github.com');
	assert.ok(w.React.isValidElement(linkified));
});

QUnit.test('renders into a DOM element', function (assert) {
	var linkified = w.React.createElement(
		w.Linkify,
		{ tagName: 'em' },
		'A few links are github.com and google.com and ',
		w.React.createElement('strong', { className: 'pi' }, 'https://amazon.ca'),
	);
	var container = document.createElement('div');
	document.body.appendChild(container);

	// React 16+ requires a container to be passed to render
	w.ReactDOM.render(w.React.createElement('p', null, linkified), container);

	assert.ok(container.innerHTML.indexOf('<em') > 0);
	assert.ok(container.innerHTML.indexOf('class="pi"') > 0);
	assert.ok(container.innerHTML.indexOf('href="http://github.com"') > 0);
	assert.ok(container.innerHTML.indexOf('href="http://google.com"') > 0);
	assert.ok(container.innerHTML.indexOf('href="https://amazon.ca"') > 0);
});
