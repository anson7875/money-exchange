/**
 * 匯率即時通 RatePulse — 多國貨幣即時換算、算式計數機 & 歷史走勢圖
 */

const CURRENCY_CATALOG = [
  { code: "HKD", name: "港幣", en: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰", decimals: 2 },
  { code: "JPY", name: "日元", en: "Japanese Yen", symbol: "¥", flag: "🇯🇵", decimals: 0, per100InHKD: true },
  { code: "TWD", name: "新台幣", en: "New Taiwan Dollar", symbol: "NT$", flag: "🇹🇼", decimals: 2 },
  { code: "USD", name: "美金", en: "US Dollar", symbol: "US$", flag: "🇺🇸", decimals: 2 },
  { code: "CNY", name: "人民幣", en: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", decimals: 2 },
  { code: "EUR", name: "歐元", en: "Euro", symbol: "€", flag: "🇪🇺", decimals: 2 },
  { code: "GBP", name: "英鎊", en: "British Pound", symbol: "£", flag: "🇬🇧", decimals: 2 },
  { code: "KRW", name: "韓元", en: "South Korean Won", symbol: "₩", flag: "🇰🇷", decimals: 0, per100InHKD: true },
  { code: "THB", name: "泰銖", en: "Thai Baht", symbol: "฿", flag: "🇹🇭", decimals: 2 },
  { code: "SGD", name: "新加坡元", en: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", decimals: 2 },
  { code: "AUD", name: "澳元", en: "Australian Dollar", symbol: "A$", flag: "🇦🇺", decimals: 2 },
  { code: "CAD", name: "加元", en: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", decimals: 2 },
  { code: "CHF", name: "瑞士法郎", en: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", decimals: 2 },
  { code: "MYR", name: "馬來西亞令吉", en: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", decimals: 2 },
  { code: "NZD", name: "紐西蘭元", en: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿", decimals: 2 },
  { code: "PHP", name: "菲律賓披索", en: "Philippine Peso", symbol: "₱", flag: "🇵🇭", decimals: 2 },
  { code: "VND", name: "越南盾", en: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳", decimals: 0, per100InHKD: true },
  { code: "IDR", name: "印尼盾", en: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩", decimals: 0, per100InHKD: true },
  { code: "MOP", name: "澳門幣", en: "Macanese Pataca", symbol: "MOP$", flag: "🇲🇴", decimals: 2 },
  { code: "AED", name: "阿聯酋迪拉姆", en: "UAE Dirham", symbol: "AED", flag: "🇦🇪", decimals: 2 },
  { code: "INR", name: "印度盧比", en: "Indian Rupee", symbol: "₹", flag: "🇮🇳", decimals: 2 },
  { code: "SEK", name: "瑞典克朗", en: "Swedish Krona", symbol: "kr", flag: "🇸🇪", decimals: 2 },
  { code: "NOK", name: "挪威克朗", en: "Norwegian Krone", symbol: "kr", flag: "🇳🇴", decimals: 2 },
  { code: "DKK", name: "丹麥克朗", en: "Danish Krone", symbol: "kr", flag: "🇩🇰", decimals: 2 },
  { code: "PLN", name: "波蘭茲羅提", en: "Polish Zloty", symbol: "zł", flag: "🇵🇱", decimals: 2 },
  { code: "TRY", name: "土耳其里拉", en: "Turkish Lira", symbol: "₺", flag: "🇹🇷", decimals: 2 },
  { code: "MXN", name: "墨西哥披索", en: "Mexican Peso", symbol: "Mex$", flag: "🇲🇽", decimals: 2 },
  { code: "BRL", name: "巴西雷亞爾", en: "Brazilian Real", symbol: "R$", flag: "🇧🇷", decimals: 2 },
  { code: "ZAR", name: "南非蘭特", en: "South African Rand", symbol: "R", flag: "🇿🇦", decimals: 2 },
  { code: "SAR", name: "沙烏地里亞爾", en: "Saudi Riyal", symbol: "SAR", flag: "🇸🇦", decimals: 2 }
];

const CURRENCY_MAP = Object.fromEntries(CURRENCY_CATALOG.map((c) => [c.code, c]));
const DEFAULT_PINNED = ["HKD", "JPY", "TWD", "USD", "CNY"];

// ECB currencies supported by Frankfurter API for single-request time series
const FRANKFURTER_SUPPORTED = new Set([
  "AUD", "BRL", "CAD", "CHF", "CNY", "DKK", "EUR", "GBP", "HKD", "IDR",
  "INR", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PLN", "SEK",
  "SGD", "THB", "TRY", "USD", "ZAR"
]);

// Initial fallback rates relative to 1 USD (used before network finishes or offline)
const FALLBACK_USD_RATES = {
  USD: 1,
  HKD: 7.845,
  JPY: 158.5,
  TWD: 32.96,
  CNY: 6.688,
  EUR: 0.925,
  GBP: 0.785,
  KRW: 1395,
  THB: 34.5,
  SGD: 1.34,
  AUD: 1.52,
  CAD: 1.39,
  CHF: 0.88,
  MYR: 4.42,
  NZD: 1.66,
  PHP: 58.2,
  VND: 25400,
  IDR: 15800,
  MOP: 8.08,
  AED: 3.6725,
  INR: 84.3,
  SEK: 10.7,
  NOK: 11.0,
  DKK: 6.9,
  PLN: 4.02,
  TRY: 34.4,
  MXN: 20.1,
  BRL: 5.75,
  ZAR: 18.1,
  SAR: 3.75
};

const STORAGE_KEYS = {
  PINNED: "ratepulse_pinned_v1",
  BASE_CODE: "ratepulse_base_code_v1",
  BASE_EXPR: "ratepulse_base_expr_v1",
  RATES_CACHE: "ratepulse_rates_cache_v1",
  THEME: "ratepulse_theme_v1",
  CHART_PAIR: "ratepulse_chart_pair_v1",
  LOCK_AMOUNT: "ratepulse_lock_amount_v1"
};

const initialBaseCode = localStorage.getItem(STORAGE_KEYS.BASE_CODE) || "HKD";
const initialRawExpr = localStorage.getItem(STORAGE_KEYS.BASE_EXPR) || "100";

const state = {
  pinned: loadPinnedCurrencies(),
  baseCode: initialBaseCode,
  rawExpression: initialRawExpr,
  baseAmount: 100,
  anchorCode: initialBaseCode,
  anchorAmount: 100,
  lockInputAmount: localStorage.getItem(STORAGE_KEYS.LOCK_AMOUNT) === "true",
  ratesInUSD: { ...FALLBACK_USD_RATES },
  lastUpdated: null,
  apiLatestDate: null,
  chartFrom: "HKD",
  chartTo: "JPY",
  chartDays: 7,
  chartPer100: false,
  chartSeries: [],
  historyCache: {}
};

// Ensure baseCode is in pinned
if (!state.pinned.includes(state.baseCode)) {
  state.baseCode = state.pinned[0] || "HKD";
  state.anchorCode = state.baseCode;
}

const initEval = evaluateMathExpression(state.rawExpression);
if (initEval.valid && initEval.value !== null) {
  state.baseAmount = initEval.value;
  state.anchorAmount = initEval.value;
}

// Restore saved chart pair if valid
try {
  const savedPair = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHART_PAIR) || "null");
  if (savedPair && CURRENCY_MAP[savedPair.from] && CURRENCY_MAP[savedPair.to]) {
    state.chartFrom = savedPair.from;
    state.chartTo = savedPair.to;
    state.chartPer100 = Boolean(savedPair.per100);
  }
} catch (_) {}

/* ==========================================================================
   Utility & Expression Evaluator
   ========================================================================== */

function loadPinnedCurrencies() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.PINNED) || "null");
    if (Array.isArray(raw) && raw.length >= 2) {
      const valid = raw.filter((code) => CURRENCY_MAP[code]);
      if (valid.length >= 2) return valid;
    }
  } catch (_) {}
  return [...DEFAULT_PINNED];
}

function savePinnedCurrencies() {
  localStorage.setItem(STORAGE_KEYS.PINNED, JSON.stringify(state.pinned));
}

/**
 * Safely evaluates basic arithmetic expressions like "1500+300*0.9"
 */
function evaluateMathExpression(inputStr) {
  if (!inputStr || typeof inputStr !== "string") {
    return { value: 0, isExpression: false, valid: true };
  }
  const cleaned = inputStr
    .replace(/,/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/＋/g, "+")
    .trim();

  if (!cleaned) {
    return { value: 0, isExpression: false, valid: true };
  }

  // Plain number check
  if (/^[+-]?\d*(\.\d+)?$/.test(cleaned)) {
    const num = parseFloat(cleaned);
    return {
      value: Number.isFinite(num) ? num : 0,
      isExpression: false,
      valid: true
    };
  }

  // Only allow digits, operators, decimal points, parentheses, spaces
  if (!/^[0-9+\-*/().\s]+$/.test(cleaned)) {
    return { value: null, isExpression: true, valid: false };
  }

  // If ends with an operator while user is still typing, try evaluating without trailing operator
  const trimmedTrailingOp = cleaned.replace(/[+\-*/.(]+$/, "");
  const candidate = trimmedTrailingOp || "0";

  try {
    // Safe recursive-descent / Function evaluation after strict character whitelist
    const result = Function(`"use strict"; return (${candidate});`)();
    if (typeof result === "number" && Number.isFinite(result)) {
      return {
        value: Math.max(0, result),
        isExpression: /[+\-*/()]/.test(cleaned),
        valid: true
      };
    }
  } catch (_) {}

  return { value: null, isExpression: true, valid: false };
}

/**
 * Convert amount from `fromCode` to `toCode`
 */
function convertCurrency(amount, fromCode, toCode) {
  if (fromCode === toCode) return amount;
  const fromRate = state.ratesInUSD[fromCode] || 1;
  const toRate = state.ratesInUSD[toCode] || 1;
  return (amount / fromRate) * toRate;
}

/**
 * Get 1 unit exchange rate from `fromCode` to `toCode`
 */
function getUnitRate(fromCode, toCode) {
  return convertCurrency(1, fromCode, toCode);
}

/**
 * Format currency value with appropriate decimal places and thousand separators
 */
function formatCurrencyAmount(value, code, forInput = false) {
  if (!Number.isFinite(value)) return "0";
  const meta = CURRENCY_MAP[code] || { decimals: 2 };
  let decimals = meta.decimals;

  if (value > 0 && value < 1) {
    decimals = 4;
  } else if (value >= 10000 && decimals > 0) {
    decimals = 2;
  }

  if (forInput) {
    // Keep clean formatting when not actively editing
    return Number(value.toFixed(decimals)).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals === 0 ? 0 : 2,
    maximumFractionDigits: decimals
  });
}

function formatRateNumber(rate) {
  if (!Number.isFinite(rate)) return "--";
  if (rate >= 100) return rate.toFixed(2);
  if (rate >= 1) return rate.toFixed(4);
  return rate.toFixed(5);
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

/* ==========================================================================
   Live Exchange Rate Fetching & Caching
   ========================================================================== */

function loadCachedRates() {
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.RATES_CACHE) || "null");
    if (cached && cached.rates && typeof cached.rates === "object") {
      state.ratesInUSD = { ...FALLBACK_USD_RATES, ...cached.rates };
      state.lastUpdated = cached.timestamp || null;
      state.apiLatestDate = cached.apiLatestDate || null;
      updateRateStatusUI(false, true);
    }
  } catch (_) {}
}

async function fetchLatestRates(manual = false) {
  const refreshIcon = document.getElementById("refreshIcon");
  if (refreshIcon) refreshIcon.classList.add("spin");

  try {
    // Primary Real-Time API: Coinbase v2 Exchange Rates (Updates every minute, matches Google Finance mid-market rate)
    const rtRes = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=USD", {
      cache: "no-store"
    });
    if (rtRes.ok) {
      const rtJson = await rtRes.json();
      const rawRates = rtJson?.data?.rates;
      if (rawRates && typeof rawRates === "object") {
        const numericRates = {};
        for (const [code, valStr] of Object.entries(rawRates)) {
          const num = parseFloat(valStr);
          if (Number.isFinite(num) && num > 0) {
            numericRates[code.toUpperCase()] = num;
          }
        }
        if (numericRates.HKD && numericRates.JPY) {
          state.ratesInUSD = { ...FALLBACK_USD_RATES, ...numericRates };
          state.lastUpdated = Date.now();
          state.rateSourceLabel = "即時外匯市場價 (每分鐘同步)";
          localStorage.setItem(
            STORAGE_KEYS.RATES_CACHE,
            JSON.stringify({
              rates: state.ratesInUSD,
              timestamp: state.lastUpdated,
              apiLatestDate: state.apiLatestDate,
              rateSourceLabel: state.rateSourceLabel
            })
          );
          updateRateStatusUI(true, false);
          updateAllConverterValues();
          renderCheatSheet();
          if (state.chartSeries.length > 0) {
            loadAndRenderTrendChart();
          }
          if (manual) showToast("✅ 已同步最新每分鐘市場匯率 (與 Google 同步)");
          return;
        }
      }
    }

    // Secondary Fallback API: ExchangeRate-API Open Access (Daily Reference Rate)
    const response = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
    if (!response.ok) throw new Error("Secondary API error");
    const data = await response.json();

    if (data && data.rates) {
      state.ratesInUSD = { ...FALLBACK_USD_RATES, ...data.rates };
      state.lastUpdated = Date.now();
      state.rateSourceLabel = "每日參考匯率";
      if (data.time_last_update_utc) {
        const parsedDate = new Date(data.time_last_update_utc);
        if (!isNaN(parsedDate)) {
          state.apiLatestDate = parsedDate.toISOString().slice(0, 10);
        }
      }
      localStorage.setItem(
        STORAGE_KEYS.RATES_CACHE,
        JSON.stringify({
          rates: state.ratesInUSD,
          timestamp: state.lastUpdated,
          apiLatestDate: state.apiLatestDate,
          rateSourceLabel: state.rateSourceLabel
        })
      );
      updateRateStatusUI(true, false);
      updateAllConverterValues();
      renderCheatSheet();
      if (manual) showToast("✅ 已更新至最新市場匯率");
      return;
    }
  } catch (_) {
    // Tertiary Fallback API: jsDelivr @fawazahmed0/currency-api
    try {
      const res2 = await fetch(
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json"
      );
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.usd) {
          const upperRates = {};
          for (const [k, v] of Object.entries(data2.usd)) {
            upperRates[k.toUpperCase()] = v;
          }
          state.ratesInUSD = { ...FALLBACK_USD_RATES, ...upperRates };
          state.lastUpdated = Date.now();
          state.apiLatestDate = data2.date || null;
          state.rateSourceLabel = "每日參考匯率";
          localStorage.setItem(
            STORAGE_KEYS.RATES_CACHE,
            JSON.stringify({
              rates: state.ratesInUSD,
              timestamp: state.lastUpdated,
              apiLatestDate: state.apiLatestDate,
              rateSourceLabel: state.rateSourceLabel
            })
          );
          updateRateStatusUI(true, false);
          updateAllConverterValues();
          renderCheatSheet();
          if (manual) showToast("✅ 已更新至最新市場匯率");
          return;
        }
      }
    } catch (_err2) {}
  } finally {
    if (refreshIcon) refreshIcon.classList.remove("spin");
  }

  updateRateStatusUI(false, Boolean(state.lastUpdated));
  if (manual) showToast("⚠️ 無法連線，目前使用離線快取匯率");
}

