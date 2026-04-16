/* utils.js */

export const SHEET_URL = "https://script.google.com/macros/s/AKfycby4pyDQgIfmnNXP-wNFH3CCA_xaekozyNVbtH4MeLrNG8rZgO4NrLYa2q6oDmDlCaRPwQ/exec";
export const BUILD_VERSION = "v10.5.7";

export const emojiMap = {
    // Bullion & Precious Metals
    "Digital Gold": "🌟",
    "Gold": "🪙",

    // Real Estate & Property
    "Property(Fractional + Debt)": "🏢",
    "Real Estate Debt": "🏗️",
    "Fractional Property": "🏠",

    // Alternative Finance & P2P
    "Invoice Discounting + Asset Leasing": "📄💸",
    "P2P Lending": "🤝💰",
    "Asset Leasing": "🚜",
    "Invoice Discounting": "🧾",

    // Equities & Market
    "Stocks + Mutual Funds": "📈",
    "Stocks": "📊",
    "Mutual Funds": "🌊",
    "ETF": "🧺",
    "Unit Trust": "🏦📊",
    "Robo Portfolio": "🤖",
    "SRS Investments": "🛡️",

    // Crypto & Tech
    "Crypto": "₿",
    "ESOW": "👔", 

    // Fixed Income & Cash
    "Bonds": "📜💵",
    "Cash": "💵",
    "Savings & Investment Linked": "💼",
    "Savings": "🏦",

    // Legacy/Family
    "Investments": "🧓📈",
    "Non-Investments": "🧓💰",

    // Default
    "Misc": "📦"
};

// Helper to find data regardless of Google Script header formatting
export function findValue(obj, targetKey) {
    const keys = Object.keys(obj);
    const foundKey = keys.find(k => k.toLowerCase().replace(/[-_\s]/g, '') === targetKey.toLowerCase().replace(/[-_\s]/g, ''));
    return foundKey ? obj[foundKey] : undefined;
}

// Helper to scrub Excel currency formatting
export function cleanNum(val) {
    if (val === undefined || val === null || val === "") return 0;
    return parseFloat(String(val).replace(/[₹$,%\s]/g, '').replace(/,/g, '')) || 0;
}
