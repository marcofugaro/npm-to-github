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

function saveOption(e) {
  const inputNode = e.currentTarget
  const optionKey = inputNode.name

  // TODO support also radio buttons and selects
  const optionValue = inputNode.type === 'checkbox' ? inputNode.checked : inputNode.value

  promisifiedChromeStorage.set({ [optionKey]: optionValue })
}

async function restoreOptions() {
  const options = await promisifiedChromeStorage.get({ urlRedirect: true })

  Object.keys(options).forEach((option) => {
    const optionNode = document.querySelector(`input[name="${option}"]`)

    if (optionNode.type === 'checkbox') {
      optionNode.checked = options[option]
    } else {
      optionNode.value = options[option]
    }
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)

const checkboxOptions = [...document.querySelectorAll('input[type="checkbox"]')]
checkboxOptions.forEach((el) => el.addEventListener('change', saveOption))
