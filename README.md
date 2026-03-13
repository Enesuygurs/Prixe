# Prixe

Prixe is a Chrome extension that provides advanced filtering and visual price highlighting for faster game discovery on the Steam Search page.

<img width="396" height="498" alt="1" src="https://github.com/user-attachments/assets/4b9c612f-45be-46d3-ae3c-b49c15c37b13" />
<img width="396" height="498" alt="2" src="https://github.com/user-attachments/assets/cdc1329f-0447-4590-9b0c-7cb3c0bfec4e" />
<img width="396" height="498" alt="3" src="https://github.com/user-attachments/assets/17073d8d-cd26-4aee-99ad-5cb315260e8e" />

## Features

- Quickly apply Steam Search URL filters from the popup
- Filter by price, discount, review count, positive rating percentage, and release year
- Filter by review quality (Positive and Very Positive levels)
- Platform-based filtering (Windows, Mac, Linux)
- Hide items such as DLC, Free to Play, Coming Soon, and Early Access
- Price tags and colored row highlighting (low, mid, high)
- Sort results by price or discount rate
- Ready-to-use budget presets ($5, $10, $20, $40)
- Turkish and English UI language options
- Persistent settings via `chrome.storage.local`

## Requirements

- Google Chrome (latest version with Manifest V3 support)

## Installation (Developer Mode)

1. Open `chrome://extensions` in Chrome.
2. Enable the **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select this project folder.
5. After loading, open the extension popup from the browser toolbar.

## Usage

1. In the extension popup, choose your filters from the Home tab.
2. Click **Apply** to apply filters to the active Steam Search tab.
3. If no Steam Search tab is open, the extension opens a new search tab.
4. Use the Settings tab to configure price highlight thresholds and language.
5. Use the Checkbox tab to toggle additional filters.

## Permissions

- `tabs`: Read the active tab and update the Steam Search URL
- `storage`: Persist filter and language settings
- `https://store.steampowered.com/*`: Apply filtering on Steam Search pages

## Project Structure

- `manifest.json`: Extension manifest and permissions
- `src/popup.html`: Popup UI structure
- `src/popup.css`: Popup styles
- `src/popup.js`: Popup state management, URL building, persistence, and messaging
- `src/content.js`: Steam Search row filtering, sorting, and price highlighting
- `icons/`: Extension icons

## Development Notes

- This project is built with vanilla JavaScript.
- There is no build step; after changes, reloading from `chrome://extensions` is enough.

## License

No license file is currently included in this repository. You can add a `LICENSE` file if needed.
