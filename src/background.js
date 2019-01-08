import getPackageGithubUrl from 'get-package-github-url'
import browser from 'webextension-polyfill'

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const npmPackageUrl = 'https://www.npmjs.com/package/'
  if (!changeInfo.url || !changeInfo.url.startsWith(npmPackageUrl)) {
    return
  }

  const { urlRedirect } = await browser.storage.sync.get({ urlRedirect: true })
  if (!urlRedirect) {
    return
  }

  const packageName = changeInfo.url.slice(npmPackageUrl.length)
  const githubUrl = await getPackageGithubUrl(packageName)
  if (!githubUrl) {
    return
  }

  browser.tabs.update(tab.id, { url: githubUrl })
})
