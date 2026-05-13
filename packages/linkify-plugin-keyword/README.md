# linkify-plugin-keyword

[![npm version](https://badge.fury.io/js/linkify-plugin-keyword.svg)](https://www.npmjs.com/package/linkify-plugin-keyword)

Detect and convert arbitrary keywords to `<a>` anchor tags with [Linkify](https://linkify.js.org/).

## Installation

Install from the command line with NPM

```
npm install linkifyjs linkify-plugin-keyword
```

Import into your JavaScript with `require`

```js
const linkify = require('linkifyjs');
const registerKeywords = require('linkify-plugin-keyword');
```

or with ES modules

```js
import * as linkify from 'linkifyjs';
import registerKeywords from 'linkify-plugin-keyword';
```

## Usage

```js
registerKeywords(['foo', 'bar', 'baz']);
linkify.find('Any foo keywords here?');
```

[Read the full documentation](https://linkify.js.org/docs/plugin-keyword.html).

## License

MIT
