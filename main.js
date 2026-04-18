/* main.js */

import { SHEET_URL, findValue, cleanNum } from './utils.js?v=1.1.4';
import { renderAssetCard, renderDrilldown } from './components.js?v=1.1.4';

console.log(">>> ENGINE START: Edge has cleared the imports!");

window.vaultState = { gold: [] };

// THE FACTORY: This finds sub-assets (like Gold) and maps them to standard names
function getAssetGroup(data, subCategoryName) {
    return data.filter(item => {
        const val = String(findValue(item, "Sub-Category") || "").toLowerCase();
        return val.includes(subCategoryName.toLowerCase().trim());
    }).map(item => ({
        name: findValue(item, "Platform") || "Unknown",
        invested: cleanNum(findValue(item, "Investments")),
        value: cleanNum(findValue(item, "Portfolio Valuation")),
        gain: cleanNum(findValue(item, "Profit & Loss"))
    }));
}

async function fetchNamiData() {
    const statusEl = document.getElementById('status-text');
    try {
        const response = await fetch(SHEET_URL);
        const fullData = await response.json();
        
        // Tab 1: Live Data
        const dashboardData = fullData.dashboard || [];
        // Tab 2: Historical Data
        const snapshotData = fullData.snapshot || [];
        
        // 1. Populate the Vault for Drilldowns
        window.vaultState.gold = getAssetGroup(dashboardData, "Digital Gold");

        // 2. Calculate Live Totals from Dashboard Tab
        let currentTotal = 0;
        let categorySums = {};

        dashboardData.forEach(item => {
            // CRITICAL: Pulling from "Portfolio Valuation" per your screenshot
            const val = findValue(item, "Portfolio Valuation");
            const amt = cleanNum(val);
            if (amt > 0) {
                currentTotal += amt;
                const cat = String(findValue(item, "Category") || "Misc").trim();
                categorySums[cat] = (categorySums[cat] || 0) + amt;
            }
        });

        // 3. Update the Net Worth Text
        const networthEl = document.getElementById('total-networth');
        if (networthEl) {
            networthEl.innerText = "$" + Math.round(currentTotal).toLocaleString();
        }

        // 4. Render the UI Cards
        document.getElementById('matrix-container').innerHTML = dashboardData
            .map((item, index) => renderAssetCard(item, index))
            .join('');

        // 5. Render Charts: Passing snapshot data and the calculated live total
        if (window.Chart) {
            renderCharts(categorySums, snapshotData, currentTotal);
        }

        statusEl.innerText = "System Live ⚡";
        statusEl.style.backgroundColor = "#22c55e"; 
    } catch (error) {
        console.error("Fetch/Render Error:", error);
        statusEl.innerText = "Sync Failed ❌";
    }
}

// Global UI Controller
window.ui = {
    openDrilldown: (sub) => {
        const drawer = document.getElementById('detail-drawer');
        const content = document.getElementById('drawer-content');
        const subLower = sub.toLowerCase().trim();
        
        if (subLower === "digital gold") {
            content.innerHTML = renderDrilldown("Bullion Vault", window.vaultState.gold);
        } 

        drawer.classList.remove('opacity-0', 'pointer-events-none');
        content.style.transform = "translateY(0)";
    },
    closeDrawer: () => {
        document.getElementById('detail-drawer').classList.add('opacity-0', 'pointer-events-none');
        document.getElementById('drawer-content').style.transform = "translateY(100%)";
    }
};

function renderCharts(catData, snapData, liveTotal) {
    // A. Doughnut Chart (Asset Distribution)
    const catCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(catCtx, {
        type: 'doughnut',
        data: { 
            labels: Object.keys(catData), 
            datasets: [{ 
                data: Object.values(catData), 
                backgroundColor: ['#FF00FF', '#00FFFF', '#FFD700', '#39FF14', '#FF5F1F', '#8A2BE2', '#FF004D'], 
                borderColor: '#000', 
                borderWidth: 4 
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { position: 'bottom', labels: { font: { weight: 'bold', family: 'Outfit', size: 10 }, color: '#000' } } } 
        }
    });

    // B. Line Chart (Wealth Progression)
    const progCtx = document.getElementById('progressChart').getContext('2d');
    
    // Process Snapshot Tab data
    const grouped = snapData.reduce((acc, curr) => {
        const rawDate = String(findValue(curr, "Date") || "").trim();
        const amt = cleanNum(findValue(curr, "Amount")); // Looking for "Amount" in Snapshot tab
        if (rawDate) {
            const date = new Date(rawDate);
            const cleanDate = isNaN(date.getTime()) ? rawDate : 
                `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()]} ${date.getFullYear().toString().substr(-2)}`;
            acc[cleanDate] = (acc[cleanDate] || 0) + amt;
        }
        return acc;
    }, {});
    
    let labels = Object.keys(grouped);
    let values = Object.values(grouped);
    
    // C. THE LIVE INJECTION: Add the dashboard total as the final point
    labels.push("Live");
    values.push(liveTotal);
    
    new Chart(progCtx, {
        type: 'line',
        data: { 
            labels: labels, 
            datasets: [{ 
                data: values, 
                borderColor: '#000', 
                borderWidth: 4, 
                pointRadius: 5, 
                pointBackgroundColor: '#FF00FF', 
                tension: 0.3, 
                fill: false 
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { 
                y: { 
                    ticks: { 
                        font: { size: 10, family: 'Space Mono' }, 
                        callback: v => '$' + Math.round(v/1000) + 'k' 
                    } 
                } 
            }, 
            plugins: { legend: { display: false } } 
        }
    });
}

// Initial Kick-off
fetchNamiData();
