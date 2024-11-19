---
layout: docv3
title: Plugins · Documentation
toc: true
---

# Plugins

Plugins provide no new interfaces but add additional detection functionality to
Linkify. A custom plugin API is currently in the works.

Plugins are available for the following link types:

- ["#" hashtags](plugin-hashtag.html)
- ["@" Mentions](plugin-mention.html)
- [GitHub-style ticket/issue numbers](plugin-ticket.html)
- [IP Addresses](plugin-ip.html)
- [Arbitrary keywords](plugin-keyword.html)

## General Installation

In the following instructions, substitute `[PLUGIN]` with the plugin you wish to
install, e.g., `hashtag`, `mention` or `ticket`.

### Node.js module

Install from the command line with NPM

```
npm install linkifyjs linkify-plugin-[PLUGIN]
```

```js
const linkify = require("linkifyjs");
require("linkify-plugin-[PLUGIN]");
```

or with ES6 modules

```js
import * as linkify from "linkifyjs";
import "linkify-plugin-[PLUGIN]";
```

### Browser globals

[Download linkify](https://github.com/{{ site.github_username }}/releases/download/v{{ site.version }}/linkifyjs.zip)
and extract the contents into your website's assets directory.
Include the following scripts in your HTML:

```html
<script src="linkify.js"></script>
<script src="linkify-plugin-[PLUGIN].js"></script>
```
