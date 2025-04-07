// content.js
// content.js
console.log("Content script is running!");

let enabled = true;           // Whether popups are enabled
let currentDataset = null;    // Current loaded dictionary array
let hoverTimer = null;        // Timer for 1.5s hover
let popupElement = null;      // The popup <div> in the DOM
const HOVER_DELAY = 1500;     // 1.5 seconds

// Create a popup DIV once and reuse it
function createPopup() {
  const div = document.createElement("div");
  div.id = "dictionary-popup-extension";
  // basic inline styles for the popup
  div.style.position = "absolute";
  div.style.background = "#fff";
  div.style.border = "1px solid #ccc";
  div.style.padding = "8px";
  div.style.zIndex = "999999";
  div.style.display = "none";
  document.body.appendChild(div);
  return div;
}

// Show popup
function showPopup(x, y, text) {
  popupElement.innerText = text;
  popupElement.style.left = x + "px";
  popupElement.style.top = y + "px";
  popupElement.style.display = "block";
}

// Hide popup
function hidePopup() {
  popupElement.style.display = "none";
}

// Attempt to find definition in current dataset
function findDefinition(word) {
  if (!currentDataset) return null;
  const lowerWord = word.toLowerCase();
  // Attempt an exact match
  const entry = currentDataset.find(item => item.word.toLowerCase() === lowerWord);
  if (entry && entry.definitions) {
    return entry.definitions.join(", ");
  }
  return null;
}

// Listener for mouse move/hover
function onMouseOver(e) {
    console.log("[onMouseOver] triggered");
    if (!enabled || !currentDataset) {
      console.log("[onMouseOver] Early exit: enabled=", enabled, " dataset=", currentDataset);
      return;
    }
  
    clearTimeout(hoverTimer);
  
    const target = e.target;
    if (!target) return;
  
    const text = target.textContent || target.innerText || "";
    console.log("[onMouseOver] Found text:", text);
  
    hoverTimer = setTimeout(() => {
      console.log("[onMouseOver] Timed out, checking if we still have a single word...");
      // ...
    }, HOVER_DELAY);
  }
  

// If mouse leaves, hide popup and clear timer
function onMouseOut() {
  clearTimeout(hoverTimer);
  hidePopup();
}

// If user scrolls, also hide popup
function onScroll() {
  hidePopup();
}

// 1) Initialize popup div
popupElement = createPopup();

// 2) Load extension settings from storage
function loadSettingsAndDictionary() {
  chrome.storage.local.get(
    ["dictionaryEnabled", "selectedDataset"],
    ({ dictionaryEnabled, selectedDataset }) => {
      enabled = dictionaryEnabled !== false; // default true if not set
      const datasetName = selectedDataset || "en2sn.json";

      // fetch the dictionary file
      const url = chrome.runtime.getURL("database/" + datasetName);
      fetch(url)
        .then(resp => resp.json())
        .then(data => {
          currentDataset = data;
        })
        .catch(err => {
          console.error("Failed to load dictionary dataset:", err);
        });
    }
  );
}

// Listen for storage changes (in case user changes settings)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    if (changes.dictionaryEnabled) {
      enabled = changes.dictionaryEnabled.newValue;
      hidePopup();
    }
    if (changes.selectedDataset) {
      const datasetName = changes.selectedDataset.newValue;
      const url = chrome.runtime.getURL("database/" + datasetName);
      fetch(url)
        .then(resp => resp.json())
        .then(data => {
          currentDataset = data;
        })
        .catch(err => {
          console.error("Failed to load dictionary dataset:", err);
        });
    }
  }
});

// Setup event listeners
document.addEventListener("mouseover", onMouseOver);
document.addEventListener("mouseout", onMouseOut);
document.addEventListener("scroll", onScroll, true);

// Initial load
loadSettingsAndDictionary();

console.log("content.js loaded");