// Karma CI configuration (1/2)
// The CIs are split up to prevent too many parellel launchers
const base = require('./conf.cjs');

module.exports = function (config) {
	// https://www.browserstack.com/docs/automate/api-reference/selenium/introduction#rest-api-browsers
	const customLaunchers = {
		bs_firefox_windows: {
			base: 'BrowserStack',
			browser: 'firefox',
			os: 'Windows',
			os_version: '11',
		},
		bs_chrome_windows: {
			base: 'BrowserStack',
			browser: 'chrome',
			os: 'Windows',
			os_version: '11',
		},
		bs_edge_windows: {
			base: 'BrowserStack',
			browser: 'edge',
			os: 'Windows',
			os_version: '11',
		},
		bs_android_14: {
			base: 'BrowserStack',
			os: 'android',
			os_version: '14.0',
			browser: 'android',
			device: 'Google Pixel 8',
		},
		bs_android_12: {
			base: 'BrowserStack',
			os: 'android',
			os_version: '12.0',
			browser: 'android',
			device: 'Google Pixel 6',
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
