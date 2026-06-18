# Store Listing Draft

## Short Description

Group tabs opened from links and jump into them.

## Detailed Description

Tably keeps link trails together.

When you open a link in a new tab, Tably creates a native browser tab group with the original tab and the new tab. If the original tab is already grouped, the new tab joins that group. Then Tably switches you into the new tab.

New groups are named after the original tab's website. Existing groups keep their name.

Nothing to set up. It just runs.

## Single Purpose

Tably automatically groups tabs opened from other tabs.

## Permission Justification

Tably uses `tabGroups` to create and update native Chromium tab groups.

Tably uses `tabs` to read the original tab URL and name the group after the website. It does not request host permissions, read page content, collect browsing data, or send anything to a server.

## Test Instructions

Install the extension, open any website, then Command-click, Control-click, middle-click, or context-menu open a link in a new tab. Confirm that the original tab and opened tab are placed in a native tab group and that the opened tab becomes active.
