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

async function getGithubRepoUrl(packageName) {
  const { repository } = await fetch(`https://registry.npmjs.org/${packageName}`)
    .then((res) => res.json())

  if (!repository || repository.type !== 'git')
    return null

  let { url } = repository

  if (url.startsWith('git+')) {
    url = url.slice(4)
  }

  if (url.endsWith('.git')) {
    url = url.slice(0, -4)
  }

  if (url.startsWith('git://')) {
    url = url.slice('git://'.length)
  }

  if (url.startsWith('ssh://')) {
    url = url.slice('ssh://'.length)
  }

  if (url.startsWith('git@github.com:')) {
    url = `github.com/${url.slice('git@github.com:'.length)}`
  }

  if (url.startsWith('git@github.com/')) {
    url = `github.com/${url.slice('git@github.com/'.length)}`
  }

  // finally add the correct protocol
  if (!url.startsWith('https://')) {
    url = `https://${url}`
  }

  return url
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const npmPackageUrl = 'https://www.npmjs.com/package/'
  if (!changeInfo.url || !changeInfo.url.startsWith(npmPackageUrl))
    return

  const { urlRedirect } = await promisifiedChromeStorage.get({ urlRedirect: true })
  if (!urlRedirect)
    return

  const packageName = changeInfo.url.slice(npmPackageUrl.length)
  const githubUrl = await getGithubRepoUrl(packageName)
  if (!githubUrl)
    return

  chrome.tabs.update(tab.id, { url: githubUrl })
})


// setTimeout(() => {
//   chrome.tabs.query({ url: 'chrome://extensions/' }, ([ extensionTab ]) => {
//     if (!extensionTab) {
//       chrome.tabs.create({ url: 'chrome://extensions/', active: false }, (extensionTab) => {
//         chrome.tabs.reload(extensionTab.id)
//       })
//     } else {
//       chrome.tabs.reload(extensionTab.id)
//     }
//   })
// }, 15000)
