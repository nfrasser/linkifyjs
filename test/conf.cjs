// const fs = require('fs');

// React path may vary depending on version
// const reactPath = fs.existsSync('node_modules/react/dist/react.min.js') ? 'dist/react' : 'umd/react.production';
// const reactDomPath = fs.existsSync('node_modules/react-dom/dist/react-dom.min.js')
// 	? 'dist/react-dom'
// 	: 'umd/react-dom.production';

module.exports = {
	// base path that will be used to resolve all patterns (eg. files, exclude)
	basePath: __dirname.replace(/\/?test\/?$/, '/'),

	// frameworks to use
	// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
	frameworks: ['qunit'],

	// list of files / patterns to load in the browser
	files: [
		{ pattern: 'node_modules/jquery/dist/jquery.js', watched: false },
		'test/qunit/vendor/react.min.js',
		'test/qunit/vendor/react-dom.min.js',
		'dist/linkify.min.js',
		// 'dist/linkify.js', // Uncompressed
		'dist/*.min.js',
		'test/qunit/globals.js',
		'test/qunit/main.js',
	],

	// QUnit configuration
	client: {
		clearContext: false,
		qunit: {
			showUI: true,
		},
	},

	// preprocess matching files before serving them to the browser
	// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
	preprocessors: {},

	// test results reporter to use
	// possible values: 'dots', 'progress'
	// available reporters: https://npmjs.org/browse/keyword/karma-reporter
	reporters: ['dots'],

	// web server port
	port: 9876,

	// enable / disable colors in the output (reporters and logs)
	colors: true,

	// enable / disable watching file and executing tests whenever any file changes
	autoWatch: true,

	// Continuous Integration mode
	// if true, Karma captures browsers, runs the tests and exits
	singleRun: false,
};
