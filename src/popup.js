const DEFAULT_STATE = {
  masterEnabled: true,
  maxPrice: 5,
  specials: true,
  hidef2p: true,
  category1: 998,
  minDiscount: 0,
  minReviews: 0,
  minUserScore: 0,
  minReleaseYear: 0,
  sortBy: "default",
  reviewFilter: "any",
  onlyTradingCards: false,
  onlyCloudSaves: false,
  hideComingSoon: false,
  hideEarlyAccess: false,
  hideMixedOrWorse: false,
  enablePriceHighlight: true,
  lowPrice: 5,
  midPrice: 15
};

const STORAGE_KEYS = {
  state: "steamSearchState",
  language: "steamUiLanguage",
  profiles: "prixeProfiles"
};

let cachedProfiles = {};

const STRINGS = {
  tr: {
    labelMasterEnabled: "Prixe aktif",
    appSubtitle: "Steam Arama filtrelerini tek noktadan yönet",
    labelSettingsSection: "GENEL AYARLAR",
    labelLanguage: "Dil",
    homeBtnTitle: "Ana Sayfa",
    profilesBtnTitle: "Profiller",
    settingsBtnTitle: "Ayarlar",
    labelFilterSettings: "FİLTRE AYARLARI",
    labelHomeFiltersSection: "ARAMA FİLTRELERİ",
    labelCheckboxFiltersSection: "ONAY KUTUSU FİLTRELERİ",
    labelLowPrice: "Düşük fiyat limiti ($)",
    labelMidPrice: "Orta fiyat limiti ($)",
    labelEnablePriceHighlight: "Fiyat işaretleme aktif",
    labelHideMixedOrWorse: "Mixed ve altı gizle",
    labelMaxPrice: "Max fiyat (USD)",
    labelCategory1: "Kategori",
    labelSpecials: "Sadece indirimde",
    labelHidef2p: "Ücretsizleri gizle",
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
    labelOnlyCloudSaves: "Steam Cloud",
    labelHideComingSoon: "Coming Soon gizle",
    labelProfilesSection: "FAVORİ PROFİLLER",
    profileLoadBtn: "Yükle",
    profileSaveBtn: "Güncelle",
    profileDeleteBtn: "Sil",
    profileAddBtn: "Ekle",
    profileNamePlaceholder: "Profil adı...",
    noProfilesFound: "Kayıtlı profil bulunmuyor.",
    categoryGames: "Oyunlar",
    categorySoftware: "Yazılım",
    categoryDlc: "İndirilebilir İçerik",
    categoryDemos: "Demolar",
    categorySoundtracks: "Oyun Müzikleri",
    categoryPlaytest: "Playtest",
    categoryVideos: "Videolar",
    categoryMods: "Modlar",
    categoryHardware: "Donanım",
    applyBtn: "Uygula",
    openSearchBtn: "Steam Aramayı Aç",
    resetBtn: "Sıfırla",
    visibleText: "Görünen",
    errMidLessThanLow: "Orta fiyat, düşük fiyattan küçük olamaz.",
    statusApplied: "Steam arama filtreleri uygulandı.",
    statusSaved: "Ayarlar otomatik kaydedildi.",
    statusProfileLoaded: "Profil yüklendi: {name}",
    statusProfileSaved: "Profil kaydedildi: {name}",
    statusSearchOpened: "Steam Arama açıldı.",
    statusReset: "Varsayılan ayarlara dönüldü.",
    statusDisabled: "Prixe kapalı. Steam sayfasında işlem yapılmadı."
  },
  en: {
    labelMasterEnabled: "Prixe enabled",
    appSubtitle: "Manage Steam Search filters from one place",
    labelSettingsSection: "GENERAL SETTINGS",
    labelLanguage: "Language",
    homeBtnTitle: "Home",
    profilesBtnTitle: "Profiles",
    settingsBtnTitle: "Settings",
    labelFilterSettings: "FILTER SETTINGS",
    labelHomeFiltersSection: "SEARCH FILTERS",
    labelCheckboxFiltersSection: "CHECKBOX FILTERS",
    labelLowPrice: "Low price threshold ($)",
    labelMidPrice: "Mid price threshold ($)",
    labelEnablePriceHighlight: "Enable price highlighting",
    labelHideMixedOrWorse: "Hide Mixed and below",
    labelMaxPrice: "Max price (USD)",
    labelCategory1: "Category",
    labelSpecials: "Discounted only",
    labelHidef2p: "Hide free to play",
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
    labelOnlyCloudSaves: "Steam Cloud",
    labelHideComingSoon: "Hide Coming Soon",
    labelProfilesSection: "FAVORITE PROFILES",
    profileLoadBtn: "Load",
    profileSaveBtn: "Update",
    profileDeleteBtn: "Delete",
    profileAddBtn: "Add",
    profileNamePlaceholder: "Profile name...",
    noProfilesFound: "No saved profiles.",
    categoryGames: "Games",
    categorySoftware: "Software",
    categoryDlc: "Downloadable Content",
    categoryDemos: "Demos",
    categorySoundtracks: "Game Soundtracks",
    categoryPlaytest: "Playtest",
    categoryVideos: "Videos",
    categoryMods: "Mods",
    categoryHardware: "Hardware",
    applyBtn: "Apply",
    openSearchBtn: "Open Search",
    resetBtn: "Reset",
    visibleText: "Visible",
    errMidLessThanLow: "Mid price cannot be less than low price.",
    statusApplied: "Steam search filters applied.",
    statusSaved: "Settings auto-saved.",
    statusProfileLoaded: "Profile loaded: {name}",
    statusProfileSaved: "Profile saved: {name}",
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
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.style.color = isError ? "#ffb3b3" : "#8ce0aa";
}

function getSettingsSourceInputs() {
  return [
    "masterEnabled",
    "maxPrice",
    "category1",
    "specials",
    "hidef2p",
    "minDiscount",
    "minReviews",
    "minUserScore",
    "minReleaseYear",
    "sortBy",
    "reviewFilter",
    "onlyTradingCards",
    "onlyCloudSaves",
    "hideComingSoon",
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
    category1: Number(document.getElementById("category1").value || 998),
    specials: document.getElementById("specials").checked,
    hidef2p: document.getElementById("hidef2p").checked,
    minDiscount: Number(document.getElementById("minDiscount").value || 0),
    minReviews: Number(document.getElementById("minReviews").value || 0),
    minUserScore: Number(document.getElementById("minUserScore").value || 0),
    minReleaseYear: Number(document.getElementById("minReleaseYear").value || 0),
    sortBy: document.getElementById("sortBy").value,
    reviewFilter: document.getElementById("reviewFilter").value,
    onlyTradingCards: document.getElementById("onlyTradingCards").checked,
    onlyCloudSaves: document.getElementById("onlyCloudSaves").checked,
    hideComingSoon: document.getElementById("hideComingSoon").checked,
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
  document.getElementById("category1").value = String(state.category1);
  document.getElementById("specials").checked = state.specials;
  document.getElementById("hidef2p").checked = state.hidef2p;
  document.getElementById("minDiscount").value = String(state.minDiscount);
  document.getElementById("minReviews").value = String(state.minReviews);
  document.getElementById("minUserScore").value = String(state.minUserScore);
  document.getElementById("minReleaseYear").value = String(state.minReleaseYear);
  document.getElementById("sortBy").value = state.sortBy;
  document.getElementById("reviewFilter").value = state.reviewFilter;
  document.getElementById("onlyTradingCards").checked = state.onlyTradingCards;
  document.getElementById("onlyCloudSaves").checked = state.onlyCloudSaves;
  document.getElementById("hideComingSoon").checked = state.hideComingSoon;
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
    category1: [998, 994, 21, 10, 990, 989, 992, 997, 993].includes(Number(merged.category1))
      ? Number(merged.category1)
      : 998,
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
  const url = new URL("https://store.steampowered.com/search/");

  // Preserve only search term from current URL; drop all other sticky params.
  if (existingUrl) {
    try {
      const currentUrl = new URL(existingUrl);
      const term = currentUrl.searchParams.get("term");
      if (term) {
        url.searchParams.set("term", term);
      }
    } catch {
      // Ignore malformed URL and continue with clean base URL.
    }
  }

  // Remove locale params so we always generate a clean URL.
  url.searchParams.delete("l");
  url.searchParams.delete("supportedlang");

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

  url.searchParams.set("category1", String(state.category1));

  setBool("specials", state.specials);
  setBool("hidef2p", state.hidef2p);
  // Keep Steam's ndl flag to match expected search behavior in your account.
  url.searchParams.set("ndl", "1");

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

async function saveProfiles(profiles) {
  await chrome.storage.local.set({ [STORAGE_KEYS.profiles]: profiles });
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

async function loadProfile(profileName) {
  const profileState = sanitizeState(cachedProfiles[profileName] || DEFAULT_STATE);
  writeUIState(profileState);
  await persistSettingsFromUI();
  setStatus(t("statusProfileLoaded").replace("{name}", profileName));
}

async function saveCurrentAsProfile(profileName) {
  const state = sanitizeState(readUIState());
  cachedProfiles[profileName] = state;
  await saveProfiles(cachedProfiles);
  renderProfiles();
  setStatus(t("statusProfileSaved").replace("{name}", profileName));
}

async function deleteProfile(profileName) {
  delete cachedProfiles[profileName];
  await saveProfiles(cachedProfiles);
  renderProfiles();
  setStatus(t("statusProfileDeleted").replace("{name}", profileName));
}

function renderProfiles() {
  const profileList = document.getElementById("profileList");
  if (!profileList) return;
  profileList.innerHTML = "";

  const profileKeys = Object.keys(cachedProfiles);

  if (profileKeys.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.style.color = "#93a9bc";
    emptyMsg.style.fontSize = "12px";
    emptyMsg.style.textAlign = "center";
    emptyMsg.style.padding = "10px 0";
    emptyMsg.textContent = t("noProfilesFound");
    profileList.appendChild(emptyMsg);
    return;
  }

  profileKeys.forEach((profileName) => {
    const row = document.createElement("div");
    row.className = "profile-row";

    const nameSpan = document.createElement("span");
    nameSpan.className = "profile-name";
    nameSpan.textContent = profileName;

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "profile-actions";

    const loadBtn = document.createElement("button");
    loadBtn.className = "chip-btn profile-load";
    loadBtn.textContent = t("profileLoadBtn");
    loadBtn.addEventListener("click", async () => {
      await loadProfile(profileName);
    });

    const updateBtn = document.createElement("button");
    updateBtn.className = "chip-btn profile-save";
    updateBtn.textContent = t("profileSaveBtn");
    updateBtn.addEventListener("click", async () => {
      await saveCurrentAsProfile(profileName);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "chip-btn profile-delete";
    deleteBtn.textContent = t("profileDeleteBtn");
    deleteBtn.style.color = "#ffb3b3";
    deleteBtn.addEventListener("click", async () => {
      await deleteProfile(profileName);
    });

    actionsDiv.appendChild(loadBtn);
    actionsDiv.appendChild(updateBtn);
    actionsDiv.appendChild(deleteBtn);

    row.appendChild(nameSpan);
    row.appendChild(actionsDiv);
    profileList.appendChild(row);
  });
}

function applyLanguage(lang) {
  currentLang = lang === "en" ? "en" : "tr";
  document.documentElement.lang = currentLang;

  setText("labelAppSubtitle", t("appSubtitle"));
  setText("labelSettingsSection", t("labelSettingsSection"));
  setText("labelLanguage", t("labelLanguage"));
  document.getElementById("homeBtn").title = t("homeBtnTitle");
  document.getElementById("profilesBtn").title = t("profilesBtnTitle");
  document.getElementById("settingsBtn").title = t("settingsBtnTitle");
  setText("labelFilterSettings", t("labelFilterSettings"));
  setText("labelProfilesSection", t("labelProfilesSection"));
  setText("labelHomeFiltersSection", t("labelHomeFiltersSection"));
  setText("labelCheckboxFiltersSection", t("labelCheckboxFiltersSection"));
  setText("labelLowPrice", t("labelLowPrice"));
  setText("labelMidPrice", t("labelMidPrice"));
  setText("labelMaxPrice", t("labelMaxPrice"));
  setText("labelCategory1", t("labelCategory1"));
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
  setText("categoryGames", t("categoryGames"));
  setText("categorySoftware", t("categorySoftware"));
  setText("categoryDlc", t("categoryDlc"));
  setText("categoryDemos", t("categoryDemos"));
  setText("categorySoundtracks", t("categorySoundtracks"));
  setText("categoryPlaytest", t("categoryPlaytest"));
  setText("categoryVideos", t("categoryVideos"));
  setText("categoryMods", t("categoryMods"));
  setText("categoryHardware", t("categoryHardware"));

  const newProfileNameInput = document.getElementById("newProfileName");
  if (newProfileNameInput) {
    newProfileNameInput.placeholder = t("profileNamePlaceholder");
  }
  
  const btnSaveNewProfile = document.getElementById("btnSaveNewProfile");
  if (btnSaveNewProfile) {
    btnSaveNewProfile.textContent = t("profileAddBtn");
  }

  // Reload profiles with new language
  renderProfiles();

  setCheckboxLabel("labelEnablePriceHighlight", t("labelEnablePriceHighlight"));
  setCheckboxLabel("labelHideMixedOrWorse", t("labelHideMixedOrWorse"));
  setCheckboxLabel("labelSpecials", t("labelSpecials"));
  setCheckboxLabel("labelHidef2p", t("labelHidef2p"));
  setCheckboxLabel("labelHideEarlyAccess", t("labelHideEarlyAccess"));
  setCheckboxLabel("labelOnlyTradingCards", t("labelOnlyTradingCards"));
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
  const data = await chrome.storage.local.get([STORAGE_KEYS.state, STORAGE_KEYS.language, STORAGE_KEYS.profiles]);
  currentLang = data[STORAGE_KEYS.language] === "en" ? "en" : "tr";
  cachedProfiles = data[STORAGE_KEYS.profiles] || {};

  const state = sanitizeState(data[STORAGE_KEYS.state]);
  writeUIState(state);
  applyLanguage(currentLang);

  const btnSaveNewProfile = document.getElementById("btnSaveNewProfile");
  const newProfileNameInput = document.getElementById("newProfileName");
  if (btnSaveNewProfile && newProfileNameInput) {
    btnSaveNewProfile.addEventListener("click", async () => {
      const name = newProfileNameInput.value.trim();
      if (!name) return;
      await saveCurrentAsProfile(name);
      newProfileNameInput.value = "";
    });
  }

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

    // TAB LOGIC
  const homeBtn = document.getElementById("homeBtn");
  const profilesBtn = document.getElementById("profilesBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  
  const homePanel = document.getElementById("homePanel");
  const profilesPanel = document.getElementById("profilesPanel");
  const settingsPanel = document.getElementById("settingsPanel");
  
  const tabBtns = document.querySelectorAll(".tab-btn");

  function setActiveTab(activeBtn) {
    tabBtns.forEach(btn => btn.classList.remove("active"));
    activeBtn.classList.add("active");
  }

  homeBtn.addEventListener("click", () => {
    setActiveTab(homeBtn);
    homePanel.classList.remove("hidden");
    profilesPanel.classList.add("hidden");
    settingsPanel.classList.add("hidden");
  });

  profilesBtn.addEventListener("click", () => {
    setActiveTab(profilesBtn);
    profilesPanel.classList.remove("hidden");
    homePanel.classList.add("hidden");
    settingsPanel.classList.add("hidden");
  });

  settingsBtn.addEventListener("click", () => {
    setActiveTab(settingsBtn);
    settingsPanel.classList.remove("hidden");
    homePanel.classList.add("hidden");
    profilesPanel.classList.add("hidden");
  });}

bootstrap();








