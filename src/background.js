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

  return "Bulunamadı";
}

function getCacheKey(appId) {
  return `prixeAppInfo:v2:${appId}`;
}

function parseDollarValue(text) {
  if (typeof text !== "string") {
    return null;
  }

  const match = text.match(/(\d+(?:[.,]\d+)?)/);
  if (!match?.[1]) {
    return null;
  }

  const value = Number(match[1].replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

async function getCachedAppInfo(appId) {
  const key = getCacheKey(appId);
  const data = await chrome.storage.local.get(key);
  return data[key] || null;
}

async function setCachedAppInfo(appId, payload) {
  const key = getCacheKey(appId);
  await chrome.storage.local.set({ [key]: payload });
}

async function fetchLowestPriceBySteamAppId(appId) {
  try {
    const response = await fetch(`https://www.cheapshark.com/api/1.0/games?steamAppID=${encodeURIComponent(appId)}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return { value: "Bulunamadı", sourceUrl: "https://www.cheapshark.com", sourceName: "CheapShark" };
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return { value: "Bulunamadı", sourceUrl: "https://www.cheapshark.com", sourceName: "CheapShark" };
    }

    const minItem = data
      .filter((item) => Number.isFinite(Number(item?.cheapest)) && Number(item?.cheapest) > 0)
      .sort((a, b) => Number(a.cheapest) - Number(b.cheapest))[0];

    if (!minItem) {
      return { value: "Bulunamadı", sourceUrl: "https://www.cheapshark.com", sourceName: "CheapShark" };
    }

    const minPrice = Number(minItem.cheapest);
    const sourceUrl = minItem.cheapestDealID
      ? `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(minItem.cheapestDealID)}`
      : "https://www.cheapshark.com";

    return { value: `$${minPrice.toFixed(2)}`, sourceUrl, sourceName: "CheapShark" };
  } catch (error) {
    return { value: "Alınamadı", sourceUrl: "https://www.cheapshark.com", sourceName: "CheapShark" };
  }
}

async function fetchLowestPriceByTitle(title) {
  try {
    const response = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(title)}&limit=10`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return { value: "Bulunamadı", sourceUrl: "https://www.cheapshark.com", sourceName: "CheapShark" };
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return { value: "Bulunamadı", sourceUrl: "https://www.cheapshark.com", sourceName: "CheapShark" };
    }

    const normalizedTitle = title.trim().toLowerCase();
    const strictlyMatched = data.filter((item) => String(item?.external || "").trim().toLowerCase() === normalizedTitle);
    const candidateList = strictlyMatched.length > 0 ? strictlyMatched : data;

    const minItem = candidateList
      .filter((item) => Number.isFinite(Number(item?.cheapest)) && Number(item?.cheapest) > 0)
      .sort((a, b) => Number(a.cheapest) - Number(b.cheapest))[0];

    if (!minItem) {
      return { value: "Bulunamadı", sourceUrl: "https://www.cheapshark.com", sourceName: "CheapShark" };
    }

    const minPrice = Number(minItem.cheapest);
    const sourceUrl = minItem.cheapestDealID
      ? `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(minItem.cheapestDealID)}`
      : `https://www.cheapshark.com/search#q:${encodeURIComponent(title)}`;

    return { value: `$${minPrice.toFixed(2)}`, sourceUrl, sourceName: "CheapShark" };
  } catch (error) {
    return { value: "Alınamadı", sourceUrl: "https://www.cheapshark.com", sourceName: "CheapShark" };
  }
}

async function fetchSteamCurrentPrice(appId) {
  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${encodeURIComponent(appId)}&cc=us&l=en`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return { value: "Bulunamadı", sourceUrl: `https://store.steampowered.com/app/${appId}`, sourceName: "Steam" };
    }

    const data = await response.json();
    const appData = data?.[String(appId)]?.data;
    const cents = Number(appData?.price_overview?.final);
    if (!Number.isFinite(cents) || cents <= 0) {
      return { value: "Bulunamadı", sourceUrl: `https://store.steampowered.com/app/${appId}`, sourceName: "Steam" };
    }

    const dollars = cents / 100;
    return {
      value: `$${dollars.toFixed(2)}`,
      sourceUrl: `https://store.steampowered.com/app/${appId}`,
      sourceName: "Steam"
    };
  } catch (error) {
    return { value: "Alınamadı", sourceUrl: `https://store.steampowered.com/app/${appId}`, sourceName: "Steam" };
  }
}

function formatMinutesAsHours(minutes) {
  const hours = minutes / 60;
  if (!Number.isFinite(hours) || hours <= 0) {
    return "Bulunamadı";
  }

  if (hours < 1) {
    return "1 saat";
  }

  return `${Math.floor(hours)} saat`;
}

