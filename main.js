/* main.js */
import { SHEET_URL, BUILD_VERSION, findValue, cleanNum } from './utils.js';
import { renderAssetCard, renderGoldDrilldown } from './components.js';

window.vaultState = { gold: [] };

window.onload = function() {
    const buildTag = document.getElementById('build-tag');
    if (buildTag) buildTag.innerText = `BUILD: ${BUILD_VERSION}`;
    fetchNamiData();
};

async function fetchNamiData() {
    const statusEl = document.getElementById('status-text');
    try {
        const response = await fetch(SHEET_URL);
        const fullData = await response.json();
        const dashboardData = fullData.dashboard || [];

        // Dynamic Sieve for Gold Platforms
        window.vaultState.gold = dashboardData.filter(item => {
            const subCat = String(findValue(item, "Sub-Category") || "").trim();
            return subCat.toLowerCase() === "digital gold";
        }).map(item => ({
            name: findValue(item, "Platform") || "Gold Asset",
            invested: cleanNum(findValue(item, "Investments")),
            value: cleanNum(findValue(item, "Portfolio Valuation")),
            gain: cleanNum(findValue(item, "Profit & Loss %"))
        }));

        let currentTotal = 0;
        dashboardData.forEach(item => {
            const amt = cleanNum(item.amount || item.Amount);
            if (amt > 0) currentTotal += amt;
        });

        document.getElementById('total-networth').innerText = "$" + Math.round(currentTotal).toLocaleString();
        document.getElementById('matrix-container').innerHTML = dashboardData.map((item, index) => renderAssetCard(item, index)).join('');
        
        statusEl.innerText = "System Live ⚡";
        statusEl.style.backgroundColor = "#22c55e"; 
    } catch (error) { 
        statusEl.innerText = "Sync Failed ❌";
        console.error(error);
    }
}

window.ui = {
    openDrilldown: (sub) => {
        const drawer = document.getElementById('detail-drawer');
        const content = document.getElementById('drawer-content');
        if (sub.toLowerCase().trim() === "digital gold") {
            content.innerHTML = renderGoldDrilldown(window.vaultState.gold);
        }
        drawer.classList.remove('opacity-0', 'pointer-events-none');
        content.style.transform = "translateY(0)";
    },
    closeDrawer: () => {
        document.getElementById('detail-drawer').classList.add('opacity-0', 'pointer-events-none');
        document.getElementById('drawer-content').style.transform = "translateY(100%)";
    }
};
