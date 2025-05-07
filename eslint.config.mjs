import mocha from 'eslint-plugin-mocha';
import babel from '@babel/eslint-plugin';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';
import js from '@eslint/js';

export default [
	js.configs.recommended,
	mocha.configs.recommended,
	{
		ignores: [
			'**/.DS_Store',
			'**/_sass',
			'**/_site',
			'**/coverage',
			'dist/*',
			'**/node_modules',
			'**/package-lock.json',
			'packages/*/dist/*',
			'**/.env',
			'**/.env.*',
			'!**/.env.example',
		],
	},
	{
		plugins: {
			'@babel': babel,
		},

		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...globals.jquery,
				...globals.amd,
				...globals.mocha,
				__base: false,
				expect: false,
			},

			parser: babelParser,
			ecmaVersion: 6,
			sourceType: 'module',

			parserOptions: {
				requireConfigFile: false,
			},
		},

		rules: {
			curly: 2,
			eqeqeq: ['error', 'smart'],
			quotes: [2, 'single', 'avoid-escape'],
			semi: 2,

			'no-unused-vars': [
				'error',
				{
					caughtErrors: 'none',
					varsIgnorePattern: 'should|expect',
				},
			],

			'mocha/no-mocha-arrows': 0,
		},
	},
];
