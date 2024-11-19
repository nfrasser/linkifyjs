---
layout: docv3
title: "#Hashtag plugin · Documentation"
toc: true
---

# Linkify #Hashtag Plugin

Adds basic support for #-hashtags.

## Installation

### Node.js module

Install from the command line with NPM

```
npm install linkifyjs linkify-plugin-hashtag
```

```js
const linkify = require("linkifyjs");
require("linkify-plugin-hashtag");
```

or with ES6 modules

```js
import * as linkify from "linkifyjs";
import "linkify-plugin-hashtag";
```

### Browser globals

[Download linkify](https://github.com/{{ site.github_username }}/releases/download/v{{ site.version }}/linkifyjs.zip)
and extract the contents into your website's assets directory.
Include the following scripts in your HTML:

```html
<script src="linkify.js"></script>
<script src="linkify-plugin-hashtag.js"></script>
```

## Usage

Use the `formatHref` option with your preferred [interface](interfaces.html) to
correctly resolve a hashtag. Example linking to social media hashtags with
`linkifyHtml`:

```jsx
const options = {
  formatHref: {
    hashtag: (href) => "https://bsky.app/hashtag/" + href.substr(1),
  },
};

// With linkify-html
linkifyHtml("Works with hashtags #PhotoOfTheDay or #일상", options);

// With linkify-react
<Linkify options={options}>
  Works with hashtags #PhotoOfTheDay or #일상
</Linkify>;
```

The last line returns the following string:

```js
'Works with hashtags <a href="https://bsky.app/hashtag/PhotoOfTheDay">#PhotoOfTheDay</a> or <a href="https://bsky.app/hashtag/일상">#일상</a>';
```
