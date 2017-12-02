import promisifyDOMSelector from 'promisify-dom-selector'
import getPackageGithubUrl from 'get-package-github-url'

const pGetElementById = promisifyDOMSelector(document.getElementById)

function replaceNpmUrls(resultContainer) {
  const npmPackageUrl = 'https://www.npmjs.com/package/'
  const npmLinks = [...resultContainer.querySelectorAll(`a[href^="${npmPackageUrl}"]`)]

  npmLinks.forEach(async (el) => {
    const npmUrl = el.getAttribute('href')
    const packageName = npmUrl.slice(npmPackageUrl.length)

    const githubUrl = await getPackageGithubUrl(packageName)
    if (!githubUrl)
      return

    el.setAttribute('href', githubUrl)
    el.textContent = `GitHub - ${githubUrl.slice('https://github.com/'.length)}`

    const npmUrlNodes = [...resultContainer.querySelectorAll('cite')].filter((el) => el.textContent === npmUrl)
    npmUrlNodes.forEach((el) => { el.textContent = githubUrl })

    el.style.background = 'red'

    // re-update the link each time google plays with it and changes it
    // this is done to prevent the "Redirect notice" when you open the link in a new tab
    const hrefObserver = new MutationObserver(() => {
      if (el.getAttribute('href') !== githubUrl) {
        el.setAttribute('href', githubUrl)
      }
    })
    hrefObserver.observe(el, {
      attributes: true,
      attributeFilter: ['href'],
    })
  })
}


async function init() {
  // if we start from the main google page, there isn't yet a #search div
  // so we wait for it
  const resultContainer = document.getElementById('search') || await pGetElementById('search')

  // call it a first time
  replaceNpmUrls(resultContainer)

  // and re-execute it each time the results of the search change
  const resultsObserver = new MutationObserver(() => replaceNpmUrls(resultContainer))
  resultsObserver.observe(resultContainer, {
    childList: true,
  })
}
init()
