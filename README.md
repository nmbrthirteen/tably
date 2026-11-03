# Tably

Tably is a tiny Chromium extension that groups tabs opened from links and jumps you into the new tab.

That is the whole product. Nothing to set up.

## Behavior

- Open a link in a new tab with Command-click, Control-click, middle-click, or the browser context menu. Links that use `target="_blank"` behave the same way.
- Tably creates a native tab group with the original tab and the new tab.
- New groups are named after the original tab's website.
- If the original tab is already grouped, the new tab joins that group.
- Tably switches to the new tab.

## Permissions

Tably asks for:

- `tabGroups`, to create and update native Chromium tab groups.
- `tabs`, to read the original tab URL and name the group after the website.
- `webNavigation`, to learn which tab opened a new tab.

It runs no content script and does not read page content.

## Browser Support

Tably is built for Chromium-based browsers with Manifest V3 and native tab groups.

It works in Chrome and should work in Chromium-based browsers that support the same extension APIs.

## Install Locally

1. Open `chrome://extensions` in a Chromium-based browser.
2. Enable Developer Mode.
3. Choose Load unpacked.
4. Select this folder.

## Privacy

Tably does not collect, transmit, sell, or store personal data.

It has zero analytics, tracking, remote code, or servers.

## License

MIT
