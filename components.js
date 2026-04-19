/* components.js */

// Standard import - Ensuring we use v1.1.5 to match main.js and bypass cache
import { emojiMap, findValue, cleanNum } from './utils.js?v=1.1.6';

export function renderAssetCard(item, index) {
    const sub = String(findValue(item, "Sub-Category") || "Asset").trim();
    
    // DEFENSIVE FIX: Try "Portfolio Valuation", fallback to "Amount" if valuation is missing
    const rawAmt = findValue(item, "Portfolio Valuation") || findValue(item, "Amount");
    const amt = cleanNum(rawAmt);
    
    const cat = String(findValue(item, "Category") || "Misc").trim();
    
    // Dynamic styling
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

/* components.js */

export function renderDrilldown(title, platforms) {
    if (!platforms || platforms.length === 0) {
        return `<div class="p-10 text-center font-black uppercase text-red-500">No Data found</div>`;
    }

    // 1. Calculate totals
    const totalInv = platforms.reduce((acc, p) => acc + p.invested, 0);
    const totalVal = platforms.reduce((acc, p) => acc + p.value, 0);
    
    // 2. Determine display currency (Checking the first item as a reference)
    const displaySymbol = platforms[0].currencySymbol || "$";
    const currencyLabel = displaySymbol === "₹" ? "INR" : "SGD";

    return `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black italic uppercase">${title}</h2>
            <button onclick="ui.closeDrawer()" class="bg-black text-white px-4 py-2 rounded-full text-xs font-black uppercase">Back</button>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="p-4 bg-white border-2 border-black">
                <p class="text-[9px] font-black uppercase opacity-40">Total Invested (${currencyLabel})</p>
                <p class="text-lg font-black stat-val">${displaySymbol}${Math.round(totalInv).toLocaleString()}</p>
            </div>
            <div class="p-4 bg-[#FFD700] border-2 border-black shadow-[4px_4px_0px_#000]">
                <p class="text-[9px] font-black uppercase">Current Value (${currencyLabel})</p>
                <p class="text-lg font-black stat-val">${displaySymbol}${Math.round(totalVal).toLocaleString()}</p>
            </div>
        </div>

        <div class="space-y-3">
            ${platforms.map(p => {
                // Fix for Logo: logo_Ultra.png (Ensure no leading/trailing spaces)
                const cleanName = p.name.trim();
                const logoUrl = `logo/logo_${cleanName}.png`; 
                
                return `
                <div class="p-4 flex justify-between items-center bg-white border-2 border-black shadow-[4px_4px_0px_#000]">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 border-2 border-black bg-gray-50 flex items-center justify-center overflow-hidden">
                            <img src="${logoUrl}" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
                                 class="w-full h-full object-contain p-1" 
                                 alt="${cleanName}">
                            <span class="hidden font-black text-[10px] text-center px-1">${cleanName}</span>
                        </div>
                        
                        <div>
                            <p class="font-black text-xs uppercase mb-1">${cleanName}</p>
                            <div class="flex gap-2">
                                <span class="text-[9px] font-black bg-[#39FF14] px-1 border border-black">ABS: ${p.absGain}%</span>
                                <span class="text-[9px] font-black bg-[#00FFFF] px-1 border border-black">XIRR: ${p.xirr}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-right">
                        <p class="text-[8px] font-black opacity-40 uppercase">Valuation</p>
                        <p class="font-black stat-val text-xl">${p.currencySymbol}${Math.round(p.value).toLocaleString()}</p>
                    </div>
                </div>
            `}).join('')}
        </div>`;
}
