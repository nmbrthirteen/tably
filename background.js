const NO_GROUP = -1;
const GROUP_TITLE = "Tably";

chrome.webNavigation.onCreatedNavigationTarget.addListener(
  (details) => {
    void handleNavigationTarget(details);
  },
  { url: [{ schemes: ["http", "https"] }] }
);

async function handleNavigationTarget({ sourceTabId, tabId }) {
  const [opener, tab] = await Promise.all([getTab(sourceTabId), getTab(tabId)]);

  if (!opener?.id || !tab?.id || opener.windowId !== tab.windowId) {
    return;
  }

  const group = await addToGroup(opener, tab);

  if (group.id === NO_GROUP) {
    return;
  }

  if (group.created) {
    await updateGroup(group.id, getGroupTitle(opener));
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
    // The group may already be gone.
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
    // The tab or window may already be gone.
  }
}

async function getTab(tabId) {
  try {
    return await chrome.tabs.get(tabId);
  } catch {
    return null;
  }
}
