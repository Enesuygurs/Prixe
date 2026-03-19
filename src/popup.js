const DEFAULT_STATE = {
  masterEnabled: true,
  maxPrice: 5,
  specials: true,
  hidef2p: true,
  ndl: true,
  minDiscount: 0,
  minReviews: 0,
  minUserScore: 0,
  minReleaseYear: 0,
  sortBy: "default",
  reviewFilter: "any",
  onlyTradingCards: false,
  onlyAchievements: false,
  onlyCloudSaves: false,
  hideComingSoon: false,
  platformWin: true,
  platformMac: true,
  platformLinux: true,
  hideEarlyAccess: false,
  hideMixedOrWorse: false,
  enablePriceHighlight: true,
  lowPrice: 5,
  midPrice: 15
};

const STORAGE_KEYS = {
  state: "steamSearchState",
  language: "steamUiLanguage"
};

const STRINGS = {
  tr: {
    labelMasterEnabled: "Prixe aktif",
    appSubtitle: "Steam Search filtrelerini tek noktadan yonet",
    labelFilterSettings: "FILTRE AYARLARI",
    labelHomeFiltersSection: "ARAMA FILTRELERI",
    labelCheckboxFiltersSection: "CHECKBOX FILTRELERI",
    labelLowPrice: "Dusuk fiyat limiti ($)",
    labelMidPrice: "Orta fiyat limiti ($)",
    labelEnablePriceHighlight: "Fiyat isaretleme aktif",
    labelHideMixedOrWorse: "Mixed ve alti gizle",
    labelMaxPrice: "Max fiyat (USD)",
    labelSpecials: "Sadece indirimde",
    labelHidef2p: "Ucretsizleri gizle",
    labelNdl: "DLC gizle",
    labelHideEarlyAccess: "Early Access gizle",
    labelMinDiscount: "Min indirim (%)",
    labelReviewFilter: "Inceleme filtresi",
    reviewAny: "Tum skorlar",
    reviewPositivePlus: "Pozitif ve uzeri",
    reviewVeryPositivePlus: "Cok pozitif ve uzeri",
    labelMinReviews: "Min inceleme adedi",
    labelSortBy: "Siralama",
    sortDefault: "Steam varsayilan",
    sortPriceAsc: "Fiyat artan",
    sortPriceDesc: "Fiyat azalan",
    sortDiscountDesc: "Indirim yuksekten",
    labelMinUserScore: "Min olumlu oran (%)",
    labelMinReleaseYear: "Min cikis yili",
    allYearsOption: "Tum yillar",
    labelOnlyTradingCards: "Steam koleksiyon kartlari",
    labelOnlyAchievements: "Steam basarimlari",
    labelOnlyCloudSaves: "Steam Cloud",
    labelHideComingSoon: "Coming Soon gizle",
    applyBtn: "Uygula",
    openSearchBtn: "Steam Search Ac",
    resetBtn: "Sifirla",
    visibleText: "Gorunen",
    errMidLessThanLow: "Orta fiyat, dusuk fiyattan kucuk olamaz.",
    statusApplied: "Steam arama filtreleri uygulandi.",
    statusSaved: "Ayarlar otomatik kaydedildi.",
    statusSearchOpened: "Steam Search acildi.",
    statusReset: "Varsayilan ayarlara donuldu.",
    statusDisabled: "Prixe kapali. Steam sayfasinda islem yapilmadi."
  },
  en: {
    labelMasterEnabled: "Prixe enabled",
    appSubtitle: "Manage Steam Search filters from one place",
    labelFilterSettings: "FILTER SETTINGS",
    labelHomeFiltersSection: "SEARCH FILTERS",
    labelCheckboxFiltersSection: "CHECKBOX FILTERS",
    labelLowPrice: "Low price threshold ($)",
    labelMidPrice: "Mid price threshold ($)",
    labelEnablePriceHighlight: "Enable price highlighting",
    labelHideMixedOrWorse: "Hide Mixed and below",
    labelMaxPrice: "Max price (USD)",
    labelSpecials: "Discounted only",
    labelHidef2p: "Hide free to play",
    labelNdl: "Hide DLC",
    labelHideEarlyAccess: "Hide Early Access",
    labelMinDiscount: "Min discount (%)",
    labelReviewFilter: "Review filter",
    reviewAny: "All scores",
    reviewPositivePlus: "Positive and above",
    reviewVeryPositivePlus: "Very Positive and above",
    labelMinReviews: "Min review count",
    labelSortBy: "Sorting",
    sortDefault: "Steam default",
    sortPriceAsc: "Price ascending",
    sortPriceDesc: "Price descending",
    sortDiscountDesc: "Highest discount",
    labelMinUserScore: "Min positive ratio (%)",
    labelMinReleaseYear: "Min release year",
    allYearsOption: "All years",
    labelOnlyTradingCards: "Steam Trading Cards",
    labelOnlyAchievements: "Steam Achievements",
    labelOnlyCloudSaves: "Steam Cloud",
    labelHideComingSoon: "Hide Coming Soon",
    applyBtn: "Apply",
    openSearchBtn: "Open Search",
    resetBtn: "Reset",
    visibleText: "Visible",
    errMidLessThanLow: "Mid price cannot be less than low price.",
    statusApplied: "Steam search filters applied.",
    statusSaved: "Settings auto-saved.",
    statusSearchOpened: "Steam Search opened.",
    statusReset: "Defaults restored.",
    statusDisabled: "Prixe is disabled. No action was applied on Steam page."
  }
};