function updateRateStatusUI(isOnline, hasCache) {
  const dot = document.getElementById("statusDot");
  const text = document.getElementById("lastUpdatedText");
  if (!dot || !text) return;

  if (isOnline) {
    dot.className = "status-dot online";
    const timeStr = new Date(state.lastUpdated).toLocaleTimeString("zh-HK", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    const src = state.rateSourceLabel || "即時匯率";
    text.textContent = `${src} (${timeStr} 更新)`;
  } else if (hasCache && state.lastUpdated) {
    dot.className = "status-dot offline";
    const timeStr = new Date(state.lastUpdated).toLocaleTimeString("zh-HK", {
      hour: "2-digit",
      minute: "2-digit"
    });
    text.textContent = `使用快取匯率 (${timeStr})`;
  } else {
    dot.className = "status-dot offline";
    text.textContent = "離線預設匯率模式";
  }
}

/* ==========================================================================
   Multi-Currency Converter UI
   ========================================================================== */

/**
 * Returns the exact amount for `code` anchored to the user's last explicitly entered currency & amount,
 * eliminating any 99.99 / 100.01 rounding drift when clicking between currencies.
 */
function getAnchoredAmount(code) {
  if (code === state.anchorCode) {
    return state.anchorAmount;
  }
  return convertCurrency(state.anchorAmount, state.anchorCode, code);
}

function renderCurrencyCards() {
  const listEl = document.getElementById("currencyList");
  if (!listEl) return;

  const evalRes = evaluateMathExpression(state.rawExpression);
  if (state.baseCode === state.anchorCode && evalRes.valid && evalRes.value !== null) {
    state.baseAmount = evalRes.value;
    state.anchorAmount = evalRes.value;
  }

  listEl.innerHTML = "";

  state.pinned.forEach((code) => {
    const meta = CURRENCY_MAP[code];
    if (!meta) return;

    const isBase = code === state.baseCode;
    const card = document.createElement("div");
    card.className = `currency-card${isBase ? " active" : ""}`;
    card.dataset.code = code;
    card.setAttribute("role", "listitem");

    // Calculate displayed value anchored to exact user input (no rounding drift)
    const convertedVal = getAnchoredAmount(code);
    const inputDisplayValue = isBase
      ? state.rawExpression
      : formatCurrencyAmount(convertedVal, code, true);

    // Subtitle rate info
    const subtitleHTML = buildRateSubtitleHTML(code);

    // Expression preview for active base card
    let exprHintText = "";
    if (isBase && evalRes.isExpression) {
      exprHintText = evalRes.valid
        ? `= ${formatCurrencyAmount(state.baseAmount, code, false)}`
        : "算式輸入中...";
    }

    card.innerHTML = `
      <div class="currency-flag-wrap" aria-hidden="true">${meta.flag}</div>
      <div class="currency-meta">
        <div class="currency-code-row">
          <span class="currency-code">${meta.code}</span>
          <span class="currency-name">${meta.name}</span>
          ${isBase ? '<span class="base-pill">輸入基準</span>' : ""}
        </div>
        <div class="currency-rate-sub" data-rate-sub="${code}">
          ${subtitleHTML}
        </div>
      </div>
      <div class="currency-value-area">
        <div class="currency-input-col">
          <div class="expr-hint" data-expr-hint="${code}">${exprHintText}</div>
          <div class="input-symbol-row">
            <span class="currency-symbol">${meta.symbol}</span>
            <input
              type="text"
              inputmode="decimal"
              class="currency-input"
              data-input-code="${code}"
              value="${inputDisplayValue}"
              aria-label="${meta.name} (${meta.code}) 金額或算式"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
        </div>
        <div class="card-quick-actions">
          <button
            type="button"
            class="card-action-btn"
            data-action="chart"
            data-code="${code}"
            title="查看 ${state.baseCode} 兌 ${code} 走勢圖"
          >📈</button>
          <button
            type="button"
            class="card-action-btn"
            data-action="copy"
            data-code="${code}"
            title="複製 ${meta.code} 金額"
          >📋</button>
        </div>
      </div>
    `;

    // Clicking anywhere on card (except action buttons) activates this currency
    card.addEventListener("click", (e) => {
      const actionBtn = e.target.closest("[data-action]");
      if (actionBtn) return;
      const inputEl = card.querySelector(".currency-input");
      if (state.baseCode !== code) {
        switchActiveCurrency(code, true);
      } else if (inputEl && document.activeElement !== inputEl) {
        inputEl.focus();
      }
    });

    const inputEl = card.querySelector(".currency-input");
    inputEl.addEventListener("focus", () => {
      if (state.baseCode !== code) {
        switchActiveCurrency(code, false);
      }
      // Remove thousand commas on focus so editing numbers/formulas is effortless
      inputEl.value = state.rawExpression;
    });

    inputEl.addEventListener("input", (e) => {
      handleExpressionInput(e.target.value);
    });

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitEvaluatedExpression();
      }
    });

    // Quick action buttons (chart & copy)
    card.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const targetCode = btn.dataset.code;
        if (action === "copy") {
          const val = getAnchoredAmount(targetCode);
          const formatted = `${targetCode} ${formatCurrencyAmount(val, targetCode, false)}`;
          navigator.clipboard?.writeText(formatted);
          showToast(`📋 已複製：${formatted}`);
        } else if (action === "chart") {
          if (targetCode !== state.baseCode) {
            state.chartFrom = state.baseCode;
            state.chartTo = targetCode;
          } else {
            state.chartFrom = targetCode;
            state.chartTo = state.pinned.find((c) => c !== targetCode) || "HKD";
          }
          syncChartSelects();
          loadAndRenderTrendChart();
          document.querySelector(".chart-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    });

    listEl.appendChild(card);
  });

  updateCalculatorPreviewBar();
}

