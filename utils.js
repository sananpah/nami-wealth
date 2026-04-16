/* utils.js */
export const SHEET_URL = "https://script.google.com/macros/s/AKfycby4pyDQgIfmnNXP-wNFH3CCA_xaekozyNVbtH4MeLrNG8rZgO4NrLYa2q6oDmDlCaRPwQ/exec";
export const BUILD_VERSION = "v10.5.8";

export const emojiMap = {
    "Digital Gold": "🌟", 
    "Gold": "🪙",
    "Property(Fractional + Debt)": "🏢",
    "Real Estate Debt": "🏗️",
    "Fractional Property": "🏠",
    "Invoice Discounting + Asset Leasing": "📄💸",
    "P2P Lending": "🤝💰",
    "Asset Leasing": "🚜",
    "Invoice Discounting": "🧾",
    "Stocks + Mutual Funds": "📈",
    "Stocks": "📊",
    "Mutual Funds": "🌊"
    "ETF": "🧺",
    "Unit Trust": "🏦📊",
    "Robo Portfolio": "🤖",
    "SRS Investments": "🛡️",
    "Crypto": "₿",
    "ESOW": "👔",
    "Bonds": "📜💵",
    "Cash": "💵",
    "Savings & Investment Linked": "💼", 
    "Savings": "🏦", 
    "Investments": "🧓📈",
    "Non-Investments": "🧓💰",
    "Misc": "📦"
};

export function findValue(obj, targetKey) {
    const keys = Object.keys(obj);
    const foundKey = keys.find(k => k.toLowerCase().replace(/[-_\s]/g, '') === targetKey.toLowerCase().replace(/[-_\s]/g, ''));
    return foundKey ? obj[foundKey] : undefined;
}

export function cleanNum(val) {
    if (val === undefined || val === null || val === "") return 0;
    return parseFloat(String(val).replace(/[₹$,%\s]/g, '').replace(/,/g, '')) || 0;
}
