/* utils.js */
export const SHEET_URL = "https://script.google.com/macros/s/AKfycby4pyDQgIfmnNXP-wNFH3CCA_xaekozyNVbtH4MeLrNG8rZgO4NrLYa2q6oDmDlCaRPwQ/exec";
export const BUILD_VERSION = "v1.1.7"; // Updated to match your current build

export const emojiMap = {
    "Digital Gold": "🌟", 
    "Gold": "🪙",
    "Property(Fractional + Debt)": "🏢",
    "Fractional Property": "🏠",
    "Invoice Discounting + Asset Leasing": "📄💸",
    "P2P Lending": "🤝💰",
    "Invoice Discounting": "🧾",
    "Stocks + Mutual Funds": "📈",
    "ETF": "🧺",
    "Unit Trust": "🏦📊",
    "Robo Portfolio": "🤖",
    "SRS Based": "🛡️",
    "Crypto": "₿",
    "ESOW": "👔",
    "Bonds": "📜💵",
    "Cash": "💵",
    "Savings & ILP": "💼", 
    "Investments": "🧓📈",
    "Non-Invested": "🧓💰",
    "Misc": "📦"
};

export const EXCHANGE_RATES = {
    "INR": 72.88,
    "EUR": 0.68,
    "AED": 2.76,
    "SGD": 1.00
};

export const CURRENCY_SYMBOLS = {
    "INR": "₹",
    "EUR": "€",
    "AED": "د.إ",
    "SGD": "$"
};

export function getCorrectCasing(name) {
    const keys = Object.keys(emojiMap);
    const match = keys.find(k => k.toLowerCase() === name.toLowerCase().trim());
    return match || name;
}

export function getCurrencySymbol(code) {
    return CURRENCY_SYMBOLS[code.toUpperCase()] || "$";
}

export function findValue(obj, targetKey) {
    if (!obj) return null;
    const normalize = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
    const search = normalize(targetKey);
    const keys = Object.keys(obj);
    
    let hit = keys.find(k => normalize(k) === search);
    if (!hit) hit = keys.find(k => normalize(k).includes(search));
    
    return hit ? obj[hit] : null;
}

export function cleanNum(val) {
    if (val === undefined || val === null || val === "") return 0;
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/[₹$,%\s]/g, '').replace(/,/g, '');
    return parseFloat(cleaned) || 0;
}
