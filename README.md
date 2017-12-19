# npm-to-github [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![devDependency Status][daviddm-dev-image]][daviddm-dev-url]

> Redirect npm to github

#### [Install it from the Chrome Web Store](https://chrome.google.com/webstore/detail/npm-to-github/mmcoakfbchcckehhnpngpbmkjbpbmlng)

We js developers all do it, search for a package, npm results come up first, we click on them, go on npmjs.com and immediately click on the github link.

This extension replaces all the npm links in the google search results with github links, so you don't have to do this process ever again.

It also optionally redirects all `https://www.npmjs.com/package/` urls to github.

## FAQ

#### Is this extension also available for Firefox?
Not for now, but a PR which replaces the chrome apis with the [WebExtension APIs](https://github.com/mozilla/webextension-polyfill) is welcome.

For now you can use [this](https://addons.mozilla.org/en-US/firefox/addon/chrome-store-foxified/) to enable installing Chrome extensions in Firefox.

## License

MIT © [Marco Fugaro](https://github.com/marcofugaro)


[travis-image]: https://travis-ci.org/marcofugaro/npm-to-github.svg?branch=master
[travis-url]: https://travis-ci.org/marcofugaro/npm-to-github
[daviddm-image]: https://david-dm.org/marcofugaro/npm-to-github.svg
[daviddm-url]: https://david-dm.org/marcofugaro/npm-to-github
[daviddm-dev-image]: https://david-dm.org/marcofugaro/npm-to-github/dev-status.svg
[daviddm-dev-url]: https://david-dm.org/marcofugaro/npm-to-github/?type=dev
