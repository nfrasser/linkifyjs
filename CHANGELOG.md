# Linkify Changelog

## v4.2.0

- Correctly sanitize object replacement character by treating as whitespace
- Avoid detecting invalid URLs with numbers around boundaries
- Prevent delimiter apostrophes from being included in URLs
- Correctly interpret \r\n as newline character
- Correctly interpret emoji followed by # sign
- Fix support for domain names with multiple hyphens
- Fix parsing for magnet links

## v4.1.4

- Add support for full width middle dot `・` in hashtag plugin
- Development updates for newest Node.js versions

## v4.1.3

- Fix HTML entity `&` symbol double-encoding in linkify-html
- Support for full-width brackets, full-width less-than/greater-than signs and corner bracket as delimiters

## v4.1.2

- Ensure linkify.find respects validate option

## v4.1.1

- Slightly simpler TLDs encoding/parsing
- Fix jsdoc in linkify-react
- Improved parsing of URLs with symbols
- Ensure function options get called with unformatted href

## v4.1.0

- Drop support for Safari 10
- Reduce core bundle file size by ~30%
- Restore support for email address with scheme local part
- Allow hashtags with emojis

## v4.0.2

- Fix email address detection with domains containing numbers

## v4.0.1

- Restore nl2br option for linkify-html
- Fixed duplicate key warning in linkify-react with multiple children

## v4.0.0

### BREAKING CHANGES

- Removed deprecated `linkifyjs/string`, `linkifyjs/html`, `linkifyjs/plugins/*`
  packages. Use `linkify-string`, `linkify-html` and `linkify-plugin-*` instead.
- Refactored scanner internals break custom link plugins created with Linkify v3
- Links that begin with `mailto:` now have type `url` instead of `email`
- Drop official IE 11 support

### Added

- `linkify-plugin-ip` plugin for detecting IPv4 and IPv6 addresses
- `linkify-plugin-keyword` plugin for detecting arbitrary keywords
- `linkify.find()` function accepts an `options` argument for output formatting
- New `render` option to override link rendering
- Second `optionalSlashSlash` argument for `registerCustomProtocol` to allow links that don't require `//` after `scheme:`
- Link token methods `toFormattedString(options)`, `toFormattedHref(options)` and `toFormattedObject(options)` that accept a `linkify.Options` object
- More granular scanner tokens for improved plugin flexibility
- `linkify-react`: New `as` property (alias for `tagName`)

### Fixed

- Improved link detection with mixed languages
- Consistent option availability across interfaces (including `truncate`)
- `linkify-html`: Improved HTML entity parsing

## v3.0.5

- Fix potential Cross-Site Scripting issue when using `linkify-html`

## v3.0.4

- Expose ES6 modules with `"module"` field in `package.json`

## v3.0.3

- Add linkifyjs ES6 module build

## v3.0.2

- Correctly detect hashtags with underscores
- Fix plugin import bug
- Fix `linkify-string` and `linkify-html` type declarations

## v3.0.1

- Fix React component type declarations
- Include LICENSE file in all published packages

## v3.0.0

### BREAKING CHANGES

- React, jQuery and Element interfaces moved to dedicated packages at `linkify-react`,`linkify-jquery` and `linkify-element` respectively:
- Remove default `class="linkified"` from all discovered links. Opt back in by setting the `className` option:
  ```js
  linkifyStr(str, { className: 'linkified' });
  ```
- Remove default `target="_blank"` attribute for discovered URLs. Opt back in by setting the `target` option:
  ```js
  linkifyHtml(str, {
    target: (href, type) => type === 'url' && '_blank',
  });
  ```
- React component: Remove outer `<span>` tag wrapper in favour of tag-less `React.Fragment` for React >=16. To opt back-in, set `tagName='span'`:
  ```jsx
  <Linkify tagName="span">{content}</Linkify>
  ```
- AMD module interface is no longer provided. Use an ESM bundler instead.
- Plugins imported after linkify is called on a string for the first time will not longer work. Import all plugins _before_ calling a linkify core or interface function.
- Custom plugin API is not compatible with previous API in Linkify v2
- Dropped support for Internet Explorer versions 9 and 10. IE11 is still supported
- Dropped support for React versions <15

### Deprecations

- Use dedicated packages `linkify-string` and `linkify-html` instead of `linkifyjs/string` and `linkifyjs/html`. The embedded packages will be removed in v4.0
- Use dedicated plugin packages `linkify-plugin-[PLUGIN]` instead of `linkifyjs/plugin/[PLUGIN]`. The embedded packages will be removed in v4.0

### All Changes

