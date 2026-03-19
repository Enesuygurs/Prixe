function parseHowLongToBeatDuration(html) {
  const normalized = String(html || "").replace(/\s+/g, " ");
  const patterns = [
    /Main Story\s+([0-9]+(?:[.,][0-9]+)?(?:\s*[¼½¾])?\s*Hours?)/i,
    /Main Story\s*<[^>]*>\s*([0-9]+(?:[.,][0-9]+)?(?:\s*[¼½¾])?\s*Hours?)/i
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return "Bulunamadi";
}

async function fetchLowestPriceBySteamAppId(appId) {
  try {
    const response = await fetch(`https://www.cheapshark.com/api/1.0/games?steamAppID=${encodeURIComponent(appId)}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return "Bulunamadi";
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return "Bulunamadi";
    }

    const prices = data
      .map((item) => Number(item?.cheapest))
      .filter((price) => Number.isFinite(price) && price > 0);

    if (prices.length === 0) {
      return "Bulunamadi";
    }

    const minPrice = Math.min(...prices);
    return `$${minPrice.toFixed(2)}`;
  } catch (error) {
    return "Alinamadi";
  }
}

async function fetchLowestPriceByTitle(title) {
  try {
    const response = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(title)}&limit=10`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return "Bulunamadi";
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return "Bulunamadi";
    }

    const prices = data
      .map((item) => Number(item?.cheapest))
      .filter((price) => Number.isFinite(price) && price > 0);

    if (prices.length === 0) {
      return "Bulunamadi";
    }

    const minPrice = Math.min(...prices);
    return `$${minPrice.toFixed(2)}`;
  } catch (error) {
    return "Alinamadi";
  }
}

function formatMinutesAsHours(minutes) {
  const hours = minutes / 60;
  if (!Number.isFinite(hours) || hours <= 0) {
    return "Bulunamadi";
  }

  if (hours < 10) {
    return `${hours.toFixed(1)} saat`;
  }

  return `${Math.round(hours)} saat`;
}

async function fetchSteamSpyDuration(appId) {
  try {
    const response = await fetch(`https://steamspy.com/api.php?request=appdetails&appid=${encodeURIComponent(appId)}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return "Bulunamadi";
    }

    const data = await response.json();
    const medianMinutes = Number(data?.median_forever);
    const averageMinutes = Number(data?.average_forever);

    const duration = formatMinutesAsHours(medianMinutes > 0 ? medianMinutes : averageMinutes);
    if (duration === "Bulunamadi") {
      return "Bulunamadi";
    }

    return `${duration} (oyuncu ort.)`;
  } catch (error) {
    return "Alinamadi";
  }
}

async function fetchHowLongToBeatDuration(title) {
  try {
    const response = await fetch(`https://howlongtobeat.com/?q=${encodeURIComponent(title)}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return "Bulunamadi";
    }

    const html = await response.text();
    return parseHowLongToBeatDuration(html);
  } catch (error) {
    return "Alinamadi";
  }
}

async function fetchBestDuration(appId, title) {
  const hltb = await fetchHowLongToBeatDuration(title);
  if (hltb !== "Bulunamadi" && hltb !== "Alinamadi") {
    return hltb;
  }

  const steamSpyDuration = await fetchSteamSpyDuration(appId);
  if (steamSpyDuration !== "Bulunamadi" && steamSpyDuration !== "Alinamadi") {
    return steamSpyDuration;
  }

  return hltb;
}

async function fetchBestLowestPrice(appId, title) {
  const byAppId = await fetchLowestPriceBySteamAppId(appId);
  if (byAppId !== "Bulunamadi" && byAppId !== "Alinamadi") {
    return byAppId;
  }

  const byTitle = await fetchLowestPriceByTitle(title);
  if (byTitle !== "Bulunamadi" && byTitle !== "Alinamadi") {
    return byTitle;
  }

  return byAppId;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action !== "fetchPrixeAppInfo") {
    return;
  }

  const appId = String(message?.payload?.appId || "").trim();
  const title = String(message?.payload?.title || "").trim();

  if (!appId || !title) {
    sendResponse({ ok: false, error: "missing-input" });
    return true;
  }

  Promise.all([
    fetchBestLowestPrice(appId, title),
    fetchBestDuration(appId, title)
  ])
    .then(([lowestPrice, duration]) => {
      sendResponse({ ok: true, data: { lowestPrice, duration } });
    })
    .catch(() => {
      sendResponse({ ok: false, error: "fetch-failed" });
    });

  return true;
});
