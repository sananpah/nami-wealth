/* main.js */

import { SHEET_URL, findValue, cleanNum } from './utils.js?v=1.1.6';
import { renderAssetCard, renderDrilldown } from './components.js?v=1.1.6';

console.log(">>> ENGINE START: Logic v1.1.6 Activated");

window.vaultState = { gold: [] };

function getAssetGroup(data, subCategoryName) {
    return data.filter(item => {
        const val = String(findValue(item, "Sub-Category") || "").toLowerCase();
        return val.includes(subCategoryName.toLowerCase().trim());
    }).map(item => ({
        name: findValue(item, "Platform") || "Unknown",
        invested: cleanNum(findValue(item, "Investments")),
        value: cleanNum(findValue(item, "Portfolio Valuation")),
        gain: cleanNum(findValue(item, "Profit & Loss %") || findValue(item, "Profit & Loss"))
    }));
}

async function fetchNamiData() {
    const statusEl = document.getElementById('status-text');
    try {
        const response = await fetch(SHEET_URL);
        const fullData = await response.json();
        
        const dashboardData = fullData.dashboard || [];
        const snapshotData = fullData.snapshot || [];
        
        // 1. Populate the Vault
        window.vaultState.gold = getAssetGroup(dashboardData, "Digital Gold");

        // Debug check: Open your console (F12) to see if this has 2 items
        console.log("Vault State Loaded:", window.vaultState.gold);
        
        // 2. Calculate Live Totals (With Fallback for Headers)
        let currentTotal = 0;
        let categorySums = {};

        dashboardData.forEach(item => {
            // Fuzzy Header Check: Search for "Portfolio Valuation", fallback to "Amount"
            const rawVal = findValue(item, "Portfolio Valuation") || findValue(item, "Amount") || 0;
            const amt = cleanNum(rawVal);
            
            if (amt > 0) {
                currentTotal += amt;
                const cat = String(findValue(item, "Category") || "Misc").trim();
                categorySums[cat] = (categorySums[cat] || 0) + amt;
            }
        });

        // 3. Update UI Elements
        const networthEl = document.getElementById('total-networth');
        if (networthEl) {
            networthEl.innerText = "$" + Math.round(currentTotal).toLocaleString();
        }

        const matrix = document.getElementById('matrix-container');
        if (matrix) {
            matrix.innerHTML = dashboardData.map((item, index) => renderAssetCard(item, index)).join('');
        }

        // 4. Render Charts with the calculated Live Total
        if (window.Chart) {
            renderCharts(categorySums, snapshotData, currentTotal);
        }

        statusEl.innerText = "System Live ⚡";
        statusEl.style.backgroundColor = "#22c55e"; 
    } catch (error) {
        console.error("Critical Render Error:", error);
        statusEl.innerText = "Sync Failed ❌";
    }
}

// Global UI Controller
window.ui = {
    openDrilldown: (sub) => {
        const content = document.getElementById('drawer-content');
        const subLower = sub.toLowerCase().trim();
        if (subLower === "digital gold") {
            content.innerHTML = renderDrilldown("Bullion Vault", window.vaultState.gold);
        } 
        document.getElementById('detail-drawer').classList.remove('opacity-0', 'pointer-events-none');
        content.style.transform = "translateY(0)";
    },
    closeDrawer: () => {
        document.getElementById('detail-drawer').classList.add('opacity-0', 'pointer-events-none');
        document.getElementById('drawer-content').style.transform = "translateY(100%)";
    }
};

// Global Chart instances to prevent "Canvas in use" errors
let catChartInstance = null;
let progChartInstance = null;

function renderCharts(catData, snapData, liveTotal) {
    // A. Doughnut Chart
const catCtx = document.getElementById('categoryChart').getContext('2d');
    if (catChartInstance) catChartInstance.destroy();
    
    catChartInstance = new Chart(catCtx, {
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
            // 1. Add padding to the bottom so legends aren't cut off
            layout: {
                padding: {
                    bottom: 25,
                    top: 10
                }
            },
            plugins: { 
                legend: { 
                    display: true, // 2. Force display to true
                    position: 'bottom', 
                    align: 'center',
                    labels: { 
                        // 3. Style the legends to be bold and clean
                        font: { 
                            weight: '900', 
                            family: 'Outfit', 
                            size: 10 
                        }, 
                        color: '#000',
                        padding: 15,
                        usePointStyle: true, // Makes legend markers circles instead of squares
                        boxWidth: 10
                    } 
                } 
            } 
        }
    });

    // B. Line Chart
    const progCtx = document.getElementById('progressChart').getContext('2d');
    if (progChartInstance) progChartInstance.destroy();

    const grouped = snapData.reduce((acc, curr) => {
        const rawDate = String(findValue(curr, "Date") || "").trim();
        const amt = cleanNum(findValue(curr, "Amount"));
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
    
    // Inject Live Networth as the final point
    labels.push("Live");
    values.push(liveTotal);
    
    progChartInstance = new Chart(progCtx, {
        type: 'line',
        data: { 
            labels: labels, 
            datasets: [{ data: values, borderColor: '#000', borderWidth: 4, pointRadius: 5, pointBackgroundColor: '#FF00FF', tension: 0.3, fill: false }] 
        },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            scales: { y: { ticks: { callback: v => '$' + Math.round(v/1000) + 'k' } } },
            plugins: { legend: { display: false } }
        }
    });
}

fetchNamiData();
