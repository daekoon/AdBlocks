let adButton = document.getElementById('enable');
let globalButton = document.getElementById('kek');

function hello() {
  chrome.extension.getBackgroundPage().console.log("Turning background color red!")
  chrome.tabs.executeScript(
    null,
    {file: 'filter.js'},
    chrome.tabs.executeScript(
      null,
      {file: 'matter_minified.js'},
      chrome.tabs.executeScript(
        null,
        {file: 'working.js'}
      )
    )
  )
}

function hello2() {
  chrome.extension.getBackgroundPage().console.log("Turning background color red!")
  chrome.tabs.executeScript(
    null,
    {file: 'filter.js'},
    chrome.tabs.executeScript(
      null,
      {file: 'matter_minified.js'},
      chrome.tabs.executeScript(
        null,
        {file: 'workingcopy.js'}
      )
    )
  )
}

adButton.addEventListener('click', hello);
globalButton.addEventListener('click', hello2);