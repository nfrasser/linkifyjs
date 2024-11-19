// Karma CI configuration (2/2)
// The CIs are split up to prevent too many parellel launchers
const base = require('./conf');

module.exports = function (config) {
	// https://www.browserstack.com/docs/automate/api-reference/selenium/introduction#rest-api-browsers
	const customLaunchers = {
		bs_safari_sierra: {
			base: 'BrowserStack',
			browser: 'safari',
			os: 'OS X',
			os_version: 'Monterey',
		},
		bs_safari_bigsur: {
			base: 'BrowserStack',
			browser: 'safari',
			os: 'OS X',
			os_version: 'Sonoma',
		},
		bs_ios_safari: {
			base: 'BrowserStack',
			browser: 'iphone',
			os: 'ios',
			os_version: '16',
			device: 'iPhone 14',
		},
		bs_edge: {
			base: 'BrowserStack',
			browser: 'edge',
			os: 'Windows',
			os_version: '11',
		},
	};

	config.set({
		...base,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_WARN,

		browserStack: {
			project: 'linkifyjs',
			username: process.env.BROWSERSTACK_USERNAME,
			accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
			name: process.env.GITHUB_WORKFLOW,
			build: process.env.GITHUB_RUN_NUMBER,
		},

		customLaunchers,
		browsers: Object.keys(customLaunchers),
		singleRun: true,
		reporters: ['dots', 'BrowserStack'],
	});
};
