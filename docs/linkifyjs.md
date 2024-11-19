---
layout: docv3
title: Core linkify · Documentation
toc: true
---

# Core Linkify

## Installation

### Node.js module

Install from the command line with NPM

```
npm install linkifyjs
```

Import into your JavaScript with `require`

```js
const linkify = require("linkifyjs");
```

or with ES modules

```js
import * as linkify from "linkifyjs";
```

### Browser globals

[Download linkify](https://github.com/{{ site.github_username }}/releases/download/v{{ site.version }}/linkifyjs.zip)
and extract the contents into your website's assets directory.
Include the following script in your HTML:

```html
<script src="linkify.js"></script>
```

## Methods

### linkify.find _(str [, type = null] [, opts = null])_

Finds all links in the given string

**Params**

- _`string`_ **`str`** Search string
- _`string`_ [**`type`**] only find links of the given type
- _`Object`_ [**`opts`**] [Link formatting options](options.html)

**Returns** _`Array`_ List of links where each element is an object with the
following properties:

- **type** is the type of entity found. Possible values are
  - `'url'`
  - `'email'`
  - `'hashtag'` (with Hashtag plugin)
  - `'mention'` (with Mention plugin)
  - `'ticket'` (with Ticket plugin)
  - `'ipv4'` (with IP plugin)
  - `'keyword'` (with Keyword plugin)
- **value** is the original entity substring.
- **href** is the value of this link's `href` attribute.
- **start** is the index of the link's first character in the given string
- **end** is the index after link's last character in the given string

```js
linkify.find("For help with GitHub.com, please email support@github.com");
```

Returns the following array

```js
[
  {
    type: "url",
    value: "GitHub.com",
    isLink: true,
    href: "http://GitHub.com",
    start: 14,
    end: 24,
  },
  {
    type: "email",
    value: "support@github.com",
    isLink: true,
    href: "mailto:support@github.com",
    start: 39,
    end: 57,
  },
];
```

If the second argument is an object, it will be interpreted as `opts` with
options, not as `type`.

### linkify.init()

**Avoid calling this manually.** `init()` runs automatically before invoking
linkify for the first time. Must be manually called after any plugins or custom
plugins get registered after the first invokation.

To avoid calling manually, register any plugins or protocols _before_ finding links:

```js
import * as linkify from "linkifyjs";
import linkifyStr from "linkify-string";
import "linkify-plugin-hashtag";

linkify.registerCustomProtocol("fb");
linkify.registerPlugin("my-custom-plugin", () => {});

linkifyStr("Hello World.com!"); // init() called automatically here on first invocation

// If registering new protocols or plugins *here*, call linkify.init() immediately after
```

### linkify.registerCustomProtocol _(scheme [, optionalSlashSlash = false])_

Call this before invoking linkify for the first time. Linkify will consider any
string that begins with the given scheme followed by a `:` as a URL link.

**Params**

- _`string`_ **`scheme`** The scheme. May only contain characters `a-z` and `-` (hyphens)
- _`boolean`_ [**`optionalSlashSlash`**] If true, allows links that begin with `scheme:`, not just `scheme://`

```js
linkify.registerCustomProtocol("fb"); // now recognizes links such as fb://feed
linkify.registerCustomProtocol("instagram", true); // now recognizes links such as instagram:account
```

### linkify.registerPlugin _(name, plugin)_

Register a custom plugin for detecting one or more new kinds of links. Call this
before invoking linkify for the first time.

**Params**

- _`string`_ **`name`** unique name of the plugin to register
  • *`Function`* **`plugin`** plugin implementation function

**Caution:** The plugin development API is in its very early stages and only supports very basic plugins. Updated features, APIs, and docs are in progress.

Check out the sample [Hashtag plugin](https://github.com/mfrasser/linkifyjs/blob/main/packages/linkify-plugin-hashtag/src/hashtag.js) for an example. Check out the [Keyword plugin](https://github.com/nfrasser/linkifyjs/blob/main/packages/linkify-plugin-keyword/src/keyword.js) for more advanced usage.

### linkify.test _(str [, type])_

Is the given string a link? Note that linkify is not 100% spec compliant, so this function may return some false positives or false negatives. If this method does not return the expected result for a specific input, [please report an issue](https://github.com/{{ site.github_username }}/issues).

**Params**

- _`string`_ **`str`** Test string
- _`string`_ [**`type`**] returns `true` only if the link is of the given type (see `linkify.find`),

**Returns** _`Boolean`_

```js
linkify.test("google.com"); // true
linkify.test("google.com", "email"); // false
```

### linkify.tokenize _(str)_

Internal method that parses the given string into a generic token entity array.
Used by linkify's interfaces.

**Params**

- _`string`_ **`str`**

**Returns** _`Array`_
