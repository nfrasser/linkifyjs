// Karma Chrome configuration
// Just opens Google Chrome for testing

const base = require('./conf');

module.exports = function (config) {
	config.set({
		...base,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,
		browsers: ['Chrome'],
	});
};
