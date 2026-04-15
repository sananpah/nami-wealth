/* components.js */

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
    "ESOW": "👔", // Using👔 for Employee Stock Ownership/Works

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

export function renderAssetCard(item, index) {
    const sub = String(item['sub-category'] || "Asset").trim();
    const amt = parseFloat(String(item.amount).replace(/[$,%]/g, '')) || 0;
    const cat = String(item.Category || "Misc").trim();
    
    let colorClass = "c-" + (((index % 11) + 1).toString().padStart(2, '0'));
    if (sub === "Digital Gold") colorClass = "c-gold";

    return `
        <div class="funky-card p-4 md:p-6 ${colorClass} cursor-pointer active:scale-95 transition-transform" 
             onclick="ui.openDrilldown('${sub}')">
            <span class="card-emoji text-2xl absolute top-2 right-4">${emojiMap[sub] || "💰"}</span>
            <div class="asset-label bg-black text-white text-[8px] px-2 py-1 rounded inline-block uppercase font-black mb-2">${cat}</div>
            <div class="font-black text-[10px] uppercase opacity-70">${sub}</div>
            <div class="text-2xl md:text-3xl stat-val mt-2">$${Math.round(amt).toLocaleString()}</div>
        </div>`;
}

export function renderGoldDrilldown() {
    // Hardcoded data from your Excel table for now
    const platforms = [
        { name: "Ultra", invested: 500.00, value: 820.25, gain: 64.05 },
        { name: "Gullak", invested: 3351.07, value: 4038.72, gain: 20.52 }
    ];

    return `
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-black italic uppercase">Bullion Hub</h2>
            <button onclick="ui.closeDrawer()" class="bg-black text-white px-6 py-2 rounded-full font-black uppercase text-xs">Close</button>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-8">
            <div class="funky-card p-4 bg-white border-2">
                <p class="text-[10px] font-black uppercase text-slate-400">Total Invested</p>
                <p class="text-xl font-black stat-val">₹3,851</p>
            </div>
            <div class="funky-card p-4 c-gold border-2">
                <p class="text-[10px] font-black uppercase">Current Value</p>
                <p class="text-xl font-black stat-val">₹4,859</p>
                <div class="up-badge mt-2">+26.17%</div>
            </div>
        </div>
        <div class="space-y-4">
            ${platforms.map(p => `
                <div class="funky-card p-5 flex justify-between items-center bg-white">
                    <div><p class="font-black italic text-lg uppercase">${p.name}</p><p class="text-[10px] font-bold text-slate-400">GAIN: +${p.gain}%</p></div>
                    <div class="text-right"><p class="font-black text-xl stat-val">₹${Math.round(p.value).toLocaleString()}</p></div>
                </div>
            `).join('')}
        </div>`;
}