- Full Internationalized Domain (IDN) and Emoji domain support 🇺🇳🌍✈️🎉💃! Detect URLs, #hashtags and @mentions in any language
- ~10x faster startup; ~4x faster combined startup + first run
- Custom protocols with `linkify.registerCustomProtocol('protocol')`
- Modernized codebase and build system
- Add new `rel` option at top level as an alternate way of including it in `attributes`
- New and improved plugin API
- TypeScript definitions included in published packages
- `linkify.find()` output includes start and end indexes for where in the string a link was found
- Plugins no longer need to be called on linkify after import

  ```js
  // Before
  import * as linkify from 'linkifyjs';
  import hashtag from 'linkifyjs/plugins/hashtag';
  hashtag(linkify);

  // After
  import * as linkify from 'linkifyjs';
  import 'linkifyjs/plugins/hashtag';
  ```

## v2.1.9

- Move optional dependencies to peerdependencies (#282)
- Fix `npm install` displays vulnerabilities. (#265)
- Fix typo (#275)

## v2.1.8

- Allow mentions with inner @ sign for federated mentions - thanks @juliushaertl!
- Drop official support for Internet Explorer 8 and Node.js 6 (still supported unofficially but may break in future releases)
- Update dev dependencies

## v2.1.7

- Update dependencies (#243)
- Ignore .babelrc file (854e6fc)

## v2.1.6

- Fix a bug where unique element IDs aren't unique (#215)
- Update tlds.js (#213)
- Automated browser test fixes (#224)
- Add partialProtocolMailtoStates to domainStates (#210)
- Use Object.defineProperty to extend String prototype so that 'linkify' function is not enumerable (#197)
- Allow null overrides in options for target and className (#189)

## v2.1.5

- React plugin compatibility updates

## v2.1.4

- Add explicit support for mailto: addresses (#186)
- Add support for mentions containing dots (#185)
- URL followed by `&nbsp;` now works as expected in linkify-html (#184)
- Small dependency updates (#183)
- Drop deprecated babel-preset-es2015-loose dependency (#172)
- Web workers support (#168)

## v2.1.3

- Links in angle brackets (#166)

## v2.1.2

- Single quotes should be treated as punctuation (#165)

## v2.1.1

- Detect additional whitespace characters (#163)

## v2.1.0

### BREAKING CHANGES

- The `dist/jquery.linkify.js` 1.x legacy browser files have been permanently
  removed from the release bundle.
  - Use `linkify.js` and `linkify-jquery.js` instead.
- The deprecated `newLine` option from linkify 1.x has been completely removed.
  - Use the [`nl2br` option](https://linkify.js.org/docs/options.html#nl2br) instead.

### Features

- [New React.js interface](https://linkify.js.org/docs/linkify-react.html)
- [@mention plugin](https://linkify.js.org/docs/plugin-mention.html)
- [GitHub-style ticket/issue reference plugin](https://linkify.js.org/docs/plugin-ticket.html)
- Improved option definitions
  - Options that take functions with value and type arguments can now be
    specified as objects, where each key is the target link type.

### Deprecations

- The `linkAttributes` option is deprecated in favour of just **`attributes`**.
- The `linkClass` option is deprecated in favour of **`className`**.
- The default `.linkified` class is deprecated and will be fully removed
  in a future release.

To maintain compatibility with versions >= 2.1, make sure options objects
include these properties instead of `linkAttributes` and `linkClass`

### All Changes

- Build optimizations to make compiled AMD payload smaller
- Bugfix in quick-es3 task
- Make better use of ES6 modules and rollup
- Tickets plugin (#156)
- Additional Mentions features, enhancements, and tests (#155)
- Mentions plugin (#111)
- Revamped options utility (#154)
- Linkify React Interface (#150)
- Development upgrades (#153)

## v2.0.5

- Correct trailing symbol parsing (#149)
- Linkify element fixes (#148)

## v2.0.4

- Optimize class code to reduce file size (#147).
- Update test and dev dependencies
- Allow uglify to mangle properties, except for the specified ones (#146)
- Updated tlds.js (#121)

## v2.0.3

- Fixing element interface invalid DOM node error (#141)

## v2.0.1

- Updated build system and development dependencies
- IE8 Support
- Internal API updates

## v2.0.0

- New link-detection technique based on lexicographical analysis via two-stage scanner - essentially regexp with more flexibility.
- Faster, less destructive DOM manipulation.
- Node.js API via `var linkify = require('linkifyjs');`
- Internal plugin system so you can require only features you need. e.g., `require('linkifyjs/plugins/hashtag')(linkify);`
- Browser modules (Browserify, AMD)
- Mocha Unit tests
- ES6 Implementation
- Updated documentation
- Repository name change
