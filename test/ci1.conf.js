// Karma CI configuration (1/2)
// The CIs are split up to prevent too many parellel launchers
const base = require('./conf');

module.exports = function (config) {
	// https://www.browserstack.com/docs/automate/api-reference/selenium/introduction#rest-api-browsers
	const customLaunchers = {
		bs_chrome_mac: {
			base: 'BrowserStack',
			browser: 'chrome',
			os: 'OS X',
			os_version: 'Ventura',
		},
		bs_chrome_windows: {
			base: 'BrowserStack',
			browser: 'chrome',
			os: 'Windows',
			os_version: '10',
		},
		bs_firefox_windows: {
			base: 'BrowserStack',
			browser: 'firefox',
			os: 'Windows',
			os_version: '10',
		},
		bs_android_8: {
			base: 'BrowserStack',
			os: 'android',
			os_version: '9.0',
			browser: 'android',
			device: 'Google Pixel 3',
		},
		bs_android_11: {
			base: 'BrowserStack',
			os: 'android',
			os_version: '11.0',
			browser: 'android',
			device: 'Google Pixel 5',
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
