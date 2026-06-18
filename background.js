const NO_GROUP = -1;
const GROUP_TITLE = "Tably";
const pendingTabs = new Map();
const groupedTabs = new Set();

chrome.tabs.onCreated.addListener((tab) => {
  void handleCreatedTab(tab);
});

chrome.tabs.onUpdated.addListener((tabId) => {
  if (pendingTabs.has(tabId)) {
    void groupOpenedTab(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  pendingTabs.delete(tabId);
  groupedTabs.delete(tabId);
});

async function handleCreatedTab(tab) {
  if (!tab.id || !tab.openerTabId || tab.windowId === chrome.windows.WINDOW_ID_NONE) {
    return;
  }

  const opener = await getTab(tab.openerTabId);
  if (!opener?.id || opener.windowId !== tab.windowId) {
    return;
  }

  pendingTabs.set(tab.id, {
    openerId: opener.id,
    windowId: tab.windowId,
    title: getGroupTitle(opener)
  });

  await groupOpenedTab(tab.id);
}

async function groupOpenedTab(tabId) {
  if (groupedTabs.has(tabId)) {
    return;
  }

  const pending = pendingTabs.get(tabId);
  if (!pending) {
    return;
  }

  const [opener, tab] = await Promise.all([
    getTab(pending.openerId),
    getTab(tabId)
  ]);

  if (!opener?.id || !tab?.id || opener.windowId !== pending.windowId || tab.windowId !== pending.windowId) {
    pendingTabs.delete(tabId);
    return;
  }

  const group = await addToGroup(opener, tab);
  if (group.id === NO_GROUP) {
    return;
  }

  groupedTabs.add(tabId);
  pendingTabs.delete(tabId);

  if (group.created) {
    await updateGroup(group.id, pending.title);
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

async function updateGroup(groupId, title) {
  try {
    await chrome.tabGroups.update(groupId, {
      title
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
