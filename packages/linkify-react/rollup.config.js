import { linkifyInterface } from '../../rollup.config.js';

export default linkifyInterface('react', {
	globalName: 'Linkify',
	globals: { react: 'React' },
	external: ['react'],
});
