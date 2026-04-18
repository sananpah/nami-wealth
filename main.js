/* main.js */

// Use absolute relative path for Edge consistency - Incrementing version to 10.6.5
import { SHEET_URL, findValue, cleanNum } from './utils.js?v=1.1.2';
import { renderAssetCard, renderDrilldown } from './components.js?v=1.1.2';

console.log(">>> ENGINE START: Edge has cleared the imports!");

window.vaultState = { gold: [] };

// THE FACTORY: This function handles ANY asset group you add in the future
function getAssetGroup(data, subCategoryName) {
    return data.filter(item => {
        const val = String(findValue(item, "Sub-Category") || "").toLowerCase();
        return val.includes(subCategoryName.toLowerCase());
    }).map(item => ({
        name: findValue(item, "Platform") || "Unknown",
        invested: cleanNum(findValue(item, "Investments")),
        value: cleanNum(findValue(item, "Portfolio Valuation")),
        gain: cleanNum(findValue(item, "Profit & Loss %"))
    }));
}

async function fetchNamiData() {
    const statusEl = document.getElementById('status-text');
    try {
        const response = await fetch(SHEET_URL);
        const fullData = await response.json();
        const dashboardData = fullData.dashboard || [];
        const snapshotData = fullData.snapshot || [];
        
        // 1. Map Digital Gold
        window.vaultState.gold = getAssetGroup(dashboardData, "Digital Gold");

        // --- Render Logic ---
        let currentTotal = 0;
        let categorySums = {};

        dashboardData.forEach(item => {
            const amt = cleanNum(findValue(item, "Portfolio Valuation"));
            if (amt > 0) {
                currentTotal += amt;
                const cat = String(findValue(item, "Category") || "Misc").trim();
                categorySums[cat] = (categorySums[cat] || 0) + amt;
            }
        });

        document.getElementById('total-networth').innerText = "$" + Math.round(currentTotal).toLocaleString();
        document.getElementById('matrix-container').innerHTML = dashboardData.map((item, index) => renderAssetCard(item, index)).join('');
        
        // --- CHART LOGIC: This MUST be called here ---
        if (window.Chart) {
            renderCharts(categorySums, snapshotData, currentTotal);
        }

        statusEl.innerText = "System Live ⚡";
        statusEl.style.backgroundColor = "#22c55e"; 
    } catch (error) { 
        statusEl.innerText = "Sync Failed ❌";
        console.error("Fetch/Render Error:", error);
    }
}

// Global UI Controller
window.ui = {
    openDrilldown: (sub) => {
        const drawer = document.getElementById('detail-drawer');
        const content = document.getElementById('drawer-content');
        
        const subLower = sub.toLowerCase().trim();
        
        if (subLower === "digital gold") {
            content.innerHTML = renderDrilldown(window.vaultState.gold);
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

// Initial Kick-off
fetchNamiData();
