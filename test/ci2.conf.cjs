// Karma CI configuration (2/2)
// The CIs are split up to prevent too many parellel launchers
const base = require('./conf.cjs');

module.exports = function (config) {
	// https://www.browserstack.com/docs/automate/api-reference/selenium/introduction#rest-api-browsers
	const customLaunchers = {
		bs_safari_ventura: {
			base: 'BrowserStack',
			browser: 'safari',
			os: 'OS X',
			os_version: 'Ventura',
		},
		bs_safari_sonoma: {
			base: 'BrowserStack',
			browser: 'safari',
			os: 'OS X',
			os_version: 'Sonoma',
		},
		bs_safari_ios_17: {
			base: 'BrowserStack',
			browser: 'iphone',
			os: 'ios',
			os_version: '17',
			device: 'iPhone 15',
		},
		bs_safari_ios_26: {
			base: 'BrowserStack',
			browser: 'iphone',
			os: 'ios',
			os_version: '26',
			device: 'iPhone 17',
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
