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