function buildRateSubtitleHTML(code) {
  if (code === state.baseCode) {
    return `<span>直接輸入數字或算式（如 <code>1500+300</code>）</span>`;
  }
  const unitRate = getUnitRate(state.baseCode, code);
  const inverseRate = getUnitRate(code, state.baseCode);
  const meta = CURRENCY_MAP[code];

  // For currencies like JPY / KRW / VND when base is HKD, show "100 JPY = X.XX HKD (幾算)"
  if (state.baseCode === "HKD" && meta?.per100InHKD) {
    const per100HKD = inverseRate * 100;
    return `
      <span>1 ${state.baseCode} = ${formatRateNumber(unitRate)} ${code}</span>
      <span class="rate-tag-hk">• 每 100 ${code} = ${per100HKD.toFixed(2)} HKD (${per100HKD.toFixed(2)}算)</span>
    `;
  }

  return `
    <span>1 ${state.baseCode} = ${formatRateNumber(unitRate)} ${code}</span>
    <span>• 1 ${code} = ${formatRateNumber(inverseRate)} ${state.baseCode}</span>
  `;
}

function switchActiveCurrency(newCode, focusInput = true) {
  if (!CURRENCY_MAP[newCode]) return;

  if (state.lockInputAmount) {
    // Mode A: Lock the exact input number across currencies (e.g. 100 HKD -> 100 JPY -> 100 USD)
    state.baseCode = newCode;
    state.anchorCode = newCode;
    state.baseAmount = state.anchorAmount;
  } else {
    // Mode B: Follow converted value, while keeping anchorCode + anchorAmount locked
    // so the original currency (e.g. 100 HKD) NEVER drifts to 99.99 / 100.1 until the user edits!
    const exactConverted = getAnchoredAmount(newCode);
    const meta = CURRENCY_MAP[newCode];
    const displayRounded =
      meta.decimals === 0
        ? Math.round(exactConverted)
        : Number(exactConverted.toFixed(exactConverted < 1 ? 4 : meta.decimals));

    state.baseCode = newCode;
    state.baseAmount = exactConverted;
    state.rawExpression = String(displayRounded);
  }

  localStorage.setItem(STORAGE_KEYS.BASE_CODE, state.baseCode);
  localStorage.setItem(STORAGE_KEYS.BASE_EXPR, state.rawExpression);

  renderCurrencyCards();

  if (focusInput) {
    const newInput = document.querySelector(`.currency-input[data-input-code="${newCode}"]`);
    if (newInput) {
      newInput.focus();
      newInput.select();
    }
  }
}