let currentLang = "tr";

const statusEl = document.getElementById("status");

function t(key) {
  return (STRINGS[currentLang] && STRINGS[currentLang][key]) || STRINGS.tr[key] || key;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value;
  }
}

function setCheckboxLabel(labelId, text) {
  const label = document.getElementById(labelId);
  if (!label) {
    return;
  }

  const input = label.querySelector("input");
  if (!input) {
    label.textContent = text;
    return;
  }

  label.textContent = "";
  label.appendChild(input);
  label.append(` ${text}`);
}

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? "#ffb3b3" : "#8ce0aa";
}

function getSettingsSourceInputs() {
  return [
    "masterEnabled",
    "maxPrice",
    "specials",
    "hidef2p",
    "ndl",
    "minDiscount",
    "minReviews",
    "minUserScore",
    "minReleaseYear",
    "sortBy",
    "reviewFilter",
    "onlyTradingCards",
    "onlyAchievements",
    "onlyCloudSaves",
    "hideComingSoon",
    "platformWin",
    "platformMac",
    "platformLinux",
    "hideEarlyAccess",
    "hideMixedOrWorse",
    "enablePriceHighlight",
    "lowPrice",
    "midPrice"
  ]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
}

function readUIState() {
  return {
    masterEnabled: !!document.getElementById("masterEnabled")?.checked,
    maxPrice: Number(document.getElementById("maxPrice").value || 0),
    specials: document.getElementById("specials").checked,
    hidef2p: document.getElementById("hidef2p").checked,
    ndl: document.getElementById("ndl").checked,
    minDiscount: Number(document.getElementById("minDiscount").value || 0),
    minReviews: Number(document.getElementById("minReviews").value || 0),
    minUserScore: Number(document.getElementById("minUserScore").value || 0),
    minReleaseYear: Number(document.getElementById("minReleaseYear").value || 0),
    sortBy: document.getElementById("sortBy").value,
    reviewFilter: document.getElementById("reviewFilter").value,
    onlyTradingCards: document.getElementById("onlyTradingCards").checked,
    onlyAchievements: document.getElementById("onlyAchievements").checked,
    onlyCloudSaves: document.getElementById("onlyCloudSaves").checked,
    hideComingSoon: document.getElementById("hideComingSoon").checked,
    platformWin: document.getElementById("platformWin").checked,
    platformMac: document.getElementById("platformMac").checked,
    platformLinux: document.getElementById("platformLinux").checked,
    hideEarlyAccess: document.getElementById("hideEarlyAccess").checked,
    hideMixedOrWorse: document.getElementById("hideMixedOrWorse").checked,
    enablePriceHighlight: document.getElementById("enablePriceHighlight").checked,
    lowPrice: Number(document.getElementById("lowPrice").value || 0),
    midPrice: Number(document.getElementById("midPrice").value || 0)
  };
}

