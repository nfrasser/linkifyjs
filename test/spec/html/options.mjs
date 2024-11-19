// HTML to use with linkify-element and linkify-jquery
import fs from 'fs';
export default {
	original: fs.readFileSync('test/spec/html/original.html', 'utf8').trim(),

	// These are split into arrays by line, where each line represents a
	// different attribute ordering (based on the rendering engine)
	// Each line is semantically identical.
	linkified: fs.readFileSync('test/spec/html/linkified.html', 'utf8').trim().split('\n'),
	linkifiedAlt: fs.readFileSync('test/spec/html/linkified-alt.html', 'utf8').trim().split('\n'),
	linkifiedValidate: fs.readFileSync('test/spec/html/linkified-validate.html', 'utf8').trim().split('\n'),

	extra: fs.readFileSync('test/spec/html/extra.html', 'utf8').trim(), // for jQuery plugin tests
	email: fs.readFileSync('test/spec/html/email.html', 'utf8').trim(), // for linkify-html performance tests
	altOptions: {
		className: 'linkified',
		rel: 'nofollow',
		target: '_blank',
		attributes: {
			type: 'text/html',
		},
		events: {
			click: function () {
				throw 'Clicked!';
			},
			mouseover: function () {
				throw 'Hovered!';
			},
		},
		ignoreTags: ['script', 'style'],
	},

	validateOptions: {
		validate: {
			url: function (text) {
				return /^(http|ftp)s?:\/\//.test(text) || text.slice(0, 3) === 'www';
			},
		},
	},
};
