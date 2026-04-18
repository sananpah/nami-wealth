/* utils.js */
export const SHEET_URL = "https://script.google.com/macros/s/AKfycby4pyDQgIfmnNXP-wNFH3CCA_xaekozyNVbtH4MeLrNG8rZgO4NrLYa2q6oDmDlCaRPwQ/exec";
export const BUILD_VERSION = "v1.1.4"; // Updated to match your current build

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
    
    // Check for exact match first, then partial match
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
