// returns a promise which resolves when the element appears in the dom
function promisifyDOMSelector(selector, context = document) {
  return (queryString) => {
    return new Promise((resolve) => {
      // check if there is already the element, if yes resolve and return
      const targetNode = selector.call(context, queryString)
      if (targetNode) {
        return resolve(targetNode)
      }

      // else watch for the dom element changes
      const attemptSelection = new MutationObserver((mutations, observer) => {
        const targetNode = selector.call(context, queryString)
        if (!targetNode)
          return

        observer.disconnect()
        resolve(targetNode)
      })
      attemptSelection.observe(context === document ? document.body : context, {
        childList: true,
        subtree: true,
      })
    })
  }
}

const pGetElementById = promisifyDOMSelector(document.getElementById)

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

function replaceNpmUrls(resultContainer) {
  const npmPackageUrl = 'https://www.npmjs.com/package/'
  const npmLinks = [...resultContainer.querySelectorAll(`a[href^="${npmPackageUrl}"]`)]

  npmLinks.forEach(async (el) => {
    const npmUrl = el.getAttribute('href')
    const packageName = npmUrl.slice(npmPackageUrl.length)

    const githubUrl = await getGithubRepoUrl(packageName)
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
