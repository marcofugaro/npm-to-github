import getPackageGithubUrl from 'get-package-github-url'
import ChromePromise from 'chrome-promise'
const chromep = new ChromePromise()

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const npmPackageUrl = 'https://www.npmjs.com/package/'
  if (!changeInfo.url || !changeInfo.url.startsWith(npmPackageUrl))
    return

  const { urlRedirect } = await chromep.storage.sync.get({ urlRedirect: true })
  if (!urlRedirect)
    return

  const packageName = changeInfo.url.slice(npmPackageUrl.length)
  const githubUrl = await getPackageGithubUrl(packageName)
  if (!githubUrl)
    return

  chrome.tabs.update(tab.id, { url: githubUrl })
})