function handleExpressionInput(rawStr) {
  state.rawExpression = rawStr;
  state.anchorCode = state.baseCode;
  localStorage.setItem(STORAGE_KEYS.BASE_EXPR, state.rawExpression);

  const evalRes = evaluateMathExpression(rawStr);
  if (evalRes.valid && evalRes.value !== null) {
    state.baseAmount = evalRes.value;
    state.anchorAmount = evalRes.value;
  }

  updateAllConverterValues(false);
  updateCalculatorPreviewBar();
}

function commitEvaluatedExpression() {
  const evalRes = evaluateMathExpression(state.rawExpression);
  if (evalRes.valid && evalRes.value !== null) {
    const meta = CURRENCY_MAP[state.baseCode] || { decimals: 2 };
    const cleanVal = Number(evalRes.value.toFixed(meta.decimals === 0 ? 2 : meta.decimals));
    state.baseAmount = cleanVal;
    state.anchorCode = state.baseCode;
    state.anchorAmount = cleanVal;
    state.rawExpression = String(cleanVal);
    localStorage.setItem(STORAGE_KEYS.BASE_EXPR, state.rawExpression);
    updateAllConverterValues(true);
    updateCalculatorPreviewBar();
  }
}

/**
 * Updates all non-active currency inputs and rate subtitles without destroying focus on the active input
 */
