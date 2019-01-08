# npm-to-github [![Build Status][travis-image]][travis-url]

> Redirect npm to github

## Install

#### [Chrome extension](https://chrome.google.com/webstore/detail/npm-to-github/mmcoakfbchcckehhnpngpbmkjbpbmlng)
#### [Firefox add-on](https://addons.mozilla.org/it/firefox/addon/npm-to-github/)

We js developers all do it, search for a package, npm results come up first, we click on them, go on npmjs.com and immediately click on the github link.

This extension replaces all the npm links in the google search results with github links, so you don't have to do this process ever again.

It also optionally redirects all `https://www.npmjs.com/package/` urls to github.

## Development

- `yarn start` to compile and watch the files for changes.

  To enable the autoreload on chrome:

  1. Go to `chrome://extensions/`
  1. Make sure **Developer mode** is on
  1. Click **Load unpacked** and choose the **build/** folder

  Instead, if you want to develop on firefox, check out [web-ext](https://github.com/mozilla/web-ext).

- `yarn build` to just compile the files.
- `yarn bundle` to compile the files and put them in a `.zip`, ready to be published.

## License

MIT © [Marco Fugaro](https://github.com/marcofugaro)

[travis-image]: https://travis-ci.org/marcofugaro/npm-to-github.svg?branch=master
[travis-url]: https://travis-ci.org/marcofugaro/npm-to-github
