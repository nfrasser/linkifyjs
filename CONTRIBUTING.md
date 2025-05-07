# Contributing

**Note:** This guide is a work in progress. Feel free to [submit an issue](https://github.com/nfrasser/linkifyjs/issues/new) if anything is confusing or unclear.

## How linkify works

<!-- TODO: Insert diagram here -->

Linkify uses a two stage lexicographical analysis to detect patterns in plain text.

The first stage, called the scanner, takes the input string and generates encompassing tokens that aggregate different types of components like domain names and TLDs. For example, substings like `http:` or `com` are converted into tokens named `PROTOCOL` and `TLD`, respectively.

The second stage, the parser, takes this array of tokens and aggregates them into complete entities that are either become links or do not. For example, the tokens `PROTOCOL`, `SLASH`, `SLASH`, `DOMAIN`, `TLD` (appearing in that order) are grouped into a `URL` entity. These groups are called multitokens.

A multitoken is either a link or not a link. Core linkify comes with these multitokens

- **`Text`** is plain text (that contains no linkable entities)
- **`Nl`** represents a single newline character
- **`Email`** email address
- **`URL`**

The latter two are converted to links. `Nl` is in some cases converted to a `<br>` HTML tag.

You can use the Token class system to [create plugins](#building-plugins).

## Style

- ES6 Syntax (except tests for now)
- Hard tabs with a width of 4 characters

Keep your changes consistent with what's already there.

## Development

### Setup

1. Install the latest LTS version of [Node.js](https://nodejs.org/) (v18 or newer)
2. Fork and clone this repository to your machine
3. Navigate to the clone folder via command-line
4. Install dependencies with NPM:
   ```sh
   npm install
   ```

### Building

Linkify is built and tested in the command line with `npm` scripts. Build tasks have the following format.

```
npm run build
```

This transpiles ES6 to ES5 (via [Babel](http://babeljs.io/)) from `src/` into `dist/`. The Node.js modules have a `.cjs` extension. The dist folder is published to [NPM](https://www.npmjs.com/). Also generates browser-ready scripts (classic globals with `.js` and `.min.js` extensions, and ES modules with `.mjs` extensions) into the `dist/` folder.

### Running tests

These tools are used for testing linkify:

- [Mocha](https://mochajs.org/) is our primary test case framework
- [ESLint](https://eslint.org) for code linting
- [Istanbul](https://istanbul.js.org/) for code coverage analysis
- [Karma](http://karma-runner.github.io/) is our browser test runner
- [BrowserStack](https://www.browserstack.com) for cross-browser testing

These are all configured to run in npm scripts. Tasks `npm test` and `npm run lint` are the most basic you can run. Other tasks include:

- `npm run build` converts the `src` ES source code into browser- and Node.js- compatible JavaScript. It also outputs TypeScript definitions.
- `npm run clean` removes all generated files
- `npm run dist` cleans, builds and copies the final browser distribution bundle into the root `dist` directory

### Building plugins

**Caution:** The plugin development API is in its very early stages and only supports very basic plugins. Updated features, APIs, and docs are in the works.

Check out the sample [Hashtag plugin](https://github.com/nfrasser/linkifyjs/blob/main/packages/linkify-plugin-hashtag/src/hashtag.js) for an example. Check out the [Keyword plugin](https://github.com/nfrasser/linkifyjs/blob/main/packages/linkify-plugin-keyword/src/keyword.js) for more advanced usage.

Register a new plugin with [`linkify.registerPlugin()`](https://linkify.js.org/docs/linkifyjs.html#linkifyregisterplugin-name-plugin).
