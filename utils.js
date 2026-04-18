/* utils.js */
export const SHEET_URL = "https://script.google.com/macros/s/AKfycby4pyDQgIfmnNXP-wNFH3CCA_xaekozyNVbtH4MeLrNG8rZgO4NrLYa2q6oDmDlCaRPwQ/exec";
export const BUILD_VERSION = "v1.1.3"; // Updated to match your current build

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

export function findValue(obj, targetKey) {
    if (!obj) return null;
    const normalize = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
    const search = normalize(targetKey);
    
    // 1. Try to find an EXACT match first (Safest)
    let actualKey = Object.keys(obj).find(k => normalize(k) === search);
    
    // 2. If no exact match, fallback to the 'includes' logic (Flexible)
    if (!actualKey) {
        actualKey = Object.keys(obj).find(k => normalize(k).includes(search));
    }
    
    return actualKey ? obj[actualKey] : null;
}

export function cleanNum(val) {
    if (val === undefined || val === null || val === "") return 0;
    return parseFloat(String(val).replace(/[₹$,%\s]/g, '').replace(/,/g, '')) || 0;
}
