/* components.js */

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
    
    const firstItem = platforms[0];
    const symbol = firstItem.currencySymbol || "₹";
    const label = symbol === "₹" ? "INR" : "SGD";

    return `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg md:text-2xl font-black italic uppercase italic nami-header">${title}</h2>
            <button onclick="ui.closeDrawer()" class="bg-black text-white px-4 py-2 rounded-full text-[10px] font-black uppercase shadow-[3px_3px_0px_#FF00FF]">Back</button>
        </div>

        <div class="grid grid-cols-2 gap-2 md:gap-4 mb-6">
            <div class="p-2 md:p-4 bg-white border-2 md:border-4 border-black shadow-[3px_3px_0px_#000]">
                <p class="text-[7px] md:text-[9px] font-black uppercase opacity-50">Inv. (${label})</p>
                <p class="text-base md:text-2xl font-black stat-val">${symbol}${Math.round(totalInv).toLocaleString()}</p>
            </div>
            <div class="p-2 md:p-4 bg-[#FFD700] border-2 md:border-4 border-black shadow-[3px_3px_0px_#000]">
                <p class="text-[7px] md:text-[9px] font-black uppercase">Val. (${label})</p>
                <p class="text-base md:text-2xl font-black stat-val">${symbol}${Math.round(totalVal).toLocaleString()}</p>
            </div>
        </div>

        <div class="space-y-3 pb-10">
            ${platforms.map(p => {
                const cleanName = p.name.trim();
                const logoUrl = `logo/logo_${cleanName}.png`; 
                
                return `
                <div class="p-3 md:p-4 flex flex-wrap md:flex-nowrap justify-between items-center bg-white border-2 md:border-4 border-black shadow-[4px_4px_0px_#000] gap-2">
                    
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 md:w-14 md:h-14 bg-white border-2 border-black flex-shrink-0 flex items-center justify-center p-1">
                            <img src="${logoUrl}" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
                                 class="w-full h-full object-contain" 
                                 alt="${cleanName}">
                            <span class="hidden font-black text-[8px] uppercase text-center leading-none">${cleanName}</span>
                        </div>
                        
                        <div class="min-w-0">
                            <p class="font-black text-xs md:text-base uppercase truncate">${cleanName}</p>
                            <div class="flex gap-1 mt-1">
                                <span class="text-[8px] font-black bg-[#39FF14] px-1 border border-black">ABS:${Math.round(p.absGain)}%</span>
                                <span class="text-[8px] font-black bg-[#00FFFF] px-1 border border-black">XIRR:${Math.round(p.xirr)}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ml-auto text-right">
                        <p class="text-[7px] md:text-[9px] font-black opacity-30 uppercase leading-none">Valuation</p>
                        <p class="font-black stat-val text-lg md:text-2xl">${p.currencySymbol}${Math.round(p.value).toLocaleString()}</p>
                    </div>

                </div>
            `}).join('')}
        </div>`;
}
