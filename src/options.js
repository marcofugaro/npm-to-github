import browser from 'webextension-polyfill'

const OPTIONS_DEFAULTS = {
  urlRedirect: true,
}

function saveOption(e) {
  const optionNode = e.currentTarget
  const optionKey = optionNode.name

  const optionValue = optionNode.type === 'checkbox' ? optionNode.checked : optionNode.value

  browser.storage.sync.set({ [optionKey]: optionValue })
}

async function restoreOptions() {
  const options = await browser.storage.sync.get(OPTIONS_DEFAULTS)

  Object.keys(options).forEach(option => {
    const optionNode = document.querySelector(`input[name="${option}"]`)

    switch (optionNode.type) {
      case 'radio':
        const targetRadio = document.querySelector(
          `input[name="${option}"][value="${options[option]}"]`,
        )
        if (targetRadio) {
          targetRadio.checked = true
        }
        break
      case 'checkbox':
        optionNode.checked = options[option]
        break
      default:
        optionNode.value = options[option]
    }
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)

const options = [...document.querySelectorAll('input, select')]
options.forEach(el => el.addEventListener('change', saveOption))
