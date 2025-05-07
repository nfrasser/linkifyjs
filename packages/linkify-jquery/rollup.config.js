import { linkifyInterface } from '../../rollup.config.js';

export default linkifyInterface('jquery', {
	globalName: false,
	globals: { jquery: 'jQuery' },
	external: ['jquery'],
});