function updateAllConverterValues(updateActiveInputToo = false) {
  const evalRes = evaluateMathExpression(state.rawExpression);

  state.pinned.forEach((code) => {
    const isBase = code === state.baseCode;
    const inputEl = document.querySelector(`.currency-input[data-input-code="${code}"]`);
    const hintEl = document.querySelector(`[data-expr-hint="${code}"]`);
    const subEl = document.querySelector(`[data-rate-sub="${code}"]`);

    if (subEl) {
      subEl.innerHTML = buildRateSubtitleHTML(code);
    }

    if (isBase) {
      if (hintEl) {
        if (evalRes.isExpression) {
          hintEl.textContent = evalRes.valid
            ? `= ${formatCurrencyAmount(state.baseAmount, code, false)}`
            : "算式輸入中...";
        } else {
          hintEl.textContent = "";
        }
      }
      if (updateActiveInputToo && inputEl) {
        inputEl.value = state.rawExpression;
      }
    } else if (inputEl) {
      if (hintEl) hintEl.textContent = "";
      const val = getAnchoredAmount(code);
      inputEl.value = formatCurrencyAmount(val, code, true);
    }
  });
}

function updateCalculatorPreviewBar() {
  const tagEl = document.getElementById("calcBaseTag");
  const exprEl = document.getElementById("calcExprPreview");
  const evalEl = document.getElementById("calcEvalPreview");
  if (!tagEl || !exprEl || !evalEl) return;

  tagEl.textContent = state.baseCode;
  exprEl.textContent = state.rawExpression || "0";
  evalEl.textContent = `= ${formatCurrencyAmount(state.baseAmount, state.baseCode, false)}`;
}

/* ==========================================================================
   Historical Exchange Rate Trend Chart (7D / 30D)
   ========================================================================== */

function populateChartSelectors() {
  const fromSel = document.getElementById("chartFromSelect");
  const toSel = document.getElementById("chartToSelect");
  if (!fromSel || !toSel) return;

  // Put pinned currencies at the top, followed by all other currencies
  const orderedCodes = [
    ...state.pinned,
    ...CURRENCY_CATALOG.map((c) => c.code).filter((code) => !state.pinned.includes(code))
  ];

  const optionsHTML = orderedCodes
    .map((code) => {
      const c = CURRENCY_MAP[code];
      return `<option value="${c.code}">${c.flag} ${c.code} — ${c.name}</option>`;
    })
    .join("");

  fromSel.innerHTML = optionsHTML;
  toSel.innerHTML = optionsHTML;
  syncChartSelects();
}

function syncChartSelects() {
  const fromSel = document.getElementById("chartFromSelect");
  const toSel = document.getElementById("chartToSelect");
  const per100Chk = document.getElementById("chartPer100Checkbox");

  if (fromSel) fromSel.value = state.chartFrom;
  if (toSel) toSel.value = state.chartTo;
  if (per100Chk) per100Chk.checked = state.chartPer100;

  localStorage.setItem(
    STORAGE_KEYS.CHART_PAIR,
    JSON.stringify({
      from: state.chartFrom,
      to: state.chartTo,
      per100: state.chartPer100
    })
  );
}

