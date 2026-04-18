/* components.js */

const version = window.BUILD_VERSION || "1.1.3";
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
    if (!platforms || platforms.length === 0) {
        return `<div class="p-10 text-center font-black uppercase text-red-500">No Data found for ${title}</div>`;
    }

    const totalInv = platforms.reduce((acc, p) => acc + (p.invested || 0), 0);
    const totalVal = platforms.reduce((acc, p) => acc + (p.value || 0), 0);

    return `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black italic uppercase italic">${title}</h2>
            <button onclick="ui.closeDrawer()" class="bg-black text-white px-4 py-2 rounded-full text-xs font-black uppercase">Back</button>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="p-4 bg-white border-2 border-black">
                <p class="text-[9px] font-black uppercase opacity-40">Invested</p>
                <p class="text-lg font-black stat-val">₹${Math.round(totalInv).toLocaleString()}</p>
            </div>
            <div class="p-4 bg-[#FFD700] border-2 border-black">
                <p class="text-[9px] font-black uppercase">Current Value</p>
                <p class="text-lg font-black stat-val">₹${Math.round(totalVal).toLocaleString()}</p>
            </div>
        </div>
        <div class="space-y-3">
            ${platforms.map(p => `
                <div class="p-4 flex justify-between items-center bg-white border-2 border-black">
                    <p class="font-black uppercase">${p.name}</p>
                    <p class="font-black stat-val">₹${Math.round(p.value).toLocaleString()}</p>
                </div>
            `).join('')}
        </div>`;
}
