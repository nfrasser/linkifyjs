---
layout: docv3
title: Options · Documentation
toc: true
---

# Options

Use Linkify options to customize the resulting output. All Linkify interfaces
accept an options object. Usage depends on the the interface, as follows:

```js
const options = {
  /* ... */
};
linkifyStr(str, options); // or `str.linkify(options)`
linkifyHtml(str, options);
linkifyElement(document.getElementById("id"), options);
$("...").linkify(options);
React.createElement(Linkify, { options: options }, str);
```

Linkify uses the following default options. Below is a description of
each.

```js
linkify.options.defaults = {
  attributes: null,
  className: null,
  defaultProtocol: "http",
  events: null,
  format: (value, type) => value,
  formatHref: (href, type) => href,
  ignoreTags: [],
  nl2br: false,
  rel: null,
  render: null,
  tagName: "a",
  target: null,
  truncate: Infinity,
  validate: true,
};
```

These defaults are stored at `linkify.options.defaults` may be set globally from
there.

<div class="alert alert-warning">
  <strong>Warning:</strong> Use default overrides sparingly. If you cannot
  guarantee that you are linkify's only consumer, don't override the defaults.
</div>

## `attributes`

- **Type**: `Object | (href: string, type: string, token: MultiToken) => Object`
- **Default**: `null`

