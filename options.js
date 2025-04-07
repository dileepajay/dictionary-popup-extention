// options.js

const enableToggle = document.getElementById("enableToggle");
const languageSelect = document.getElementById("languageSelect");

// Load current settings
chrome.storage.local.get(
  ["dictionaryEnabled", "selectedDataset"],
  ({ dictionaryEnabled, selectedDataset }) => {
    enableToggle.checked = dictionaryEnabled !== false;
    const currentDataset = selectedDataset || "en2sn.json";
    loadLanguages(currentDataset);
  }
);

enableToggle.addEventListener("change", () => {
  chrome.storage.local.set({ dictionaryEnabled: enableToggle.checked });
});

function loadLanguages(currentDataset) {
  const url = chrome.runtime.getURL("database/languages.json");
  fetch(url)
    .then(resp => resp.json())
    .then(langs => {
      languageSelect.innerHTML = "";
      langs.forEach(lang => {
        const option = document.createElement("option");
        option.value = lang.dataset;
        option.textContent = lang.title;
        if (lang.dataset === currentDataset) {
          option.selected = true;
        }
        languageSelect.appendChild(option);
      });
    })
    .catch(err => console.error("Failed to load languages:", err));
}

languageSelect.addEventListener("change", () => {
  chrome.storage.local.set({ selectedDataset: languageSelect.value });
});
