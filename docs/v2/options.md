---
layout: doc
title: Options · Documentation
---

# Options

Linkify is applied with the following default options. Below is a description of
each.

```js
linkify.options.defaults = {
  attributes: null,
  className: "linkified",
  defaultProtocol: "http",
  events: null,
  format: function (value, type) {
    return value;
  },
  formatHref: function (href, type) {
    return href;
  },
  ignoreTags: [],
  nl2br: false,
  tagName: "a",
  target: {
    url: "_blank",
  },
  validate: true,
};
```

**Note:** The default `.linkified` class will be removed in a future release

These defaults are stored at `linkify.options.defaults` can be set globally from
there.

<div class="alert alert-warning">
  <strong>Warning:</strong> Use default overrides sparingly. If you cannot
  guarantee that you are linkify's only consumer, don't override the defaults.
</div>

## General Usage

```js
linkifyStr(str, options); // or `str.linkify(options)`
linkifyHtml(str, options);
linkifyElement(document.getElementById("id"), options);
$(selector).linkify(options);
React.createElement(Linkify, { options: options }, str);
```

## attributes

- **Type**: `Object | Function (String href, String type)`
- **Default**: `null`

Object of attributes to add to each new link. **Note:** the [`class`](#classname)
and [`target`](#target) attributes have dedicated options.

Also accepts a function that takes the unformatted href, the link type (e.g.,
`'url'`, `'email'`, etc.) and returns the object.

```js
"github.com".linkify({
  attributes: {
    rel: "nofollow",
  },
});
```

## className

- **Type**: `String | Function (String href, String type) | Object`
- **Default**: `'linkified'` (may be removed in future releases)
- **Data API**: `data-linkify-class-name`

`class` attribute to use for newly created links.

Accepts a function that takes the unformatted href value and link type (e.g.,
`'url'`, `'email'`, etc.) and returns the string.

Accepts an object where each key is the link type and each value is the string
or function to use for that type.

**Note:** The default `linkified` class name is deprecated and will be removed
in a future release.

```js
"github.com".linkify({
  className: "new-link--url",
});

// or

"github.com".linkify({
  className: function (href, type) {
    return "new-link--" + type;
  },
});

// or
"github.com".linkify({
  className: {
    url: "new-link--url",
    email: function (href) {
      return "new-link--email";
    },
  },
});
```

Returns

```html
<a href="http://github.com" class="new-link--url">github.com</a>
```

## defaultProtocol

- **Type**: `String`
- **Default**: `'http'`
- **Values**: `'http'`, `'https'`, `'ftp'`, `'ftps'`, etc.
- **Data API**: `data-linkify-default-protocol`

Protocol that should be used in `href` attributes for URLs without a protocol
(e.g., `github.com`).

## events

_\*element, jquery interfaces only\*_

- **Type**: `Object | Function (String href, String type) | Object`
- **Default**: `null`

Add event listeners to newly created link elements. Takes a hash where each key
is an [standard event](https://developer.mozilla.org/en-US/docs/Web/Events) name
and the value is an event handler.

Also accepts a function that takes the unformatted href and the link type (e.g.,
`'url'`, `'email'`, etc.) and returns the hash.

```js
$("p").linkify({
  events: {
    click: function (e) {
      alert("Link clicked!");
    },
    mouseover: function (e) {
      alert("Link hovered!");
    },
  },
});
```

**For React, specify events in the [`attributes`](#attributes) option as
standard React events.**

See the [React Event docs](https://facebook.github.io/react/docs/events.html)
and the [linkify-react event docs](linkify-react.html#events)

## format

- **Type**: `Function (String value, String type) | Object`
- **Default**: `null`

Format the text displayed by a linkified entity. e.g., truncate a long URL.

Accepts an object where each key is the link type (e.g., `'url'`, `'email'`,
etc.) and each value is the formatting function to use for that type.

```js
"http://github.com/SoapBox/linkifyjs/search/?q=this+is+a+really+long+query+string".linkify(
  {
    format: function (value, type) {
      if (type === "url" && value.length > 50) {
        value = value.slice(0, 50) + "…";
      }
      return value;
    },
  },
);

// or

"http://github.com/SoapBox/linkifyjs/search/?q=this+is+a+really+long+query+string".linkify(
  {
    format: {
      url: function (value) {
        return value.length > 50 ? value.slice(0, 50) + "…" : value;
      },
    },
  },
);
```

## formatHref

- **Type**: `Function (String href, String type) | Object`
- **Default**: `null`

Similar to [format](#format), except the result of this function will be used as
the `href` attribute of the new link.

This is useful when finding hashtags, where you don't necessarily want the
default to be a link to a named anchor.

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
    mention: function (href) {
      return "https://github.com" + href;
    },
    ticket: function (href) {
      return (
        "https://github.com/{{ site.github_username }}/issues/" +
        href.substring(1)
      );
    },
  },
});
```

## ignoreTags

_\*element, html, and jquery interfaces only\*_

- **Type**: `Array`
- **Default**: `[]`

Prevent linkify from trying to parse links in the specified tags. This is useful
when running linkify on arbitrary HTML.

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
but do
<span><a href="http://b.ca" class="linkified" target="_blank">b.ca</a></span>
```

Notice that there is no hyperlink at "a.com" inside the `script` tag.

## nl2br

- **Type**: `Boolean`
- **Default**: `false`
- **Data API**: `data-linkify-nl2br`

If true, `\n` line breaks will automatically be converted to `<br>` tags.

## tagName

- **Type**: `String | Function (String href, String type) | Object`
- **Default**: `a`
- **Data API**: `data-linkify-tagname`

The tag name to use for each link. For cases where you can't use anchor tags.

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

## target

- **Type**: `String | Function (String href, String type) | Object`
- **Default**: `'_blank'` for URLs, `null` for everything else
- **Data API**: `data-linkify-target`

`target` attribute for generated link.

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

## validate

- **Type**: `Boolean | Function (String value, String type) | Object`
- **Default**: `null`

If option resolves to false, the given value will not show up as a link.

Accepts a function that takes a discovered link and the link type (e.g.,
`'url'`, `'email'`, etc.) and returns true if the link should be converted into
an anchor tag, and false otherwise.

Accepts an object where each key is the link type and each value is the the
validation option to use for that type

```js
// Don't linkify links that don't begin in a protocol
// e.g., "http://google.com" will be linkified, but "google.com" will not.
"www.google.com".linkify({
  validate: {
    url: function (value) {
      return /^(http|ftp)s?:\/\//.test(value);
    },
  },
});
```

## linkClass

**Deprecated**. Use [`className`](#classname) instead.

## linkAttributes

**Deprecated**. Use [`attributes`](#attributes) instead.