function getHistoricalDateStrings(days) {
  // Anchor end date to API latest date if available, otherwise today
  const endObj = state.apiLatestDate ? new Date(`${state.apiLatestDate}T00:00:00Z`) : new Date();
  const dates = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date(endObj);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

async function fetchHistoricalSeries(fromCode, toCode, days) {
  if (fromCode === toCode) {
    const dates = getHistoricalDateStrings(days);
    return dates.map((d) => ({ date: d, rate: 1 }));
  }

  const cacheKey = `${fromCode}_${toCode}_${days}`;
  if (state.historyCache[cacheKey]) {
    return state.historyCache[cacheKey];
  }

  const dates = getHistoricalDateStrings(days);
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  // Strategy 1: Frankfurter API (1 request for entire range if both currencies are supported)
  if (FRANKFURTER_SUPPORTED.has(fromCode) && FRANKFURTER_SUPPORTED.has(toCode)) {
    try {
      const url = `https://api.frankfurter.dev/v1/${startDate}..${endDate}?base=${fromCode}&symbols=${toCode}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          const series = Object.entries(data.rates)
            .map(([date, obj]) => ({
              date,
              rate: obj[toCode]
            }))
            .filter((pt) => Number.isFinite(pt.rate))
            .sort((a, b) => a.date.localeCompare(b.date));

          // Append today's live rate at the end if newer
          const liveRate = getUnitRate(fromCode, toCode);
          if (series.length > 0 && Number.isFinite(liveRate)) {
            state.historyCache[cacheKey] = series;
            return series;
          }
        }
      }
    } catch (_) {}
  }

  // Strategy 2: @fawazahmed0/currency-api on jsDelivr CDN (supports TWD, VND, MOP, AED, etc.)
  try {
    // Sample up to 10 evenly-spaced dates across the window for fast parallel fetching
    const sampleDates =
      dates.length <= 10
        ? dates
        : dates.filter((_, idx) => idx % 3 === 0 || idx === dates.length - 1);

    const lowerFrom = fromCode.toLowerCase();
    const lowerTo = toCode.toLowerCase();

    const results = await Promise.all(
      sampleDates.map(async (dateStr) => {
        try {
          const r = await fetch(
            `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateStr}/v1/currencies/${lowerFrom}.min.json`
          );
          if (!r.ok) return null;
          const json = await r.json();
          const val = json?.[lowerFrom]?.[lowerTo];
          return Number.isFinite(val) ? { date: dateStr, rate: val } : null;
        } catch (_) {
          return null;
        }
      })
    );

    const validSeries = results.filter(Boolean);
    if (validSeries.length >= 2) {
      state.historyCache[cacheKey] = validSeries;
      return validSeries;
    }
  } catch (_) {}

  // Fallback synthetic series anchored on current live rate if offline
  const baseLiveRate = getUnitRate(fromCode, toCode);
  return dates.map((d, idx) => {
    const wave = Math.sin(idx * 0.65) * 0.004 + Math.cos(idx * 0.3) * 0.002;
    return {
      date: d,
      rate: baseLiveRate * (1 + wave)
    };
  });
}

async function loadAndRenderTrendChart() {
  const loadingEl = document.getElementById("chartLoading");
  if (loadingEl) loadingEl.style.display = "flex";

  renderCheatSheet();

  const rawSeries = await fetchHistoricalSeries(state.chartFrom, state.chartTo, state.chartDays);
  const multiplier = state.chartPer100 ? 100 : 1;
  const liveUnitRate = getUnitRate(state.chartFrom, state.chartTo);

  const mapped = rawSeries.map((pt) => ({
    date: pt.date,
    rate: pt.rate * multiplier
  }));

  // Anchor the latest point to the real-time live market rate so converter & chart match 100%
  if (mapped.length > 0 && Number.isFinite(liveUnitRate)) {
    mapped[mapped.length - 1] = {
      date: `${mapped[mapped.length - 1].date} (即時)`,
      rate: liveUnitRate * multiplier
    };
  }

  state.chartSeries = mapped;

  if (loadingEl) loadingEl.style.display = "none";
  drawSvgTrendChart(state.chartSeries);
}

function drawSvgTrendChart(series) {
  const svg = document.getElementById("trendSvg");
  const tooltip = document.getElementById("chartTooltip");
  const subtitleEl = document.getElementById("chartSubtitle");
  if (!svg || !series || series.length === 0) return;

  const unitLabel = state.chartPer100 ? `100 ${state.chartFrom}` : `1 ${state.chartFrom}`;
  if (subtitleEl) {
    subtitleEl.textContent = `${unitLabel} 兌 ${state.chartTo} • 過去 ${state.chartDays} 日走勢`;
  }

  const values = series.map((d) => d.rate);
  const firstVal = values[0];
  const lastVal = values[values.length - 1];
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const changePct = firstVal > 0 ? ((lastVal - firstVal) / firstVal) * 100 : 0;
  const isUp = changePct >= 0;

  // Update stats boxes
  const statCurrent = document.getElementById("statCurrent");
  const statChange = document.getElementById("statChange");
  const statHigh = document.getElementById("statHigh");
  const statLow = document.getElementById("statLow");

  if (statCurrent) statCurrent.textContent = formatRateNumber(lastVal);
  if (statHigh) statHigh.textContent = formatRateNumber(maxVal);
  if (statLow) statLow.textContent = formatRateNumber(minVal);
  if (statChange) {
    const sign = changePct >= 0 ? "+" : "";
    statChange.textContent = `${sign}${changePct.toFixed(2)}%`;
    statChange.className = `stat-value ${isUp ? "stat-up" : "stat-down"}`;
  }

  // SVG Geometry
  const width = 600;
  const height = 250;
  const padLeft = 14;
  const padRight = 14;
  const padTop = 22;
  const padBottom = 32;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const range = maxVal - minVal || maxVal * 0.01 || 1;
  const points = series.map((pt, i) => {
    const x = padLeft + (i / Math.max(1, series.length - 1)) * plotW;
    const y = padTop + plotH - ((pt.rate - minVal) / range) * plotH;
    return { x, y, ...pt };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${padTop + plotH} L${points[0].x.toFixed(1)},${padTop + plotH} Z`;

  const strokeColor = isUp ? "#10b981" : "#f43f5e";
  const firstDateLabel = series[0].date.slice(5);
  const midDateLabel = series[Math.floor(series.length / 2)].date.slice(5);
  const lastDateLabel = series[series.length - 1].date.slice(5);

  svg.innerHTML = `
    <defs>
      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.32" />
        <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0" />
      </linearGradient>
    </defs>

    <!-- Horizontal Reference Grid Lines -->
    <line x1="${padLeft}" y1="${padTop}" x2="${width - padRight}" y2="${padTop}" stroke="rgba(148,163,184,0.15)" stroke-dasharray="4 4" />
    <line x1="${padLeft}" y1="${padTop + plotH / 2}" x2="${width - padRight}" y2="${padTop + plotH / 2}" stroke="rgba(148,163,184,0.12)" stroke-dasharray="4 4" />
    <line x1="${padLeft}" y1="${padTop + plotH}" x2="${width - padRight}" y2="${padTop + plotH}" stroke="rgba(148,163,184,0.2)" />

    <!-- Area & Line -->
    <path d="${areaPath}" fill="url(#chartGrad)" />
    <path d="${linePath}" fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Date Axis Labels -->
    <text x="${padLeft}" y="${height - 8}" fill="#94a3b8" font-size="12">${firstDateLabel}</text>
    <text x="${width / 2}" y="${height - 8}" fill="#94a3b8" font-size="12" text-anchor="middle">${midDateLabel}</text>
    <text x="${width - padRight}" y="${height - 8}" fill="#94a3b8" font-size="12" text-anchor="end">${lastDateLabel}</text>

    <!-- Hover Crosshair Elements -->
    <line id="hoverLine" x1="0" y1="${padTop}" x2="0" y2="${padTop + plotH}" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="3 3" visibility="hidden" />
    <circle id="hoverDot" cx="0" cy="0" r="5.5" fill="${strokeColor}" stroke="#ffffff" stroke-width="2" visibility="hidden" />
  `;

  const hoverLine = svg.querySelector("#hoverLine");
  const hoverDot = svg.querySelector("#hoverDot");

  function handlePointerMove(clientX) {
    const rect = svg.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.round(relX * (points.length - 1));
    const pt = points[idx];
    if (!pt) return;

    hoverLine.setAttribute("x1", pt.x);
    hoverLine.setAttribute("x2", pt.x);
    hoverLine.setAttribute("visibility", "visible");

    hoverDot.setAttribute("cx", pt.x);
    hoverDot.setAttribute("cy", pt.y);
    hoverDot.setAttribute("visibility", "visible");

    if (tooltip) {
      tooltip.hidden = false;
      document.getElementById("tooltipDate").textContent = pt.date;
      document.getElementById("tooltipRate").textContent = `${unitLabel} = ${formatRateNumber(pt.rate)} ${state.chartTo}`;

      const pixelX = (pt.x / width) * rect.width;
      const clampedLeft = Math.max(10, Math.min(rect.width - 165, pixelX - 70));
      tooltip.style.left = `${clampedLeft}px`;
      tooltip.style.top = `10px`;
    }
  }

  svg.onmousemove = (e) => handlePointerMove(e.clientX);
  svg.ontouchmove = (e) => {
    if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
  };
  svg.onmouseleave = () => {
    hoverLine.setAttribute("visibility", "hidden");
    hoverDot.setAttribute("visibility", "hidden");
    if (tooltip) tooltip.hidden = true;
  };
}

/* ==========================================================================
   Travel & Shopping Quick Cheat Sheet
   ========================================================================== */

function renderCheatSheet() {
  const grid = document.getElementById("cheatSheetGrid");
  const subtitle = document.getElementById("cheatSheetSubtitle");
  if (!grid) return;

  const from = state.chartFrom;
  const to = state.chartTo;
  const fromMeta = CURRENCY_MAP[from];
  const toMeta = CURRENCY_MAP[to];

  if (subtitle && fromMeta && toMeta) {
    subtitle.textContent = `${fromMeta.flag} ${from} 兌 ${toMeta.flag} ${to} 常用金額對照（點擊可帶入換算器）`;
  }

  // Choose sensible preset steps depending on currency scale
  const unitInUSD = 1 / (state.ratesInUSD[from] || 1);
  const steps =
    unitInUSD < 0.02
      ? [500, 1000, 3000, 5000, 10000, 50000]
      : [10, 50, 100, 500, 1000, 5000];

  grid.innerHTML = steps
    .map((amt) => {
      const converted = convertCurrency(amt, from, to);
      return `
        <div class="cheatsheet-item" data-cs-code="${from}" data-cs-amt="${amt}" title="點擊將 ${amt} ${from} 帶入左方換算器">
          <span class="cheatsheet-from">${amt.toLocaleString()} ${from}</span>
          <span class="cheatsheet-to">= ${formatCurrencyAmount(converted, to, false)} ${to}</span>
        </div>
      `;
    })
    .join("");

  grid.querySelectorAll(".cheatsheet-item").forEach((item) => {
    item.addEventListener("click", () => {
      const code = item.dataset.csCode;
      const amt = Number(item.dataset.csAmt);
      if (!state.pinned.includes(code)) {
        state.pinned.unshift(code);
        savePinnedCurrencies();
      }
      state.baseCode = code;
      state.baseAmount = amt;
      state.anchorCode = code;
      state.anchorAmount = amt;
      state.rawExpression = String(amt);
      renderCurrencyCards();
      showToast(`已帶入 ${amt.toLocaleString()} ${code}`);
    });
  });
}

/* ==========================================================================
   Currency Manager Modal (Pin / Unpin / Reorder / Search)
   ========================================================================== */

function renderCurrencyModal(searchQuery = "") {
  const pinnedListEl = document.getElementById("pinnedModalList");
  const unpinnedListEl = document.getElementById("unpinnedModalList");
  const countTextEl = document.getElementById("pinnedCountText");
  if (!pinnedListEl || !unpinnedListEl) return;

  const q = searchQuery.trim().toLowerCase();
  const matchesFilter = (c) =>
    !q ||
    c.code.toLowerCase().includes(q) ||
    c.name.toLowerCase().includes(q) ||
    c.en.toLowerCase().includes(q);

  // Pinned rows
  pinnedListEl.innerHTML = "";
  state.pinned
    .map((code) => CURRENCY_MAP[code])
    .filter((c) => c && matchesFilter(c))
    .forEach((c) => {
      const idx = state.pinned.indexOf(c.code);
      const row = document.createElement("div");
      row.className = "modal-currency-row";
      row.innerHTML = `
        <div class="modal-currency-info">
          <span style="font-size:1.35rem">${c.flag}</span>
          <div>
            <strong>${c.code}</strong> — ${c.name}
            <div style="font-size:0.75rem;color:var(--text-secondary)">${c.en} (${c.symbol})</div>
          </div>
        </div>
        <div class="modal-currency-actions">
          <button type="button" class="btn btn-outline btn-sm" data-move="up" data-code="${c.code}" ${idx === 0 ? "disabled" : ""} title="上移">↑</button>
          <button type="button" class="btn btn-outline btn-sm" data-move="down" data-code="${c.code}" ${idx === state.pinned.length - 1 ? "disabled" : ""} title="下移">↓</button>
          <button type="button" class="btn btn-outline btn-sm" data-unpin="${c.code}" ${state.pinned.length <= 2 ? "disabled" : ""} title="移除釘選">移除</button>
        </div>
      `;
      pinnedListEl.appendChild(row);
    });

  // Unpinned rows
  unpinnedListEl.innerHTML = "";
  CURRENCY_CATALOG.filter((c) => !state.pinned.includes(c.code) && matchesFilter(c)).forEach((c) => {
    const row = document.createElement("div");
    row.className = "modal-currency-row";
    row.innerHTML = `
      <div class="modal-currency-info">
        <span style="font-size:1.35rem">${c.flag}</span>
        <div>
          <strong>${c.code}</strong> — ${c.name}
          <div style="font-size:0.75rem;color:var(--text-secondary)">${c.en} (${c.symbol})</div>
        </div>
      </div>
      <div class="modal-currency-actions">
        <button type="button" class="btn btn-primary btn-sm" data-pin="${c.code}">＋ 釘選加入</button>
      </div>
    `;
    unpinnedListEl.appendChild(row);
  });

  if (countTextEl) {
    countTextEl.textContent = `已釘選 ${state.pinned.length} 種常用貨幣`;
  }

  // Bind buttons
  pinnedListEl.querySelectorAll("[data-move]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.dataset.code;
      const dir = btn.dataset.move;
      const idx = state.pinned.indexOf(code);
      if (idx < 0) return;
      const targetIdx = dir === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= state.pinned.length) return;
      [state.pinned[idx], state.pinned[targetIdx]] = [state.pinned[targetIdx], state.pinned[idx]];
      savePinnedCurrencies();
      renderCurrencyCards();
      populateChartSelectors();
      renderCurrencyModal(document.getElementById("currencySearchInput")?.value || "");
    });
  });

  pinnedListEl.querySelectorAll("[data-unpin]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.pinned.length <= 2) {
        showToast("請至少保留 2 種常用貨幣");
        return;
      }
      const code = btn.dataset.unpin;
      state.pinned = state.pinned.filter((c) => c !== code);
      if (state.baseCode === code) {
        state.baseCode = state.pinned[0];
      }
      savePinnedCurrencies();
      renderCurrencyCards();
      populateChartSelectors();
      renderCurrencyModal(document.getElementById("currencySearchInput")?.value || "");
    });
  });

  unpinnedListEl.querySelectorAll("[data-pin]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.dataset.pin;
      if (!state.pinned.includes(code)) {
        state.pinned.push(code);
        savePinnedCurrencies();
        renderCurrencyCards();
        populateChartSelectors();
        renderCurrencyModal(document.getElementById("currencySearchInput")?.value || "");
        showToast(`✅ 已加入 ${CURRENCY_MAP[code].name} (${code})`);
      }
    });
  });
}

