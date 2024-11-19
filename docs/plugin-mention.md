---
layout: docv3
title: "@Mention plugin · Documentation"
toc: true
---

# Linkify @Mention Plugin

Adds basic support for @-mentions.

## Installation

### Node.js module

Install from the command line with NPM

```
npm install linkifyjs linkify-plugin-mention
```

```js
const linkify = require("linkifyjs");
require("linkify-plugin-mention");
```

or with ES6 modules

```js
import * as linkify from "linkifyjs";
import "linkify-plugin-mention";
```

### Browser globals

[Download linkify](https://github.com/{{ site.github_username }}/releases/download/v{{ site.version }}/linkifyjs.zip)
and extract the contents into your website's assets directory.
Include the following scripts in your HTML:

```html
<script src="linkify.js"></script>
<script src="linkify-plugin-mention.js"></script>
```

## Usage

With @-mentions enabled, strings such as `@username` are replaced with `<a href="/username">@username</a>`. **If this formatting works for your website, no
additional options are required.**

If you have different username path requirements, use the `formatHref` option
with your preferred [interface](interfaces.html) to correctly resolve a mention.
Example linking to a user account on a website where accounts are located at
`https://example.com/profiles/<username>`

```jsx
const options = {
  formatHref: {
    mention: (href) => "https://example.com/profiles" + href,
  },
};

// With linkify-html
linkifyHtml("Check out @cryoem-uoft and @nfrasser", options);

// With linkify-react
<Linkify options={options}>Check out @cryoem-uoft and @nfrasser</Linkify>;
```

The last line returns the following string:

```js
'Check out <a href="https://example.com/profiles/cryoem-uoft">@cryoem-uoft</a> and <a href="https://example.com/profiles/nfrasser">@nfrasser</a>';
```
