import promisifyDOMSelector from 'promisify-dom-selector'
import browser from 'webextension-polyfill'

const pGetElementById = promisifyDOMSelector(document.getElementById)

// Do the npmjs.com request in the background script to avoid CORB.
// In a more normal situation it would have been backgroundFetch
async function backgroundGetPackageGithubUrl(packageName) {
  return browser.runtime.sendMessage({ packageName })
}

function replaceNpmUrls(resultContainer) {
  const npmPackageUrl = 'https://www.npmjs.com/package/'
  const npmLinks = [...resultContainer.querySelectorAll(`a[href^="${npmPackageUrl}"]`)]

  npmLinks.forEach(async link => {
    const npmUrl = link.getAttribute('href')
    let packageName = npmUrl.slice(npmPackageUrl.length)

    // remove the query options
    if (packageName.includes('?')) {
      packageName = packageName.slice(0, packageName.indexOf('?'))
    }

    const githubUrl = await backgroundGetPackageGithubUrl(packageName)
    if (!githubUrl) {
      return
    }

    link.setAttribute('href', githubUrl)
    const title = link.querySelector('h3') || link
    title.textContent = title.textContent.replace(' - npm', ' - GitHub')

    const npmUrlNodes = [...resultContainer.querySelectorAll('cite')].filter(
      el => el.textContent === npmUrl,
    )
    npmUrlNodes.forEach(el => {
      el.textContent = githubUrl
    })

    // re-update the link each time google plays with it and changes it
    // this is done to prevent the "Redirect notice" when you open the link in a new tab
    const hrefObserver = new MutationObserver(() => {
      if (link.getAttribute('href') !== githubUrl) {
        link.setAttribute('href', githubUrl)
      }
    })
    hrefObserver.observe(link, {
      attributes: true,
      attributeFilter: ['href'],
    })
  })
}

async function init() {
  // if we start from the main google page, there isn't yet a #search div
  // so we wait for it
  const resultContainer = document.getElementById('search') || (await pGetElementById('search'))

  // call it a first time
  replaceNpmUrls(resultContainer)

  // and re-execute it each time the results of the search change
  const resultsObserver = new MutationObserver(() => replaceNpmUrls(resultContainer))
  resultsObserver.observe(resultContainer, {
    childList: true,
  })
}
init()
