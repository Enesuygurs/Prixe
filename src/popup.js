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
