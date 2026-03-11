const DEFAULT_STATE = {
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
    homeTitle: "Ana Sayfa",
    checkboxTitle: "Checkbox'lar",
    settingsTitle: "Ayarlar",
    settingsHint: "Fiyat işaretleme eşikleri ve kalite filtreleri.",
    labelFilterSettings: "FİLTRE AYARLARI",
    labelLanguageSection: "DİL",
    homeHint: "Steam Search URL filtresi ve sayfa içi hızlı filtreleme.",
    labelHomeFiltersSection: "ARAMA FİLTRELERİ",
    labelCheckboxFiltersSection: "CHECKBOX FİLTRELERİ",
    labelLowPrice: "Düşük fiyat limiti ($)",
    labelMidPrice: "Orta fiyat limiti ($)",
    labelEnablePriceHighlight: "Fiyat işaretleme aktif",
    labelHideMixedOrWorse: "Mixed ve altı gizle",
    labelMaxPrice: "Max fiyat (USD)",
    labelSpecials: "Sadece indirimde",
    labelHidef2p: "Ücretsizleri gizle",
    labelNdl: "DLC gizle",
    labelHideEarlyAccess: "Early Access gizle",
    labelMinDiscount: "Min indirim (%)",
    labelReviewFilter: "İnceleme filtresi",
    reviewAny: "Tüm skorlar",
    reviewPositivePlus: "Pozitif ve üzeri",
    reviewVeryPositivePlus: "Çok pozitif ve üzeri",
    labelMinReviews: "Min inceleme adedi",
    labelSortBy: "Sıralama",
    sortDefault: "Steam varsayılan",
    sortPriceAsc: "Fiyat artan",
    sortPriceDesc: "Fiyat azalan",
    sortDiscountDesc: "İndirim yüksekten",
    labelMinUserScore: "Min olumlu oran (%)",
    labelMinReleaseYear: "Min çıkış yılı",
    allYearsOption: "Tüm yıllar",
    labelOnlyTradingCards: "Steam koleksiyon kartları",
    labelOnlyAchievements: "Steam başarımları",
    labelOnlyCloudSaves: "Steam Cloud",
    labelHideComingSoon: "Coming Soon gizle",
    applyBtn: "Uygula",
    openSearchBtn: "Steam Search Aç",
    resetBtn: "Sıfırla",
    saveSettingsBtn: "Ayar Kaydet",
    visibleText: "Görünen",
    errMidLessThanLow: "Orta fiyat, düşük fiyattan küçük olamaz.",
    statusApplied: "Steam arama filtreleri uygulandı.",
    statusSaved: "Ayarlar kaydedildi.",
    statusSearchOpened: "Steam Search açıldı.",
    statusReset: "Varsayılan ayarlara dönüldü."
  },
  en: {
    homeTitle: "Home",
    checkboxTitle: "Checkboxes",
    settingsTitle: "Settings",
    settingsHint: "Price highlight thresholds and quality filters.",
    labelFilterSettings: "FILTER SETTINGS",
    labelLanguageSection: "LANGUAGE",
    homeHint: "Steam Search URL filters and on-page quick filtering.",
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
    saveSettingsBtn: "Save Settings",
    visibleText: "Visible",
    errMidLessThanLow: "Mid price cannot be less than low price.",
    statusApplied: "Steam search filters applied.",
    statusSaved: "Settings saved.",
    statusSearchOpened: "Steam Search opened.",
    statusReset: "Defaults restored."
  }
};

let currentLang = "tr";

const homeBtn = document.getElementById("homeBtn");
const checkboxBtn = document.getElementById("checkboxBtn");
const settingsBtn = document.getElementById("settingsBtn");
const homePanel = document.getElementById("homePanel");
const checkboxPanel = document.getElementById("checkboxPanel");
const settingsPanel = document.getElementById("settingsPanel");
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

function applyLanguage(lang) {
  currentLang = lang === "en" ? "en" : "tr";
  document.documentElement.lang = currentLang;

  homeBtn.title = t("homeTitle");
  checkboxBtn.title = t("checkboxTitle");
  settingsBtn.title = t("settingsTitle");

  setText("settingsHint", t("settingsHint"));
  setText("labelFilterSettings", t("labelFilterSettings"));
  setText("labelLanguageSection", t("labelLanguageSection"));
  setText("homeHint", t("homeHint"));
  setText("labelHomeFiltersSection", t("labelHomeFiltersSection"));
  setText("labelCheckboxFiltersSection", t("labelCheckboxFiltersSection"));
  setText("labelLowPrice", t("labelLowPrice"));
  setText("labelMidPrice", t("labelMidPrice"));
  setText("labelLanguage", t("labelLanguage"));
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
  setText("saveSettingsBtn", t("saveSettingsBtn"));

  const languageSelect = document.getElementById("languageSelect");
  if (languageSelect) {
    languageSelect.value = currentLang;
  }
}

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? "#ff9a9a" : "#8ce0aa";
}

function togglePanel(panel) {
  const showHome = panel === "home";
  const showCheckbox = panel === "checkbox";
  const showSettings = panel === "settings";

  homePanel.classList.toggle("hidden", !showHome);
  checkboxPanel.classList.toggle("hidden", !showCheckbox);
  settingsPanel.classList.toggle("hidden", !showSettings);

  homeBtn.classList.toggle("active", showHome);
  checkboxBtn.classList.toggle("active", showCheckbox);
  settingsBtn.classList.toggle("active", showSettings);
}

function readUIState() {
  return {
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

function buildSteamSearchUrl(state, existingUrl) {
  const url = new URL(existingUrl || "https://store.steampowered.com/search/");
  if (!url.pathname.startsWith("/search")) {
    url.pathname = "/search/";
    url.search = "";
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

  // Steam feature IDs in category2
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
    // Content script may not be ready on this tab yet.
    return null;
  }
}

function formatStats(stats) {
  if (!stats || !Number.isFinite(stats.total) || !Number.isFinite(stats.visible)) {
    return "";
  }
  return ` ${t("visibleText")}: ${stats.visible}/${stats.total}`;
}

function validatePriceThresholds(state) {
  if (state.midPrice < state.lowPrice) {
    return t("errMidLessThanLow");
  }
  return null;
}


async function bootstrap() {
  const data = await chrome.storage.local.get([STORAGE_KEYS.state, STORAGE_KEYS.language]);
  currentLang = data[STORAGE_KEYS.language] === "en" ? "en" : "tr";

  const state = sanitizeState(data[STORAGE_KEYS.state]);
  writeUIState(state);
  applyLanguage(currentLang);

  homeBtn.addEventListener("click", () => togglePanel("home"));
  checkboxBtn.addEventListener("click", () => togglePanel("checkbox"));
  settingsBtn.addEventListener("click", () => togglePanel("settings"));

  document.getElementById("languageSelect").addEventListener("change", async (event) => {
    const lang = event.target.value === "en" ? "en" : "tr";
    await chrome.storage.local.set({ [STORAGE_KEYS.language]: lang });
    applyLanguage(lang);
  });

  document.querySelectorAll(".preset").forEach((button) => {
    button.addEventListener("click", () => {
      const maxPrice = Number(button.dataset.maxprice || "0");
      document.getElementById("maxPrice").value = String(maxPrice);
    });
  });

  document.getElementById("applyBtn").addEventListener("click", applyFiltersToSteam);
  document.getElementById("saveSettingsBtn").addEventListener("click", saveSettingsOnly);
  document.getElementById("openSearchBtn").addEventListener("click", openSteamSearch);
  document.getElementById("resetBtn").addEventListener("click", resetState);
}

bootstrap();
