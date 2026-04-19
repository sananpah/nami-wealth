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
    if (!platforms || platforms.length === 0) return `<div class="p-10 text-center font-black">No Data</div>`;

    const totalInv = platforms.reduce((acc, p) => acc + p.invested, 0);
    const totalVal = platforms.reduce((acc, p) => acc + p.value, 0);
    
    // Check if the first platform is INR to set the header labels
    const firstItem = platforms[0];
    const symbol = firstItem.currencySymbol || "₹"; // Default to ₹ if INR
    const label = symbol === "₹" ? "INR" : "SGD";

    return `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black italic uppercase italic nami-header">${title}</h2>
            <button onclick="ui.closeDrawer()" class="bg-black text-white px-6 py-2 rounded-full text-xs font-black uppercase shadow-[4px_4px_0px_#FF00FF] active:translate-y-1 active:shadow-none transition-all">Back</button>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-8">
            <div class="p-4 bg-white border-4 border-black shadow-[6px_6px_0px_#000]">
                <p class="text-[9px] font-black uppercase opacity-40">Total Invested (${label})</p>
                <p class="text-2xl font-black stat-val">${symbol}${Math.round(totalInv).toLocaleString()}</p>
            </div>
            <div class="p-4 bg-[#FFD700] border-4 border-black shadow-[6px_6px_0px_#000]">
                <p class="text-[9px] font-black uppercase">Current Value (${label})</p>
                <p class="text-2xl font-black stat-val">${symbol}${Math.round(totalVal).toLocaleString()}</p>
            </div>
        </div>

        <div class="space-y-4">
            ${platforms.map(p => {
                const cleanName = p.name.trim();
                const logoUrl = `logo/logo_${cleanName}.png`; 
                
                return `
                <div class="p-4 flex justify-between items-center bg-white border-4 border-black shadow-[6px_6px_0px_#000]">
                    <div class="flex items-center gap-5">
                        <div class="w-14 h-14 bg-white border-2 border-black flex items-center justify-center p-1 shadow-[2px_2px_0px_#000] rounded-lg">
                            <img src="${logoUrl}" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
                                 class="w-full h-full object-contain" 
                                 alt="${cleanName}">
                            <span class="hidden font-black text-[10px] uppercase text-center">${cleanName}</span>
                        </div>
                        
                        <div>
                            <p class="font-black text-sm uppercase tracking-tight mb-2">${cleanName}</p>
                            <div class="flex gap-2">
                                <span class="text-[10px] font-black bg-[#39FF14] px-2 py-0.5 border-2 border-black">ABS: ${p.absGain}%</span>
                                <span class="text-[10px] font-black bg-[#00FFFF] px-2 py-0.5 border-2 border-black">XIRR: ${p.xirr}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-right">
                        <p class="text-[9px] font-black opacity-30 uppercase mb-1">Valuation</p>
                        <p class="font-black stat-val text-2xl">${p.currencySymbol}${Math.round(p.value).toLocaleString()}</p>
                    </div>
                </div>
            `}).join('')}
        </div>`;
}