/* ==========================================================================
   Event Wiring & Initialization
   ========================================================================== */

function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  const icon = document.getElementById("themeIcon");
  if (icon) icon.textContent = savedTheme === "light" ? "☀️" : "🌙";

  document.getElementById("themeToggleBtn")?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEYS.THEME, next);
    if (icon) icon.textContent = next === "light" ? "☀️" : "🌙";
  });
}

function initQuickPresetsAndCalculator() {
  // Lock amount toggle button
  const lockBtn = document.getElementById("lockAmountToggleBtn");
  const syncLockBtnUI = () => {
    if (!lockBtn) return;
    lockBtn.classList.toggle("locked", state.lockInputAmount);
    lockBtn.setAttribute("aria-pressed", String(state.lockInputAmount));
    lockBtn.textContent = state.lockInputAmount
      ? "🔒 已鎖定輸入數字"
      : "🔓 切換跟隨換算值";
  };
  syncLockBtnUI();

  lockBtn?.addEventListener("click", () => {
    state.lockInputAmount = !state.lockInputAmount;
    localStorage.setItem(STORAGE_KEYS.LOCK_AMOUNT, String(state.lockInputAmount));
    syncLockBtnUI();
    showToast(
      state.lockInputAmount
        ? "🔒 已開啟「鎖定輸入數字」：點選其他貨幣時會保持同一個輸入數字"
        : "🔓 已切換為「跟隨換算值」（同時鎖定原金額不因四捨五入跳動）"
    );
  });

  // Quick amount chips
  document.querySelectorAll(".chip[data-amount]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const amt = chip.dataset.amount;
      state.rawExpression = amt;
      handleExpressionInput(amt);
      updateAllConverterValues(true);
    });
  });

  // Quick discount / tax chips (*0.9, *1.1)
  document.querySelectorAll(".chip[data-op]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const op = chip.dataset.op;
      const nextExpr = `${state.rawExpression || "0"}${op}`;
      handleExpressionInput(nextExpr);
      updateAllConverterValues(true);
    });
  });

  // Toggle calculator keypad drawer
  const calcDrawer = document.getElementById("calcDrawer");
  document.getElementById("toggleCalcBtn")?.addEventListener("click", () => {
    calcDrawer?.classList.toggle("open");
  });
  document.getElementById("closeCalcBtn")?.addEventListener("click", () => {
    calcDrawer?.classList.remove("open");
  });

  // Keypad buttons
  document.querySelectorAll(".calc-key").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      if (key === "C") {
        handleExpressionInput("0");
        updateAllConverterValues(true);
      } else if (key === "BACKSPACE") {
        const next = state.rawExpression.length > 1 ? state.rawExpression.slice(0, -1) : "0";
        handleExpressionInput(next);
        updateAllConverterValues(true);
      } else if (key === "=") {
        commitEvaluatedExpression();
      } else {
        const current = state.rawExpression === "0" && /^[0-9]$/.test(key) ? "" : state.rawExpression;
        const next = `${current}${key}`;
        handleExpressionInput(next);
        updateAllConverterValues(true);
      }
    });
  });
}

