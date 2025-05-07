import terser from '@rollup/plugin-terser';
import { plugins } from '../../rollup.config.js';

export default [
	{
		input: 'src/linkify.mjs',
		output: [
			{ file: 'dist/linkify.js', name: 'linkify', format: 'iife' },
			{ file: 'dist/linkify.min.js', name: 'linkify', format: 'iife', plugins: [terser()] },
			{ file: 'dist/linkify.cjs', format: 'cjs', exports: 'auto' },
			{ file: 'dist/linkify.mjs', format: 'es' },
		],
		plugins,
	},
];
