import getPackageGithubUrl from 'get-package-github-url'

// TODO use pify
const promisifiedChromeStorage = {
  get(optionsRequested) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(optionsRequested, (options) => resolve(options))
    })
  },

  set(options) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(options, resolve)
    })
  },
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const npmPackageUrl = 'https://www.npmjs.com/package/'
  if (!changeInfo.url || !changeInfo.url.startsWith(npmPackageUrl))
    return

  const { urlRedirect } = await promisifiedChromeStorage.get({ urlRedirect: true })
  if (!urlRedirect)
    return

  const packageName = changeInfo.url.slice(npmPackageUrl.length)
  const githubUrl = await getPackageGithubUrl(packageName)
  if (!githubUrl)
    return

  chrome.tabs.update(tab.id, { url: githubUrl })
})