function initChartControls() {
  populateChartSelectors();

  const fromSel = document.getElementById("chartFromSelect");
  const toSel = document.getElementById("chartToSelect");
  const swapBtn = document.getElementById("swapChartPairBtn");
  const per100Chk = document.getElementById("chartPer100Checkbox");

  fromSel?.addEventListener("change", () => {
    state.chartFrom = fromSel.value;
    syncChartSelects();
    loadAndRenderTrendChart();
  });

  toSel?.addEventListener("change", () => {
    state.chartTo = toSel.value;
    syncChartSelects();
    loadAndRenderTrendChart();
  });

  swapBtn?.addEventListener("click", () => {
    [state.chartFrom, state.chartTo] = [state.chartTo, state.chartFrom];
    // Auto-enable per-100 when viewing JPY/KRW/VND -> HKD
    if (state.chartTo === "HKD" && CURRENCY_MAP[state.chartFrom]?.per100InHKD) {
      state.chartPer100 = true;
    } else if (state.chartFrom === "HKD") {
      state.chartPer100 = false;
    }
    syncChartSelects();
    loadAndRenderTrendChart();
  });

  per100Chk?.addEventListener("change", () => {
    state.chartPer100 = per100Chk.checked;
    syncChartSelects();
    loadAndRenderTrendChart();
  });

  document.querySelectorAll(".range-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".range-tab").forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      state.chartDays = Number(tab.dataset.days) || 7;
      loadAndRenderTrendChart();
    });
  });
}

function initModalControls() {
  const modal = document.getElementById("currencyModal");
  const searchInput = document.getElementById("currencySearchInput");

  const openModal = () => {
    if (!modal) return;
    if (searchInput) searchInput.value = "";
    renderCurrencyModal("");
    modal.hidden = false;
    searchInput?.focus();
  };

  const closeModal = () => {
    if (modal) modal.hidden = true;
  };

  document.getElementById("openCurrencyModalBtn")?.addEventListener("click", openModal);
  document.getElementById("closeCurrencyModalBtn")?.addEventListener("click", closeModal);
  document.getElementById("doneCurrencyModalBtn")?.addEventListener("click", closeModal);

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  searchInput?.addEventListener("input", () => {
    renderCurrencyModal(searchInput.value);
  });

  document.getElementById("resetDefaultCurrenciesBtn")?.addEventListener("click", () => {
    state.pinned = [...DEFAULT_PINNED];
    state.baseCode = "HKD";
    savePinnedCurrencies();
    renderCurrencyCards();
    populateChartSelectors();
    renderCurrencyModal(searchInput?.value || "");
    showToast("已還原預設 5 種常用貨幣 (HKD, JPY, TWD, USD, CNY)");
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  loadCachedRates();
  renderCurrencyCards();
  initQuickPresetsAndCalculator();
  initChartControls();
  initModalControls();

  document.getElementById("refreshRatesBtn")?.addEventListener("click", () => {
    fetchLatestRates(true);
  });

  await fetchLatestRates(false);
  await loadAndRenderTrendChart();

  // Auto-refresh live rates every 60 seconds
  setInterval(() => {
    if (!document.hidden) {
      fetchLatestRates(false);
    }
  }, 60000);
});
