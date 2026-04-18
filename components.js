/* components.js */

const version = window.BUILD_VERSION || "10.6.3";
const utils = await import('./utils.js?v=' + version);
const { emojiMap, findValue } = utils;

export function renderAssetCard(item, index) {
    const sub = String(findValue(item, "Sub-Category") || "Asset").trim();
    const amt = parseFloat(String(item.amount || item.Amount || 0).replace(/[$,%]/g, '')) || 0;
    const cat = String(findValue(item, "Category") || "Misc").trim();
    
    let colorClass = "c-" + (((index % 11) + 1).toString().padStart(2, '0'));
    if (sub === "Digital Gold") colorClass = "c-gold";

    return `
        <div class="funky-card p-4 md:p-6 ${colorClass} cursor-pointer active:scale-95 transition-transform" 
             onclick="ui.openDrilldown('${sub}')">
            <span class="card-emoji text-2xl absolute top-2 right-4">${emojiMap[sub] || "💰"}</span>
            <div class="asset-label bg-black text-white text-[8px] px-2 py-1 rounded inline-block uppercase font-black mb-1 truncate max-w-[85%]">${cat}</div>
            <div class="font-black text-[10px] uppercase opacity-70 tracking-tighter truncate">${sub}</div>
            <div class="text-xl md:text-3xl stat-val mt-1">$${Math.round(amt).toLocaleString()}</div>
        </div>`;
}

export function renderDrilldown(title, platforms) {
    // 1. Safety check: If platforms is empty or not an array
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
        return `<div class="p-10 text-center font-black uppercase text-red-500">No data found for ${title}</div>`;
    }

    // 2. Add (p.value || 0) to prevent the "Missing Networth" / NaN issue
    const totalInv = platforms.reduce((acc, p) => acc + (Number(p.invested) || 0), 0);
    const totalVal = platforms.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
    
    const totalGain = totalInv > 0 
        ? (((totalVal - totalInv) / totalInv) * 100).toFixed(2) 
        : "0.00";

    return `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">${title}</h2>
            <button onclick="ui.closeDrawer()" class="bg-black text-white px-5 py-2 rounded-full font-black uppercase text-xs">Back</button>
        </div>
        
        <div class="grid grid-cols-2 gap-3 md:gap-4 mb-6">
            <div class="funky-card p-4 bg-white border-2 border-black">
                <p class="text-[9px] font-black uppercase text-slate-400">Total Invested</p>
                <p class="text-lg font-black stat-val">₹${Math.round(totalInv).toLocaleString()}</p>
            </div>
            <div class="funky-card p-4 c-gold border-2 border-black bg-[#FFD700]">
                <p class="text-[9px] font-black uppercase">Current Value</p>
                <p class="text-lg font-black stat-val">₹${Math.round(totalVal).toLocaleString()}</p>
                <div class="up-badge mt-1 text-[9px] font-black">+${totalGain}%</div>
            </div>
        </div>

        <div class="space-y-3">
            ${platforms.map(p => `
                <div class="funky-card p-4 flex justify-between items-center bg-white border-2 border-black">
                    <div>
                        <p class="font-black italic text-base uppercase">${p.name}</p>
                        <p class="text-[9px] font-bold text-slate-400 uppercase">P&L: ${p.gain}%</p>
                    </div>
                    <div class="text-right">
                        <p class="font-black text-lg stat-val">₹${Math.round(p.value).toLocaleString()}</p>
                        <p class="text-[9px] font-bold opacity-30 uppercase">Cost: ₹${Math.round(p.invested).toLocaleString()}</p>
                    </div>
                </div>
            `).join('')}
        </div>`;
}