function writeUIState(state) {
  document.getElementById("masterEnabled").checked = state.masterEnabled;
  document.getElementById("maxPrice").value = state.maxPrice;
  document.getElementById("specials").checked = state.specials;
  document.getElementById("hidef2p").checked = state.hidef2p;
  document.getElementById("ndl").checked = state.ndl;
  document.getElementById("minDiscount").value = String(state.minDiscount);
  document.getElementById("minReviews").value = String(state.minReviews);
  document.getElementById("minUserScore").value = String(state.minUserScore);
  document.getElementById("minReleaseYear").value = String(state.minReleaseYear);
  document.getElementById("sortBy").value = state.sortBy;
  document.getElementById("reviewFilter").value = state.reviewFilter;
  document.getElementById("onlyTradingCards").checked = state.onlyTradingCards;
  document.getElementById("onlyAchievements").checked = state.onlyAchievements;
  document.getElementById("onlyCloudSaves").checked = state.onlyCloudSaves;
  document.getElementById("hideComingSoon").checked = state.hideComingSoon;
  document.getElementById("platformWin").checked = state.platformWin;
  document.getElementById("platformMac").checked = state.platformMac;
  document.getElementById("platformLinux").checked = state.platformLinux;
  document.getElementById("hideEarlyAccess").checked = state.hideEarlyAccess;
  document.getElementById("hideMixedOrWorse").checked = state.hideMixedOrWorse;
  document.getElementById("enablePriceHighlight").checked = state.enablePriceHighlight;
  document.getElementById("lowPrice").value = state.lowPrice;
  document.getElementById("midPrice").value = state.midPrice;
}

function mergeState(partial) {
  return {
    ...DEFAULT_STATE,
    ...(partial || {})
  };
}

function sanitizeState(inputState) {
  const merged = mergeState(inputState);
  const numeric = (value, min = 0) => {
    const n = Number(value);
    if (!Number.isFinite(n)) {
      return min;
    }
    return Math.max(min, n);
  };

  return {
    ...merged,
    maxPrice: numeric(merged.maxPrice),
    minDiscount: numeric(merged.minDiscount),
    minReviews: numeric(merged.minReviews),
    minUserScore: numeric(merged.minUserScore),
    minReleaseYear: numeric(merged.minReleaseYear),
    lowPrice: numeric(merged.lowPrice),
    midPrice: numeric(merged.midPrice, 1),
    sortBy: ["default", "price_asc", "price_desc", "discount_desc"].includes(merged.sortBy) ? merged.sortBy : "default"
  };
}

function validatePriceThresholds(state) {
  if (state.midPrice < state.lowPrice) {
    return t("errMidLessThanLow");
  }
  return null;
}

function buildSteamSearchUrl(state, existingUrl) {
  const url = new URL(existingUrl || "https://store.steampowered.com/search/");
  if (!url.pathname.startsWith("/search")) {
    url.pathname = "/search/";
    url.search = "";
  }

  if (!state.masterEnabled) {
    url.search = "";
    return url.toString();
  }

  const setBool = (key, value) => {
    if (value) {
      url.searchParams.set(key, "1");
    } else {
      url.searchParams.delete(key);
    }
  };

  if (state.maxPrice > 0) {
    url.searchParams.set("maxprice", String(state.maxPrice));
  } else {
    url.searchParams.delete("maxprice");
  }

  setBool("specials", state.specials);
  setBool("hidef2p", state.hidef2p);
  setBool("ndl", state.ndl);

  const updateCategoryFeature = (featureId, enabled) => {
    const raw = url.searchParams.get("category2");
    let features = raw ? raw.split(",").map((item) => item.trim()).filter(Boolean) : [];
    features = features.filter((item) => /^\d+$/.test(item));

    if (enabled) {
      if (!features.includes(featureId)) {
        features.push(featureId);
      }
    } else {
      features = features.filter((item) => item !== featureId);
    }

    if (features.length > 0) {
      url.searchParams.set("category2", features.join(","));
    } else {
      url.searchParams.delete("category2");
    }
  };

  updateCategoryFeature("29", state.onlyTradingCards);
  updateCategoryFeature("22", state.onlyAchievements);
  updateCategoryFeature("23", state.onlyCloudSaves);

  return url.toString();
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function saveState(state) {
  await chrome.storage.local.set({ [STORAGE_KEYS.state]: state });
}

async function notifyContentScript(tabId, state) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      action: "steamFiltersUpdated",
      payload: state
    });
    return response || null;
  } catch (err) {
    return null;
  }
}