Object of attributes to add to each new link. **Note:** the
[`class`](#classname), [`target`](#target) and [`rel`](#rel) attributes have
dedicated options.

Also accepts a function that takes the unformatted href, the link type (e.g.,
`'url'`, `'email'`, etc.) and returns the object.

```js
"github.com".linkify({
  attributes: {
    title: "External Link",
  },
});
```

## `className`

- **Type**: `string | Object | (href: string, type: string, token: MultiToken) => string`
- **Default**: `null`
- **Data API**: `data-linkify-class-name`

`class` attribute to use for newly created links.

Accepts a function that takes the unformatted href value and link type (e.g.,
`'url'`, `'email'`, etc.) and returns the string.

Accepts an object where each key is the link type and each value is the string
or function to use for that type.

```js
"github.com".linkify({
  className: "new-link--url",
});

// or

"github.com".linkify({
  className: (href, type) => "new-link--" + type,
});

// or
"github.com".linkify({
  className: {
    url: "new-link--url",
    email: (href) => "new-link--email",
  },
});
```

Returns

```html
<a href="http://github.com" class="new-link--url">github.com</a>
```

## `defaultProtocol`

- **Type**: `string`
- **Default**: `'http'`
- **Values**: `'http'`, `'https'`, `'ftp'`, `'ftps'`, etc.
- **Data API**: `data-linkify-default-protocol`

Protocol that should be used in `href` attributes for URLs without a protocol
(e.g., `github.com`).

## `events`

_\*element, jquery interfaces only\*_

- **Type**: `Object | (href: string, type: string, token: MultiToken) => Object`
- **Default**: `null`

Add event listeners to newly created link elements. Takes an object where each
key is a [standard event](https://developer.mozilla.org/en-US/docs/Web/Events)
name and the value is an event handler.

Also accepts a function that takes the unformatted href and the link type (e.g.,
`'url'`, `'email'`, etc.) and returns the required events object.

```js
$("p").linkify({
  events: {
    click: (e) => alert("Link clicked!"),
    mouseover: (e) => alert("Link hovered!"),
  },
});
```

**For React, specify events in the [`attributes`](#attributes) option as
standard React events.**

See the [React Event docs](https://facebook.github.io/react/docs/events.html)
and the [linkify-react event docs](linkify-react.html#events) for details.

## `format`

- **Type**: `Object | (value: string, type: string, token: MultiToken) => string`
- **Default**: `null`

Format the text displayed by a linkified entity. e.g., truncate a long URL (a
dedicated [`truncate` option](#truncate) also exists).

Accepts an object where each key is the link type (e.g., `'url'`, `'email'`,
etc.) and each value is the formatting function to use for that type.

```js
"http://github.com/{{ site.github_username }}/search/?q=this+is+a+really+long+query+string".linkify(
  {
    format: (value, type) => {
      if (type === "url" && value.length > 50) {
        value = value.slice(0, 50) + "…";
      }
      return value;
    },
  },
);

// or

"http://github.com/{{ site.github_username }}/search/?q=this+is+a+really+long+query+string".linkify(
  {
    format: {
      url: (value) => (value.length > 50 ? value.slice(0, 50) + "…" : value),
    },
  },
);
```

## `formatHref`

- **Type**: `Object | (href: string, type: string, token: MultiToken) => string`
- **Default**: `null`

Similar to [format](#format), except the result of this function will be used as
the `href` attribute of the new link.

This is useful for hashtags or other plugins, where you don't want the default
to be a link to a named anchor (the default behaviour).

Accepts an object where each key is the link type (e.g., `'url'`, `'email'`,
etc.) and each value is the formatting function to use for that type.

```js
"This site is #rad".linkify({
  formatHref: function (href, type) {
    if (type === "hashtag") {
      href = "https://bsky.app/hashtag/" + href.substring(1);
    }
    return href;
  },
});

// or

"Hey @nfrasser, check out issue #23".linkify({
  formatHref: {
    mention: (href) => "https://github.com" + href,
    ticket: (href) =>
      "https://github.com/{{ site.github_username }}/issues/" +
      href.substring(1),
  },
});
```

## `ignoreTags`

_\*element, html, and jquery interfaces only\*_

- **Type**: `Array<string>`
- **Default**: `[]`

Prevent linkify from trying to parse links in the specified tags. Use this when
running linkify on arbitrary HTML.

```js
linkifyHtml(
  'Please ignore <script>var a = {}; a.com = "Hi";</script> \n' +
    "but do <span>b.ca</span>",
  {
    ignoreTags: ["script", "style"],
  },
);
```

Returns

```html
Please ignore
<script>
  var a = {};
  a.com = "Hi";
</script>
but do <span><a href="http://b.ca">b.ca</a></span>
```

Without `ignoreTags`, linkify would have incorrectly made a link at "a.com"
inside the `script` tag.

## `nl2br`

- **Type**: `boolean`
- **Default**: `false`
- **Data API**: `data-linkify-nl2br`

If true, `\n` line breaks are automatically converted to `<br>` tags.

## `rel`

- **Type**: `string | Object | (href: string, type: string, token: MultiToken) => string`
- **Default**: null
- **Data API**: `data-linkify-rel`

Set the [`rel`attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel)
for each discovered link.

Accepts a function that takes the unformatted href, the link type (e.g.,
`'url'`, `'email'`, etc.) and returns the rel string.

Accepts an object where each key is the link type and each value is the rel
string to use for that type.

```js
"github.com".linkify({
  rel: "noopener",
});
```

## `render`

- **Type**: `Object | ({ tagName: any, attributes: {[attr: string]: any}, content: string, eventListeners: EventListeners }) => any`
- **Default**: `null`

Use render to override how linkify generates the final link. Specify a function
that accepts an intermediate representation of the target link (an object
including tag name, attributes, text content). The return value must be a
string, HTML element or interface-specific entity.

Default render for `linkify-string` is similar to the following:

```js
"Hello world.com".linkify({
  render: ({ tagName, attributes, content }) => {
    const attributes = "";
    for (const attr in attributes) {
      attributes += ` ${attr}=${attributes[attr]}`;
    }
    return `<${tagName}${attributes}>${content}</${tagName}>`;
  },
});
```

May also be specified as an object where each key is a different link type. This
is useful in React where a special component must be used for specific link
types.

```jsx
<Linkify options={% raw %}{{
  render: {
    url: ({ attributes, content }) => {
      return <a {...attributes}>{content}</a>;
    }
    mention: ({ attributes, content }) => {
      const { href, ...props } = attributes;
      return <Link to={href} {...props}>{content}</Link>;
    }
  }
}}{% endraw %}>
  Hello @everyone, welcome to linkify.js.org
</Linkify>
```

`render` functions run after all other options have been computed with the
results (attributes, content, etc.) as the arguments.

## `tagName`

- **Type**: `string | Object | (href: string, type: string, token: MultiToken) => string`
- **Default**: `a`
- **Data API**: `data-linkify-tagname`

The HTML tag to use for each link. For cases where you can't use anchor tags.

Accepts a function that takes the unformatted href, the link type (e.g.,
`'url'`, `'email'`, etc.) and returns the tag name.

Accepts an object where each key is the link type and each value is the tag name
to use for that type.

```js
"github.com".linkify({
  tagName: "span",
});

// or

"#swag".linkify({
  tagName: {
    hashtag: "span",
  },
});
```

Returns

```html
<span href="http://github.com">github.com</span>
```

## `target`

- **Type**: `string | Object | (href: string, type: string, token: MultiToken) => string`
- **Default**: `null` (no target)
- **Data API**: `data-linkify-target`

`target` attribute for generated link such as `_blank` or `_parent`.

Accepts a function that takes the unformatted href, the link type (e.g.,
`'url'`, `'email'`, etc.) and returns the target

Accepts an object where each key is the link type and each value is the target
to use for that type.

```js
"github.com".linkify({
  target: "_parent",
});

// or
"test-email@example.com".linkify({
  target: {
    url: "_parent",
    email: null,
  },
});
```

## `truncate`

- **Type**: `number | Object | (href: string, type: string, token: MultiToken) => number`
- **Default**: `Infinity` (no truncate)
- **Data API**: `data-linkify-truncate`

Formatting helper that drops characters in discovered URLs that so that the
displayed link text is no longer than the specified length. If any characters
are dropped, also appends an ellipsis (`…`) to the result.

Applies to the result of the [`format` option](#format), if also specified.

```js
"http://github.com/{{ site.github_username }}/search/?q=this+is+a+really+long+query+string".linkify(
  {
    truncate: 42,
  },
);
```

Returns

```
'<a href="http://github.com/{{ site.github_username }}/search/?q=this+is+a+really+long+query+string">http://github.com/{{ site.github_username }}/search…</a>'
```

## `validate`

- **Type**: `boolean | Object | (value: string, type: string, token: MultiToken) => string`
- **Default**: `null`

Filter out certain links to prevent linkify from highlighting them based on any
desired criteria.

Accepts a function that takes a discovered link and the link type (e.g.,
`'url'`, `'email'`, etc.) and returns true if the link should be converted into
an anchor tag, and false otherwise.

Accepts an object where each key is the link type and each value is the the
validation option to use for that type

```js
// Skip links that don't begin in a protocol
// e.g., "http://github.com" will be linkified, but "github.com" will not.
"github.com".linkify({
  validate: {
    url: (value) => /^https?:\/\//.test(value),
  },
});
```
