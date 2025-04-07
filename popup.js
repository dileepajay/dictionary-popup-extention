// popup.js

// Elements
const enableToggle = document.getElementById("enableToggle");
const languageSelect = document.getElementById("languageSelect");

// Load saved settings
chrome.storage.local.get(
  ["dictionaryEnabled", "selectedDataset"],
  ({ dictionaryEnabled, selectedDataset }) => {
    enableToggle.checked = dictionaryEnabled !== false;
    const currentDataset = selectedDataset || "en2sn.json";

    // Populate language dropdown
    loadLanguages(currentDataset);
  }
);

// On toggle change
enableToggle.addEventListener("change", () => {
  chrome.storage.local.set({ dictionaryEnabled: enableToggle.checked });
});

// Populate language select from languages.json
function loadLanguages(currentDataset) {
  const url = chrome.runtime.getURL("database/languages.json");
  fetch(url)
    .then(resp => resp.json())
    .then(langs => {
      // Clear out any existing <option>
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

// On language change
languageSelect.addEventListener("change", () => {
  const selectedDataset = languageSelect.value;
  chrome.storage.local.set({ selectedDataset });
});