function formatStats(stats) {
  if (!stats || !Number.isFinite(stats.total) || !Number.isFinite(stats.visible)) {
    return "";
  }
  return ` ${t("visibleText")}: ${stats.visible}/${stats.total}`;
}

function isSteamManagedTabUrl(url) {
  if (!url || !url.startsWith("https://store.steampowered.com/")) {
    return false;
  }
  return url.startsWith("https://store.steampowered.com/search") || url.startsWith("https://store.steampowered.com/app/");
}

async function persistSettingsFromUI() {
  const state = sanitizeState(readUIState());
  writeUIState(state);

  const validationError = validatePriceThresholds(state);
  if (validationError) {
    setStatus(validationError, true);
    return;
  }

  await saveState(state);

  const tab = await getActiveTab();
  if (tab?.id && isSteamManagedTabUrl(tab.url)) {
    await notifyContentScript(tab.id, state);
  }

  setStatus(state.masterEnabled ? t("statusSaved") : t("statusDisabled"));
}

async function applyFiltersToSteam() {
  const state = sanitizeState(readUIState());
  writeUIState(state);

  const validationError = validatePriceThresholds(state);
  if (validationError) {
    setStatus(validationError, true);
    return;
  }

  await saveState(state);

  if (!state.masterEnabled) {
    const tabDisabled = await getActiveTab();
    if (tabDisabled?.id && isSteamManagedTabUrl(tabDisabled.url)) {
      await notifyContentScript(tabDisabled.id, state);
    }
    setStatus(t("statusDisabled"));
    return;
  }

  const tab = await getActiveTab();
  const isSteamSearch = !!tab?.url && tab.url.startsWith("https://store.steampowered.com/search");
  const targetUrl = buildSteamSearchUrl(state, isSteamSearch ? tab.url : "https://store.steampowered.com/search/");

  let runtimeStats = null;
  if (isSteamSearch && tab?.id) {
    if (tab.url === targetUrl) {
      runtimeStats = await notifyContentScript(tab.id, state);
    } else {
      await chrome.tabs.update(tab.id, { url: targetUrl });
    }
  } else {
    await chrome.tabs.create({ url: targetUrl });
  }

  setStatus(`${t("statusApplied")}${formatStats(runtimeStats?.stats)}`);
}

async function openSteamSearch() {
  const state = sanitizeState(readUIState());
  writeUIState(state);
  await saveState(state);

  const targetUrl = state.masterEnabled
    ? buildSteamSearchUrl(state, "https://store.steampowered.com/search/")
    : "https://store.steampowered.com/search/";

  await chrome.tabs.create({ url: targetUrl });
  setStatus(state.masterEnabled ? t("statusSearchOpened") : t("statusDisabled"));
}

async function resetState() {
  writeUIState(DEFAULT_STATE);
  await saveState(DEFAULT_STATE);

  const tab = await getActiveTab();
  if (tab?.id && tab.url && tab.url.startsWith("https://store.steampowered.com/search")) {
    await notifyContentScript(tab.id, DEFAULT_STATE);
  }

  setStatus(t("statusReset"));
}

