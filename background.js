const NO_GROUP = -1;
const GROUP_TITLE = "Tably";

chrome.tabs.onCreated.addListener((tab) => {
  void groupOpenedTab(tab);
});

async function groupOpenedTab(tab) {
  if (!tab.id || !tab.openerTabId || tab.windowId === chrome.windows.WINDOW_ID_NONE) {
    return;
  }

  const opener = await getTab(tab.openerTabId);
  if (!opener?.id || opener.windowId !== tab.windowId) {
    return;
  }

  const group = await addToGroup(opener, tab);
  if (group.id === NO_GROUP) {
    return;
  }

  if (group.created) {
    await updateGroup(group.id, opener);
  }

  await activateTab(tab.id, tab.windowId);
}

async function addToGroup(opener, tab) {
  const created = opener.groupId === NO_GROUP;
  const options = {
    tabIds: created ? [opener.id, tab.id] : [tab.id]
  };

  if (created) {
    options.createProperties = { windowId: tab.windowId };
  } else {
    options.groupId = opener.groupId;
  }

  try {
    return { id: await chrome.tabs.group(options), created };
  } catch {
    return { id: NO_GROUP, created: false };
  }
}

async function updateGroup(groupId, opener) {
  try {
    await chrome.tabGroups.update(groupId, {
      title: getGroupTitle(opener)
    });
  } catch {
  }
}

function getGroupTitle(tab) {
  try {
    const url = new URL(tab.url || tab.pendingUrl);
    return url.hostname.replace(/^www\./, "") || GROUP_TITLE;
  } catch {
    return GROUP_TITLE;
  }
}

async function activateTab(tabId, windowId) {
  try {
    await chrome.tabs.update(tabId, { active: true });
    await chrome.windows.update(windowId, { focused: true });
  } catch {
  }
}

async function getTab(tabId) {
  try {
    return await chrome.tabs.get(tabId);
  } catch {
    return null;
  }
}