async function fetchSteamSpyDuration(appId) {
  try {
    const response = await fetch(`https://steamspy.com/api.php?request=appdetails&appid=${encodeURIComponent(appId)}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return { value: "Bulunamadı", sourceUrl: `https://steamspy.com/app/${appId}`, sourceName: "SteamSpy" };
    }

    const data = await response.json();
    const averageMinutes = Number(data?.average_forever);
    const medianMinutes = Number(data?.median_forever);

    const duration = formatMinutesAsHours(averageMinutes > 0 ? averageMinutes : medianMinutes);
    if (duration === "Bulunamadı") {
      return { value: "Bulunamadı", sourceUrl: `https://steamspy.com/app/${appId}`, sourceName: "SteamSpy" };
    }

    return { value: duration, sourceUrl: `https://steamspy.com/app/${appId}`, sourceName: "SteamSpy" };
  } catch (error) {
    return { value: "Alınamadı", sourceUrl: `https://steamspy.com/app/${appId}`, sourceName: "SteamSpy" };
  }
}

async function fetchHowLongToBeatDuration(title) {
  try {
    const response = await fetch(`https://howlongtobeat.com/?q=${encodeURIComponent(title)}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return { value: "Bulunamadı", sourceUrl: `https://howlongtobeat.com/?q=${encodeURIComponent(title)}`, sourceName: "HowLongToBeat" };
    }

    const html = await response.text();
    const value = parseHowLongToBeatDuration(html);
    return { value, sourceUrl: `https://howlongtobeat.com/?q=${encodeURIComponent(title)}`, sourceName: "HowLongToBeat" };
  } catch (error) {
     return { value: "Alınamadı", sourceUrl: `https://howlongtobeat.com/?q=${encodeURIComponent(title)}`, sourceName: "HowLongToBeat" };
  }
}

async function fetchBestDuration(appId, title) {
  const hltb = await fetchHowLongToBeatDuration(title);
    if (hltb.value !== "Bulunamadı" && hltb.value !== "Alınamadı") {
     return hltb;
  }

  const steamSpyDuration = await fetchSteamSpyDuration(appId);
  if (steamSpyDuration.value !== "Bulunamadı" && steamSpyDuration.value !== "Alınamadı") {
    return steamSpyDuration;
  }

  return hltb;
}

async function fetchBestLowestPrice(appId, title) {
  const byAppId = await fetchLowestPriceBySteamAppId(appId);
  const steamCurrent = await fetchSteamCurrentPrice(appId);
  const byTitle = await fetchLowestPriceByTitle(title);

  const candidates = [byAppId, steamCurrent, byTitle]
    .map((item) => ({
      ...item,
      numeric: parseDollarValue(item?.value)
    }))
    .filter((item) => Number.isFinite(item.numeric) && item.numeric > 0);

  if (candidates.length > 0) {
    candidates.sort((a, b) => a.numeric - b.numeric);
    const best = candidates[0];
    return {
      value: `$${best.numeric.toFixed(2)}`,
      sourceUrl: best.sourceUrl,
      sourceName: best.sourceName
    };
  }

  if (steamCurrent.value !== "Bulunamadı" && steamCurrent.value !== "Alınamadı") {
    return steamCurrent;
  }

    if (byAppId.value !== "Bulunamadı" && byAppId.value !== "Alınamadı") {
     return byAppId;
  }

    if (byTitle.value !== "Bulunamadı" && byTitle.value !== "Alınamadı") {
     return byTitle;
  }

  return steamCurrent;
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

  getCachedAppInfo(appId)
    .then((cached) => {
      if (cached) {
        sendResponse({ ok: true, data: cached });
        return;
      }

      Promise.all([
        fetchBestLowestPrice(appId, title),
        fetchBestDuration(appId, title)
      ])
        .then(async ([lowestPrice, duration]) => {
          const payload = {
            lowestPrice: lowestPrice.value,
            duration: duration.value,
            lowestPriceSourceUrl: lowestPrice.sourceUrl,
            lowestPriceSourceName: lowestPrice.sourceName,
            durationSourceUrl: duration.sourceUrl,
            durationSourceName: duration.sourceName
          };
          await setCachedAppInfo(appId, payload);
          sendResponse({ ok: true, data: payload });
        })
        .catch(() => {
          sendResponse({ ok: false, error: "fetch-failed" });
        });
    })
    .catch(() => {
      sendResponse({ ok: false, error: "cache-read-failed" });
    });

  return true;
});
