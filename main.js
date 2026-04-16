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
        const snapshotData = fullData.snapshot || [];

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
        let categorySums = {};

        dashboardData.forEach(item => {
            const amt = cleanNum(item.amount || item.Amount);
            if (amt > 0) {
                currentTotal += amt;
                const cat = String(findValue(item, "Category") || "Misc").trim();
                if (cat && cat !== "undefined") categorySums[cat] = (categorySums[cat] || 0) + amt;
            }
        });

        document.getElementById('total-networth').innerText = "$" + Math.round(currentTotal).toLocaleString();
        document.getElementById('matrix-container').innerHTML = dashboardData.map((item, index) => renderAssetCard(item, index)).join('');
        
        // Render Charts
        if (window.Chart) {
            renderCharts(categorySums, snapshotData, currentTotal);
        }
        
        statusEl.innerText = "System Live ⚡";
        statusEl.style.backgroundColor = "#22c55e"; 
    } catch (error) { 
        statusEl.innerText = "Sync Failed ❌";
        console.error(error);
    }
}

// Global UI Controller
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

function renderCharts(catData, snapData, total) {
    const catCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(catCtx, {
        type: 'doughnut',
        data: { labels: Object.keys(catData), datasets: [{ data: Object.values(catData), backgroundColor: ['#FF00FF', '#00FFFF', '#FFD700', '#39FF14', '#FF5F1F', '#8A2BE2', '#FF004D'], borderColor: '#000', borderWidth: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { weight: 'bold', family: 'Outfit', size: 10 }, color: '#000' } } } }
    });

    const progCtx = document.getElementById('progressChart').getContext('2d');
    const grouped = snapData.reduce((acc, curr) => {
        const rawDate = String(findValue(curr, "Date") || "").trim();
        const amt = cleanNum(findValue(curr, "Amount"));
        if (rawDate) {
            const date = new Date(rawDate);
            const cleanDate = isNaN(date.getTime()) ? rawDate : `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()]} ${date.getFullYear().toString().substr(-2)}`;
            acc[cleanDate] = (acc[cleanDate] || 0) + amt;
        }
        return acc;
    }, {});
    let labels = Object.keys(grouped);
    let values = Object.values(grouped);
    labels.push("Live");
    values.push(total);
    new Chart(progCtx, {
        type: 'line',
        data: { labels: labels, datasets: [{ data: values, borderColor: '#000', borderWidth: 4, pointRadius: 5, pointBackgroundColor: '#FF00FF', tension: 0.3, fill: false }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { font: { size: 10, family: 'Space Mono' }, callback: v => '$' + Math.round(v/1000) + 'k' } } }, plugins: { legend: { display: false } } }
    });
}
