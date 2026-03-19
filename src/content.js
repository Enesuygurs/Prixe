(() => {
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

  const STORAGE_KEY = "steamSearchState";

  const STYLE_ID = "steam-search-helper-style";
  const APP_INFO_STYLE_ID = "prixe-app-info-style";
  const APP_ACTIONS_ID = "prixe-app-actions";
  const APP_INFO_ID = "prixe-app-info";
  const ROW_SELECTOR = "a.search_result_row";
  const ROW_CONTAINER_SELECTOR = "#search_resultsRows";

  let currentState = normalizeState(null);
  let skipMutationRefresh = false;
  let activeAppInfoRequestKey = "";
  const appInfoCache = new Map();

  function isSearchPage() {
    return window.location.pathname.startsWith("/search");
  }

  function isAppPage() {
    return window.location.pathname.startsWith("/app/");
  }

  function ensureAppInfoStyle() {
    if (document.getElementById(APP_INFO_STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = APP_INFO_STYLE_ID;
    style.textContent = `
      #appHubAppName.apphub_AppName {
        display: inline-flex !important;
        align-items: center !important;
        gap: 12px !important;
        width: auto !important;
        max-width: none !important;
      }

      #${APP_ACTIONS_ID} {
        display: inline-flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        gap: 8px !important;
        margin: 0 !important;
      }

      #${APP_ACTIONS_ID} .btnv6_blue_hoverfade.btn_medium {
        float: none !important;
        display: inline-flex !important;
        align-items: center !important;
        width: auto !important;
        margin: 0 !important;
        white-space: nowrap !important;
      }

      #${APP_ACTIONS_ID} .btnv6_blue_hoverfade.btn_medium span {
        text-transform: none;
        white-space: nowrap;
      }

      #${APP_ACTIONS_ID} .prixe-btn-steam-card {
        color: red !important;
        background: #c5960969 !important;
      }

      #${APP_ACTIONS_ID} .prixe-btn-steam-card span {
        color: #ffd760ed !important;
      }

      #${APP_ACTIONS_ID} .prixe-btn-gameplay {
        background: #ff008b5e !important;
      }

      #${APP_ACTIONS_ID} .prixe-btn-gameplay span {
        color: #ff8dcb !important;
      }

      .saleEventBannerStyle:hover {
        box-shadow: unset;
      }

    `;

    document.head.appendChild(style);
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      a.search_result_row.ssh-hidden {
        display: none !important;
      }

      a.search_result_row.ssh-price-low {
        border-left: 4px solid #40c463;
        background: linear-gradient(90deg, rgba(64, 196, 99, 0.12), transparent 30%);
      }

      a.search_result_row.ssh-price-mid {
        border-left: 4px solid #f6b73c;
        background: linear-gradient(90deg, rgba(246, 183, 60, 0.1), transparent 30%);
      }

      a.search_result_row.ssh-price-high {
        border-left: 4px solid #ef6d6d;
        background: linear-gradient(90deg, rgba(239, 109, 109, 0.1), transparent 30%);
      }

      .ssh-price-tag {
        display: inline-flex;
        margin-right: 8px;
        padding: 2px 6px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.2px;
        border: 1px solid rgba(255, 255, 255, 0.25);
      }

      .ssh-price-tag.low {
        background: rgba(64, 196, 99, 0.2);
        color: #9ff0b4;
      }

      .ssh-price-tag.mid {
        background: rgba(246, 183, 60, 0.2);
        color: #ffe0a3;
      }

      .ssh-price-tag.high {
        background: rgba(239, 109, 109, 0.2);
        color: #ffc1c1;
      }
    `;

    document.head.appendChild(style);
  }

  function normalizeState(state) {
    return {
      ...DEFAULT_STATE,
      ...(state || {})
    };
  }

  function parsePriceDollars(row) {
    const container = row.querySelector(".search_price_discount_combined");
    const finalCents = Number(container?.dataset?.priceFinal || "0");

    if (Number.isFinite(finalCents) && finalCents > 0) {
      return finalCents / 100;
    }

    const finalPriceEl = row.querySelector(".discount_final_price, .search_price");
    if (!finalPriceEl) {
      return 0;
    }

    const text = finalPriceEl.textContent || "";
    const cleaned = text.replace(/[^\d.,]/g, "").replace(",", ".");
    const amount = Number(cleaned);
    return Number.isFinite(amount) ? amount : 0;
  }

  function parseDiscountPercent(row) {
    const discountEl = row.querySelector(".search_discount_pct, .discount_pct");
    if (!discountEl) {
      return 0;
    }

    const match = (discountEl.textContent || "").match(/-?(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  function parseReviewCount(row) {
    const reviewEl = row.querySelector(".search_review_summary");
    if (!reviewEl) {
      return 0;
    }

    const tooltip = reviewEl.getAttribute("data-tooltip-html") || "";
    if (!tooltip) {
      return 0;
    }

    const tooltipText = tooltip
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ");

    const patterns = [
      /([\d.,]+)\s*adet/i,
      /([\d.,]+)\s*adet\s*kullanici\s*incelemesinden/i,
      /of the\s*([\d.,]+)\s*user reviews?/i,
      /([\d.,]+)\s*user reviews?/i
    ];

    for (const pattern of patterns) {
      const match = tooltipText.match(pattern);
      if (match?.[1]) {
        const value = Number(match[1].replace(/[^\d]/g, ""));
        if (Number.isFinite(value)) {
          return value;
        }
      }
    }

    return 0;
  }

  function parsePositivePercent(row) {
    const reviewEl = row.querySelector(".search_review_summary");
    if (!reviewEl) {
      return 0;
    }

    const tooltip = reviewEl.getAttribute("data-tooltip-html") || "";
    const text = tooltip
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ");

    const match = text.match(/%(\d{1,3})|(\d{1,3})\s*%/);
    const value = Number(match?.[1] || match?.[2] || 0);
    return Number.isFinite(value) ? value : 0;
  }

  function parseReleaseYear(row) {
    const releaseEl = row.querySelector(".search_released");
    if (!releaseEl) {
      return 0;
    }

    const text = releaseEl.textContent || "";
    const match = text.match(/(19|20)\d{2}/);
    return match ? Number(match[0]) : 0;
  }

  function getReviewCategory(row) {
    const score = row.querySelector(".search_review_summary");
    if (!score) {
      return "unknown";
    }

    const classList = score.className || "";
    if (classList.includes("overwhelmingly_positive")) return "overwhelmingly_positive";
    if (classList.includes("very_positive")) return "very_positive";
    if (classList.includes("positive")) return "positive";
    if (classList.includes("mixed")) return "mixed";
    if (classList.includes("negative") || classList.includes("mostly_negative") || classList.includes("very_negative")) return "negative";
    return "unknown";
  }

  function reviewAllowed(state, category) {
    if (state.hideMixedOrWorse && (category === "mixed" || category === "negative")) {
      return false;
    }

    if (state.reviewFilter === "positive_plus") {
      return ["positive", "very_positive", "overwhelmingly_positive"].includes(category);
    }

    if (state.reviewFilter === "very_positive_plus") {
      return ["very_positive", "overwhelmingly_positive"].includes(category);
    }

    return true;
  }

  function platformAllowed(state, row) {
    const win = !!row.querySelector(".platform_img.win");
    const mac = !!row.querySelector(".platform_img.mac");
    const linux = !!row.querySelector(".platform_img.linux");

    const allowWin = state.platformWin && win;
    const allowMac = state.platformMac && mac;
    const allowLinux = state.platformLinux && linux;

    const noPlatformInfo = !win && !mac && !linux;
    return noPlatformInfo || allowWin || allowMac || allowLinux;
  }

  function removePriceTag(row) {
    const oldTag = row.querySelector(".ssh-price-tag");
    if (oldTag) {
      oldTag.remove();
    }

    row.classList.remove("ssh-price-low", "ssh-price-mid", "ssh-price-high");
  }

  function resetRowVisualState(row) {
    row.classList.remove("ssh-hidden");
    removePriceTag(row);
  }

  function appendPriceTag(row, price, tier) {
    const titleContainer = row.querySelector(".search_name");
    if (!titleContainer) {
      return;
    }

    const tag = document.createElement("span");
    tag.className = `ssh-price-tag ${tier}`;
    tag.textContent = `$${price.toFixed(2)}`;
    titleContainer.prepend(tag);
  }

  function applyPriceMarking(row, state, price) {
    removePriceTag(row);

    if (!state.enablePriceHighlight) {
      return;
    }

    let tier = "high";
    if (price <= state.lowPrice) {
      tier = "low";
      row.classList.add("ssh-price-low");
    } else if (price <= state.midPrice) {
      tier = "mid";
      row.classList.add("ssh-price-mid");
    } else {
      row.classList.add("ssh-price-high");
    }

    appendPriceTag(row, price, tier);
  }

  function filterRow(row, state) {
    const price = parsePriceDollars(row);
    const discount = parseDiscountPercent(row);
    const reviewCount = parseReviewCount(row);
    const positivePercent = parsePositivePercent(row);
    const releaseYear = parseReleaseYear(row);
    const review = getReviewCategory(row);
    const rowText = (row.textContent || "").toLowerCase();
    const href = (row.getAttribute("href") || "").toLowerCase();

    const meetsPrice = state.maxPrice <= 0 || price <= state.maxPrice;
    const meetsDiscount = discount >= state.minDiscount;
    const meetsReviewCount = reviewCount >= state.minReviews;
    const meetsUserScore = state.minUserScore <= 0 || positivePercent >= state.minUserScore;
    const meetsReleaseYear = state.minReleaseYear <= 0 || (releaseYear > 0 && releaseYear >= state.minReleaseYear);
    const specialsOk = !state.specials || discount > 0;
    const hideF2pOk = !state.hidef2p || price > 0;
    const dlcOk = !state.ndl || (!/\bdlc\b/i.test(rowText) && !href.includes("/dlc/"));
    const comingSoonOk = !state.hideComingSoon || !/coming soon|yakinda|to be announced/.test(rowText);
    const reviewOk = reviewAllowed(state, review);
    const platformOk = platformAllowed(state, row);
    const earlyAccessOk = !state.hideEarlyAccess || !/early access|erken erisim/.test(rowText);

    const visible = meetsPrice && meetsDiscount && meetsReviewCount && meetsUserScore && meetsReleaseYear && specialsOk && hideF2pOk && dlcOk && comingSoonOk && reviewOk && platformOk && earlyAccessOk;
    row.classList.toggle("ssh-hidden", !visible);

    applyPriceMarking(row, state, price);

    return {
      row,
      visible,
      price,
      discount
    };
  }

  function sortRowsByState(container, state, rowMeta) {
    if (!container || state.sortBy === "default") {
      return;
    }

    const visibleRows = rowMeta.filter((item) => item.visible);
    const hiddenRows = rowMeta.filter((item) => !item.visible);

    const compareMap = {
      price_asc: (a, b) => a.price - b.price,
      price_desc: (a, b) => b.price - a.price,
      discount_desc: (a, b) => b.discount - a.discount
    };

    const compareFn = compareMap[state.sortBy];
    if (!compareFn) {
      return;
    }

    visibleRows.sort(compareFn);
    [...visibleRows, ...hiddenRows].forEach((item) => {
      container.appendChild(item.row);
    });
  }

  function applyAllFilters(state) {
    ensureStyle();

    const rows = Array.from(document.querySelectorAll(ROW_SELECTOR));

    if (!state.masterEnabled) {
      rows.forEach((row) => {
        resetRowVisualState(row);
      });
      return {
        total: rows.length,
        visible: rows.length,
        hidden: 0
      };
    }

    const rowMeta = rows.map((row) => filterRow(row, state));
    const container = document.querySelector(ROW_CONTAINER_SELECTOR);

    skipMutationRefresh = true;
    sortRowsByState(container, state, rowMeta);
    setTimeout(() => {
      skipMutationRefresh = false;
    }, 50);

    const visibleCount = rowMeta.filter((item) => item.visible).length;
    return {
      total: rowMeta.length,
      visible: visibleCount,
      hidden: rowMeta.length - visibleCount
    };
  }

  function getAppIdFromUrl() {
    const match = window.location.pathname.match(/\/app\/(\d+)/);
    return match?.[1] || "";
  }

  function getAppTitle() {
    const titleEl = document.getElementById("appHubAppName");
    if (!titleEl) {
      return "";
    }

    const firstTextNode = Array.from(titleEl.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
    const titleText = firstTextNode?.nodeValue || titleEl.textContent || "";
    return titleText.trim();
  }

  function applyAppHeaderSpacing() {
    const headerContent = document.querySelector(".apphub_HomeHeaderContent");
    if (!headerContent) {
      return;
    }

    headerContent.style.marginTop = "10px";
  }

  function removeAppInfo() {
    const actions = document.getElementById(APP_ACTIONS_ID);
    if (actions) {
      actions.remove();
    }

    const existing = document.getElementById(APP_INFO_ID);
    if (existing) {
      existing.remove();
    }
  }

  function createActionButton(text, href, extraClass = "") {
    const button = document.createElement("a");
    button.className = "btnv6_blue_hoverfade btn_medium";
    if (extraClass) {
      button.classList.add(extraClass);
    }
    button.href = href;
    button.target = "_blank";
    button.rel = "noopener noreferrer";

    const span = document.createElement("span");
    span.textContent = text;
    button.appendChild(span);
    return button;
  }

  function ensureAppActionsElement(titleEl, appId, title) {
    const existing = document.getElementById(APP_ACTIONS_ID);
    if (existing) {
      if (existing.parentElement !== titleEl) {
        titleEl.appendChild(existing);
      }
      return existing;
    }

    ensureAppInfoStyle();

    const actions = document.createElement("div");
    actions.id = APP_ACTIONS_ID;
    const steamCardUrl = `https://www.steamcardexchange.net/index.php?gamepage-appid-${appId}`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} Gameplay`)}`;
    actions.appendChild(createActionButton("Steam Card", steamCardUrl, "prixe-btn-steam-card"));
    actions.appendChild(createActionButton("Gameplay", youtubeUrl, "prixe-btn-gameplay"));
    titleEl.appendChild(actions);
    return actions;
  }

  function ensureAppInfoElement(titleEl) {
    const headerContainer = titleEl.closest(".apphub_HomeHeaderContent") || titleEl;
    const parentContainer = headerContainer.parentElement || titleEl.parentElement;
    if (!parentContainer) {
      return null;
    }

    const existing = document.getElementById(APP_INFO_ID);
    if (existing) {
      if (existing.parentElement !== parentContainer || existing.previousElementSibling !== headerContainer) {
        parentContainer.insertBefore(existing, headerContainer.nextSibling);
      }
      return existing;
    }

    ensureAppInfoStyle();

    const info = document.createElement("div");
    info.id = APP_INFO_ID;
    info.className = "saleEventBannerLink";
    info.innerHTML = `
      <div class="event_context">PRIXE INFO</div>
      <div class="saleEventBannerStyle saleEventBannerBig prixe-info-block">
        <div class="prixe-info-line">En dusuk fiyat: <span class="prixe-info-value" data-field="lowest-price">Yukleniyor...</span></div>
        <div class="prixe-info-line">Oyun suresi: <span class="prixe-info-value" data-field="duration">Yukleniyor...</span></div>
      </div>
    `;
    parentContainer.insertBefore(info, headerContainer.nextSibling);
    return info;
  }

  function setAppInfoValue(field, value) {
    const info = document.getElementById(APP_INFO_ID);
    if (!info) {
      return;
    }

    const target = info.querySelector(`[data-field="${field}"]`);
    if (target) {
      const safeText = typeof value === "string" && value.trim() ? value : "Bulunamadi";
      target.textContent = safeText;
    }
  }

  function setAppInfoLoading(isLoading) {
    const info = document.getElementById(APP_INFO_ID);
    if (!info) {
      return;
    }

    info.classList.toggle("is-loading", isLoading);
  }

  async function requestAppInfoFromBackground(appId, title) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "fetchPrixeAppInfo",
        payload: { appId, title }
      });

      if (!response?.ok || !response.data) {
        return {
          lowestPrice: "Alinamadi",
          duration: "Alinamadi"
        };
      }

      return {
        lowestPrice: response.data.lowestPrice,
        duration: response.data.duration
      };
    } catch (error) {
      return {
        lowestPrice: "Alinamadi",
        duration: "Alinamadi"
      };
    }
  }

  async function syncAppInfo(state) {
    if (!isAppPage()) {
      return;
    }

    if (!state.masterEnabled) {
      removeAppInfo();
      return;
    }

    const appId = getAppIdFromUrl();
    const title = getAppTitle();
    const titleEl = document.getElementById("appHubAppName");
    if (!appId || !title || !titleEl) {
      return;
    }

    applyAppHeaderSpacing();

    ensureAppActionsElement(titleEl, appId, title);
    ensureAppInfoElement(titleEl);

    const requestKey = `${appId}:${title.toLowerCase()}`;
    if (appInfoCache.has(requestKey)) {
      const cached = appInfoCache.get(requestKey);
      setAppInfoValue("lowest-price", cached.lowestPrice);
      setAppInfoValue("duration", cached.duration);
      setAppInfoLoading(false);
      return;
    }

    if (activeAppInfoRequestKey === requestKey) {
      return;
    }

    activeAppInfoRequestKey = requestKey;
    setAppInfoLoading(true);
    setAppInfoValue("lowest-price", "Yukleniyor...");
    setAppInfoValue("duration", "Yukleniyor...");

    const result = await requestAppInfoFromBackground(appId, title);
    const lowestPrice = result.lowestPrice;
    const duration = result.duration;

    if (activeAppInfoRequestKey !== requestKey) {
      return;
    }

    appInfoCache.set(requestKey, { lowestPrice, duration });
    setAppInfoValue("lowest-price", lowestPrice);
    setAppInfoValue("duration", duration);
    setAppInfoLoading(false);
  }

  function debounce(fn, waitMs) {
    let timerId = null;
    return (...args) => {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => fn(...args), waitMs);
    };
  }

  async function loadStateFromStorage() {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    return normalizeState(data[STORAGE_KEY]);
  }

  function refreshFromCurrentState() {
    if (isSearchPage()) {
      applyAllFilters(currentState);
    }

    if (isAppPage()) {
      syncAppInfo(currentState);
    }
  }

  function setupMutationObserver() {
    const debouncedRefresh = debounce(refreshFromCurrentState, 200);
    const observer = new MutationObserver(() => {
      if (skipMutationRefresh) {
        return;
      }
      debouncedRefresh();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function setupListeners() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local") {
        return;
      }

      if (changes[STORAGE_KEY]) {
        currentState = normalizeState(changes[STORAGE_KEY].newValue);
        refreshFromCurrentState();
      }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message?.action !== "steamFiltersUpdated") {
        return;
      }

      currentState = normalizeState(message.payload);
      const stats = isSearchPage() ? applyAllFilters(currentState) : null;
      if (isAppPage()) {
        syncAppInfo(currentState);
      }
      sendResponse({ ok: true, stats });
      return true;
    });
  }

  async function bootstrap() {
    currentState = await loadStateFromStorage();
    refreshFromCurrentState();
    setupMutationObserver();
    setupListeners();
  }

  bootstrap();
})();
