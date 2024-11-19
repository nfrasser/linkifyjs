import jQuery from 'jquery';
import linkifyElement from 'linkify-element';

// Applies the plugin to jQuery
/**
 *
 * @param {any} $ the global jQuery object
 * @param {Document} [doc] (optional) browser document implementation
 * @returns
 */
export default function apply($, doc = false) {

	$.fn = $.fn || {};
	if (typeof $.fn.linkify === 'function') {
		// Already applied
		return;
	}

	try {
		doc = doc || document || (window && window.document) || global && global.document;
	} catch (e) { /* do nothing for now */ }

	if (!doc) {
		throw new Error(
			'Cannot find document implementation. ' +
			'If you are in a non-browser environment like Node.js, ' +
			'pass the document implementation as the second argument to linkify-jquery'
		);
	}

	function jqLinkify(opts) {
		const options = linkifyElement.normalize(opts, doc);
		return this.each(function () {
			linkifyElement.helper(this, options, doc);
		});
	}

	$.fn.linkify = jqLinkify;

	$(function () {
		$('[data-linkify]').each(function () {
			const $this = $(this);
			const data = $this.data();
			const target = data.linkify;
			const nl2br = data.linkifyNl2br;

			const opts = {
				nl2br: !!nl2br && nl2br !== 0 && nl2br !== 'false'
			};

			if ('linkifyAttributes' in data) {
				opts.attributes = data.linkifyAttributes;
			}

			if ('linkifyDefaultProtocol' in data) {
				opts.defaultProtocol = data.linkifyDefaultProtocol;
			}

			if ('linkifyEvents' in data) {
				opts.events = data.linkifyEvents;
			}

			if ('linkifyFormat' in data) {
				opts.format = data.linkifyFormat;
			}

			if ('linkifyFormatHref' in data) {
				opts.formatHref = data.linkifyFormatHref;
			}

			if ('linkifyTagname' in data) {
				opts.tagName = data.linkifyTagname;
			}

			if ('linkifyTarget' in data) {
				opts.target = data.linkifyTarget;
			}

			if ('linkifyRel' in data) {
				opts.rel = data.linkifyRel;
			}

			if ('linkifyValidate' in data) {
				opts.validate = data.linkifyValidate;
			}

			if ('linkifyIgnoreTags' in data) {
				opts.ignoreTags = data.linkifyIgnoreTags;
			}

			if ('linkifyClassName' in data) {
				opts.className = data.linkifyClassName;
			}

			const $target = target === 'this' ? $this : $this.find(target);
			$target.linkify(opts);
		});
	});
}

// Try applying to the globally-defined jQuery element, if possible
try { apply(jQuery); } catch (e) { /**/ }

// Try assigning linkifyElement to the browser scope
try { window.linkifyElement = linkifyElement; } catch (e) { /**/ }
