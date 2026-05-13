# linkify-jquery

[![npm version](https://badge.fury.io/js/linkify-jquery.svg)](https://www.npmjs.com/package/linkify-jquery)

[Linkify](https://linkify.js.org/) jQuery plugin. Also available in vanilla JavaScript via `linkify-element`. Use it to detect URLs, email addresses and more and wrap them with anchor `<a>` tags.

## Installation

Install from the command line with NPM

```
npm install linkifyjs linkify-jquery
```

Import into your JavaScript with `require`

```js
const $ = require('jquery');
require('linkify-jquery');
```

or with ES modules

```js
import $ from 'jquery';
import 'linkify-jquery';
```

If a `window.document` global is not available in your environment, provide it manually instead as follows.

With `require`:

```js
require('linkify-jquery')($, document);
```

or with ES modules:

```js
import linkifyJq from 'linkify-jquery';
linkifyJq($, document);
```

## Usage

[Read the full documentation](https://linkify.js.org/docs/linkify-jquery.html).

## License

MIT
