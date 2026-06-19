document.addEventListener("mousedown", registerLinkIntent, true);
document.addEventListener("auxclick", registerLinkIntent, true);

let lastIntent = null;

function registerLinkIntent(event) {
  if (!isNewTabClick(event)) {
    return;
  }

  const link = event.target?.closest?.("a[href]");
  if (!link?.href || !isWebUrl(link.href)) {
    return;
  }

  const now = Date.now();
  if (lastIntent?.url === link.href && now - lastIntent.createdAt < 500) {
    return;
  }

  lastIntent = {
    url: link.href,
    createdAt: now
  };

  chrome.runtime.sendMessage({
    type: "link-intent",
    url: link.href
  });
}

function isNewTabClick(event) {
  return event.metaKey || event.ctrlKey || event.button === 1;
}

function isWebUrl(url) {
  try {
    return /^https?:$/.test(new URL(url).protocol);
  } catch {
    return false;
  }
}
