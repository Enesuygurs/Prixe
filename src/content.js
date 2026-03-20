(() => {
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
  const LANGUAGE_KEY = "steamUiLanguage";

  const STYLE_ID = "steam-search-helper-style";
  const APP_INFO_STYLE_ID = "prixe-app-info-style";
  const APP_ACTIONS_ID = "prixe-app-actions";
  const APP_INFO_ID = "prixe-app-info";
  const ROW_SELECTOR = "a.search_result_row";
  const ROW_CONTAINER_SELECTOR = "#search_resultsRows";

  let currentState = normalizeState(null);
  let currentLanguage = "tr";
  let skipMutationRefresh = false;
  let activeAppInfoRequestAppId = "";
  const appInfoCache = new Map();
  const appInfoRequestedAppIds = new Set();

  const APP_TEXTS = {
    tr: {
      lowestPriceLabel: "En düşük fiyat",
      durationLabel: "Oyun süresi",
      qualityScoreLabel: "Skor",
      loading: "Yükleniyor...",
      notFound: "Bulunamadı",
      unavailable: "Alınamadı",
      sourcePrefix: "Kaynak"
    },
    en: {
      lowestPriceLabel: "Lowest price",
      durationLabel: "Playtime",
      qualityScoreLabel: "Score",
      loading: "Loading...",
      notFound: "Not found",
      unavailable: "Unavailable",
      sourcePrefix: "Source"
    }
  };

  function getAppText(key) {
    return APP_TEXTS[currentLanguage]?.[key] || APP_TEXTS.tr[key] || key;
  }

  function normalizeLanguage(lang) {
    return lang === "en" ? "en" : "tr";
  }

  function localizeInfoValue(value) {
    if (typeof value !== "string") {
      return getAppText("notFound");
    }

    const raw = value.trim();
    if (!raw) {
      return getAppText("notFound");
    }

    const trToEn = {
      "Yükleniyor...": "Loading...",
      "Bulunamadı": "Not found",
      "Alınamadı": "Unavailable"
    };

    const enToTr = {
      "Loading...": "Yükleniyor...",
      "Not found": "Bulunamadı",
      "Unavailable": "Alınamadı"
    };

    if (currentLanguage === "en") {
      if (trToEn[raw]) {
        return trToEn[raw];
      }

      let converted = raw.replace(/(\d+)\s*saat\s*\(oyuncu ort\.\)/i, "$1 hours (player avg)");
      converted = converted.replace(/(\d+)\s*saat/i, "$1 hours");
      return converted;
    }

    if (enToTr[raw]) {
      return enToTr[raw];
    }

    let converted = raw.replace(/(\d+)\s*hours\s*\(player avg\)/i, "$1 saat (oyuncu ort.)");
    converted = converted.replace(/(\d+)\s*hours/i, "$1 saat");
    return converted;
  }

  function applyAppInfoLanguage() {
    const info = document.getElementById(APP_INFO_ID);
    if (!info) {
      return;
    }

    const lowestLabel = info.querySelector('[data-source-link="lowest-price"]');
    const durationLabel = info.querySelector('[data-source-link="duration"]');
    if (lowestLabel) {
      lowestLabel.textContent = getAppText("lowestPriceLabel");
    }
    if (durationLabel) {
      durationLabel.textContent = getAppText("durationLabel");
    }

    info.querySelectorAll('.prixe-info-value[data-field]').forEach((node) => {
      node.textContent = localizeInfoValue(node.textContent || "");
    });
  }

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
        transition: background 0.2s ease, transform 0.2s ease;
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

      #${APP_ACTIONS_ID} .prixe-btn-steam-card:hover {
        background: #e3ac12b0 !important;
        transform: translateY(-1px);
      }

      #${APP_ACTIONS_ID} .prixe-btn-gameplay {
        background: #ff008b5e !important;
      }

      #${APP_ACTIONS_ID} .prixe-btn-gameplay span {
        color: #ff8dcb !important;
      }

      #${APP_ACTIONS_ID} .prixe-btn-gameplay:hover {
        background: #ff2fa17a !important;
        transform: translateY(-1px);
      }

      #${APP_ACTIONS_ID} .prixe-btn-steamdb {
        background: #0b5f9f !important;
      }

      #${APP_ACTIONS_ID} .prixe-btn-steamdb span {
        color: #c9e9ff !important;
      }

      #${APP_ACTIONS_ID} .prixe-btn-steamdb:hover {
        background: #1280d1 !important;
        transform: translateY(-1px);
      }

      .saleEventBannerStyle:hover {
        box-shadow: unset;
      }

      .prixe-info-line {
        background: #00000036;
        padding: 12px;
        margin: 4px;
        font-size: 14px;
      }

      .prixe-info-line.prixe-info-line-price,
      .prixe-info-line.prixe-info-line-duration {
        display: flex;
        align-items: stretch;
        gap: 8px;
        padding: 0;
        overflow: hidden;
      }

      .prixe-info-line.prixe-info-line-price .prixe-info-label-wrap,
      .prixe-info-line.prixe-info-line-duration .prixe-info-label-wrap {
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.65);
        padding: 12px;
      }

      .prixe-info-line.prixe-info-line-price .prixe-info-value-wrap,
      .prixe-info-line.prixe-info-line-duration .prixe-info-value-wrap {
        display: flex;
        align-items: center;
        padding: 12px 12px 12px 0;
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

      .ssh-quality-tag {
        display: inline-flex;
        margin-right: 6px;
        padding: 2px 6px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.2px;
        border: 1px solid rgba(255, 255, 255, 0.25);
      }

      .ssh-quality-tag.high {
        background: rgba(64, 196, 99, 0.2);
        color: #9ff0b4;
      }

      .ssh-quality-tag.mid {
        background: rgba(246, 183, 60, 0.2);
        color: #ffe0a3;
      }

      .ssh-quality-tag.low {
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

    // Steam can report generic "positive" class even when the tooltip says "Very Positive".
    const tooltipText = (score.getAttribute("data-tooltip-html") || "")
      .replace(/<[^>]*>/g, " ")
      .toLowerCase();

    if (classList.includes("overwhelmingly_positive") || /ezici derecede olumlu|overwhelmingly positive/i.test(tooltipText)) {
      return "overwhelmingly_positive";
    }

    if (classList.includes("very_positive") || /çok olumlu|very positive/i.test(tooltipText)) {
      return "very_positive";
    }

    if (classList.includes("mixed") || /karışık|mixed/i.test(tooltipText)) {
      return "mixed";
    }

    if (
      classList.includes("negative") ||
      classList.includes("mostly_negative") ||
      classList.includes("very_negative") ||
      /olumsuz|negative/i.test(tooltipText)
    ) {
      return "negative";
    }

    if (classList.includes("positive") || /olumlu|positive/i.test(tooltipText)) {
      return "positive";
    }

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

    const oldScoreTag = row.querySelector(".ssh-quality-tag");
    if (oldScoreTag) {
      oldScoreTag.remove();
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

  function calculateQualityScore(state, metrics) {
    const discountNorm = Math.min(Math.max(metrics.discount, 0), 90) / 90;
    const positiveNorm = Math.min(Math.max(metrics.positivePercent, 0), 100) / 100;

    const reviewNorm = Math.min(1, Math.log10((metrics.reviewCount || 0) + 1) / 4);

    const priceBaseline = state.maxPrice > 0 ? state.maxPrice : 30;
    const effectivePrice = Number.isFinite(metrics.price) ? metrics.price : priceBaseline;
    const priceNorm = effectivePrice <= 0
      ? 1
      : Math.max(0, 1 - Math.min(effectivePrice, priceBaseline * 2) / (priceBaseline * 2));

    const score = (
      discountNorm * 0.35 +
      positiveNorm * 0.3 +
      reviewNorm * 0.2 +
      priceNorm * 0.15
    ) * 100;

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  function applyQualityScoreTag(row, state, metrics) {
    const titleContainer = row.querySelector(".search_name");
    if (!titleContainer) {
      return;
    }

    const score = calculateQualityScore(state, metrics);
    const scoreTag = document.createElement("span");
    scoreTag.className = "ssh-quality-tag";
    if (score >= 70) {
      scoreTag.classList.add("high");
    } else if (score >= 45) {
      scoreTag.classList.add("mid");
    } else {
      scoreTag.classList.add("low");
    }

    scoreTag.textContent = `${getAppText("qualityScoreLabel")} ${score}`;
    titleContainer.prepend(scoreTag);
  }

  function isDlcRow(row, rowText, href) {
    if (href.includes("/dlc/")) {
      return true;
    }

    const typeText = (
      row.querySelector(".search_type, .col.search_type, .search_type.ellipsis")?.textContent ||
      row.getAttribute("data-ds-itemkey") ||
      ""
    ).toLowerCase();

    let hasDlcTag = false;
    const rawTagIds = row.getAttribute("data-ds-tagids") || "";
    if (rawTagIds) {
      try {
        const tagIds = JSON.parse(rawTagIds);
        hasDlcTag = Array.isArray(tagIds) && tagIds.map((id) => Number(id)).includes(21);
      } catch {
        hasDlcTag = false;
      }
    }

    const tooltipText = (row.querySelector(".search_review_summary")?.getAttribute("data-tooltip-html") || "")
      .replace(/<[^>]*>/g, " ")
      .toLowerCase();

    const dlcPattern = /\bdlc\b|downloadable content|i̇ndirilebilir içerik|indirilebilir içerik|ek içerik|add[-\s]?on|expansion|chapter|bölüm|season pass|soundtrack|ost|content pack|character pack|cosmetic pack/i;
    return hasDlcTag || dlcPattern.test(typeText) || dlcPattern.test(rowText) || dlcPattern.test(tooltipText);
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
    const comingSoonOk = !state.hideComingSoon || !/coming soon|yakinda|to be announced/.test(rowText);
    const reviewOk = reviewAllowed(state, review);
    const platformOk = platformAllowed(state, row);
    const earlyAccessOk = !state.hideEarlyAccess || !/early access|erken erisim/.test(rowText);

    const visible = meetsPrice && meetsDiscount && meetsReviewCount && meetsUserScore && meetsReleaseYear && specialsOk && hideF2pOk && comingSoonOk && reviewOk && platformOk && earlyAccessOk;
    row.classList.toggle("ssh-hidden", !visible);

    applyPriceMarking(row, state, price);
    applyQualityScoreTag(row, state, {
      price,
      discount,
      positivePercent,
      reviewCount
    });

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
    const steamDbUrl = `https://steamdb.info/app/${appId}/`;
    actions.appendChild(createActionButton("Steam Card", steamCardUrl, "prixe-btn-steam-card"));
    actions.appendChild(createActionButton("Gameplay", youtubeUrl, "prixe-btn-gameplay"));
    actions.appendChild(createActionButton("SteamDB", steamDbUrl, "prixe-btn-steamdb"));
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
        <div class="prixe-info-line prixe-info-line-price">
          <div class="prixe-info-label-wrap"><a class="prixe-info-source-link" data-source-link="lowest-price" href="https://www.cheapshark.com" target="_blank" rel="noopener noreferrer">${getAppText("lowestPriceLabel")}</a></div>
          <div class="prixe-info-value-wrap"><span class="prixe-info-value" data-field="lowest-price">${getAppText("loading")}</span></div>
        </div>
        <div class="prixe-info-line prixe-info-line-duration">
          <div class="prixe-info-label-wrap"><a class="prixe-info-source-link" data-source-link="duration" href="https://howlongtobeat.com" target="_blank" rel="noopener noreferrer">${getAppText("durationLabel")}</a></div>
          <div class="prixe-info-value-wrap"><span class="prixe-info-value" data-field="duration">${getAppText("loading")}</span></div>
        </div>
      </div>
    `;
    parentContainer.insertBefore(info, headerContainer.nextSibling);
    return info;
  }

  function setAppInfoSourceLink(field, url, sourceName) {
    const info = document.getElementById(APP_INFO_ID);
    if (!info) {
      return;
    }

    const link = info.querySelector(`[data-source-link="${field}"]`);
    if (!link) {
      return;
    }

    const safeUrl = typeof url === "string" && url.trim() ? url : "#";
    const safeTitle = sourceName ? `${getAppText("sourcePrefix")}: ${sourceName}` : getAppText("sourcePrefix");

    if (link.getAttribute("href") !== safeUrl) {
      link.href = safeUrl;
    }

    if (link.getAttribute("title") !== safeTitle) {
      link.title = safeTitle;
    }
  }

  function setAppInfoValue(field, value) {
    const info = document.getElementById(APP_INFO_ID);
    if (!info) {
      return;
    }

    const target = info.querySelector(`[data-field="${field}"]`);
    if (target) {
      const safeText = typeof value === "string" && value.trim() ? value : getAppText("notFound");
      const localizedText = localizeInfoValue(safeText);
      if (target.textContent !== localizedText) {
        target.textContent = localizedText;
      }
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
          lowestPrice: getAppText("unavailable"),
          duration: getAppText("unavailable"),
          lowestPriceSourceUrl: "https://www.cheapshark.com",
          lowestPriceSourceName: "CheapShark",
          durationSourceUrl: "https://howlongtobeat.com",
          durationSourceName: "HowLongToBeat"
        };
      }

      return {
        lowestPrice: response.data.lowestPrice,
        duration: response.data.duration,
        lowestPriceSourceUrl: response.data.lowestPriceSourceUrl,
        lowestPriceSourceName: response.data.lowestPriceSourceName,
        durationSourceUrl: response.data.durationSourceUrl,
        durationSourceName: response.data.durationSourceName
      };
    } catch (error) {
      return {
        lowestPrice: getAppText("unavailable"),
        duration: getAppText("unavailable"),
        lowestPriceSourceUrl: "https://www.cheapshark.com",
        lowestPriceSourceName: "CheapShark",
        durationSourceUrl: "https://howlongtobeat.com",
        durationSourceName: "HowLongToBeat"
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

    if (appInfoCache.has(appId)) {
      const cached = appInfoCache.get(appId);
      setAppInfoValue("lowest-price", cached.lowestPrice);
      setAppInfoValue("duration", cached.duration);
      setAppInfoSourceLink("lowest-price", cached.lowestPriceSourceUrl, cached.lowestPriceSourceName);
      setAppInfoSourceLink("duration", cached.durationSourceUrl, cached.durationSourceName);
      setAppInfoLoading(false);
      return;
    }

    if (appInfoRequestedAppIds.has(appId) || activeAppInfoRequestAppId === appId) {
      return;
    }

    appInfoRequestedAppIds.add(appId);
    activeAppInfoRequestAppId = appId;
    setAppInfoLoading(true);
    setAppInfoValue("lowest-price", getAppText("loading"));
    setAppInfoValue("duration", getAppText("loading"));

    try {
      const result = await requestAppInfoFromBackground(appId, title);
      if (activeAppInfoRequestAppId !== appId) {
        return;
      }

      const payload = {
        lowestPrice: result.lowestPrice,
        duration: result.duration,
        lowestPriceSourceUrl: result.lowestPriceSourceUrl,
        lowestPriceSourceName: result.lowestPriceSourceName,
        durationSourceUrl: result.durationSourceUrl,
        durationSourceName: result.durationSourceName
      };

      appInfoCache.set(appId, payload);
      setAppInfoValue("lowest-price", payload.lowestPrice);
      setAppInfoValue("duration", payload.duration);
      setAppInfoSourceLink("lowest-price", payload.lowestPriceSourceUrl, payload.lowestPriceSourceName);
      setAppInfoSourceLink("duration", payload.durationSourceUrl, payload.durationSourceName);
      setAppInfoLoading(false);
    } finally {
      if (activeAppInfoRequestAppId === appId) {
        activeAppInfoRequestAppId = "";
      }
    }
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
    const data = await chrome.storage.local.get([STORAGE_KEY, LANGUAGE_KEY]);
    return {
      state: normalizeState(data[STORAGE_KEY]),
      language: normalizeLanguage(data[LANGUAGE_KEY])
    };
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

      if (isAppPage()) {
        const appId = getAppIdFromUrl();
        const hasInfo = !!document.getElementById(APP_INFO_ID);
        const hasActions = !!document.getElementById(APP_ACTIONS_ID);
        const alreadyResolved = appInfoRequestedAppIds.has(appId) || appInfoCache.has(appId);

        // App page data is intended to be fetched once. Avoid repeated DOM churn.
        if (alreadyResolved && hasInfo && hasActions) {
          return;
        }
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

      if (changes[LANGUAGE_KEY]) {
        currentLanguage = normalizeLanguage(changes[LANGUAGE_KEY].newValue);
        applyAppInfoLanguage();
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
    const loaded = await loadStateFromStorage();
    currentState = loaded.state;
    currentLanguage = loaded.language;
    refreshFromCurrentState();
    setupMutationObserver();
    setupListeners();
  }

  bootstrap();
})();
