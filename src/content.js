(() => {
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

  const STORAGE_KEY = "steamSearchState";

  const STYLE_ID = "steam-search-helper-style";
  const ROW_SELECTOR = "a.search_result_row";
  const ROW_CONTAINER_SELECTOR = "#search_resultsRows";

  let currentState = normalizeState(null);
  let skipMutationRefresh = false;

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
    applyAllFilters(currentState);
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
        applyAllFilters(currentState);
      }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message?.action !== "steamFiltersUpdated") {
        return;
      }

      currentState = normalizeState(message.payload);
      const stats = applyAllFilters(currentState);
      sendResponse({ ok: true, stats });
      return true;
    });
  }

  async function bootstrap() {
    currentState = await loadStateFromStorage();
    applyAllFilters(currentState);
    setupMutationObserver();
    setupListeners();
  }

  bootstrap();
})();