function applyLanguage(lang) {
  currentLang = lang === "en" ? "en" : "tr";
  document.documentElement.lang = currentLang;

  setText("labelAppSubtitle", t("appSubtitle"));
  setText("labelFilterSettings", t("labelFilterSettings"));
  setText("labelHomeFiltersSection", t("labelHomeFiltersSection"));
  setText("labelCheckboxFiltersSection", t("labelCheckboxFiltersSection"));
  setText("labelLowPrice", t("labelLowPrice"));
  setText("labelMidPrice", t("labelMidPrice"));
  setText("labelMaxPrice", t("labelMaxPrice"));
  setText("labelMinDiscount", t("labelMinDiscount"));
  setText("labelReviewFilter", t("labelReviewFilter"));
  setText("reviewAny", t("reviewAny"));
  setText("reviewPositivePlus", t("reviewPositivePlus"));
  setText("reviewVeryPositivePlus", t("reviewVeryPositivePlus"));
  setText("labelMinReviews", t("labelMinReviews"));
  setText("labelSortBy", t("labelSortBy"));
  setText("sortDefault", t("sortDefault"));
  setText("sortPriceAsc", t("sortPriceAsc"));
  setText("sortPriceDesc", t("sortPriceDesc"));
  setText("sortDiscountDesc", t("sortDiscountDesc"));
  setText("labelMinUserScore", t("labelMinUserScore"));
  setText("labelMinReleaseYear", t("labelMinReleaseYear"));
  setText("allYearsOption", t("allYearsOption"));

  setCheckboxLabel("labelEnablePriceHighlight", t("labelEnablePriceHighlight"));
  setCheckboxLabel("labelHideMixedOrWorse", t("labelHideMixedOrWorse"));
  setCheckboxLabel("labelSpecials", t("labelSpecials"));
  setCheckboxLabel("labelHidef2p", t("labelHidef2p"));
  setCheckboxLabel("labelNdl", t("labelNdl"));
  setCheckboxLabel("labelHideEarlyAccess", t("labelHideEarlyAccess"));
  setCheckboxLabel("labelOnlyTradingCards", t("labelOnlyTradingCards"));
  setCheckboxLabel("labelOnlyAchievements", t("labelOnlyAchievements"));
  setCheckboxLabel("labelOnlyCloudSaves", t("labelOnlyCloudSaves"));
  setCheckboxLabel("labelHideComingSoon", t("labelHideComingSoon"));

  setText("applyBtn", t("applyBtn"));
  setText("openSearchBtn", t("openSearchBtn"));
  setText("resetBtn", t("resetBtn"));

  const languageSelect = document.getElementById("languageSelect");
  if (languageSelect) {
    languageSelect.value = currentLang;
  }

  const masterEnabled = document.getElementById("masterEnabled");
  if (masterEnabled) {
    masterEnabled.setAttribute("aria-label", t("labelMasterEnabled"));
  }
}

async function bootstrap() {
  const data = await chrome.storage.local.get([STORAGE_KEYS.state, STORAGE_KEYS.language]);
  currentLang = data[STORAGE_KEYS.language] === "en" ? "en" : "tr";

  const state = sanitizeState(data[STORAGE_KEYS.state]);
  writeUIState(state);
  applyLanguage(currentLang);

  document.getElementById("languageSelect").addEventListener("change", async (event) => {
    const lang = event.target.value === "en" ? "en" : "tr";
    await chrome.storage.local.set({ [STORAGE_KEYS.language]: lang });
    applyLanguage(lang);
  });

  document.querySelectorAll(".preset").forEach((button) => {
    button.addEventListener("click", async () => {
      const maxPrice = Number(button.dataset.maxprice || "0");
      document.getElementById("maxPrice").value = String(maxPrice);
      await persistSettingsFromUI();
    });
  });

  getSettingsSourceInputs().forEach((input) => {
    const eventName = input.tagName === "SELECT" || input.type === "checkbox" ? "change" : "input";
    input.addEventListener(eventName, () => {
      persistSettingsFromUI();
    });
  });

  document.getElementById("applyBtn").addEventListener("click", applyFiltersToSteam);
  document.getElementById("openSearchBtn").addEventListener("click", openSteamSearch);
  document.getElementById("resetBtn").addEventListener("click", resetState);
}

bootstrap();
