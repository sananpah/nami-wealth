/* main.js - v10.5.5 (Exact Header Mapping) */
import { renderAssetCard, renderGoldDrilldown } from './components.js';

const SHEET_URL = "https://script.google.com/macros/s/AKfycby4pyDQgIfmnNXP-wNFH3CCA_xaekozyNVbtH4MeLrNG8rZgO4NrLYa2q6oDmDlCaRPwQ/exec";
const BUILD_VERSION = "v10.5.5";

window.vaultState = { gold: [] };

window.onload = function() {
    const buildTag = document.getElementById('build-tag');
    if (buildTag) buildTag.innerText = `BUILD: ${BUILD_VERSION}`;
    fetchNamiData();
};

// Helper to scrub Excel formatting
function cleanNum(val) {
    if (val === undefined || val === null || val === "") return 0;
    return parseFloat(String(val).replace(/[₹$,%\s]/g, '').replace(/,/g, '')) || 0;
}

async function fetchNamiData() {
    const statusEl = document.getElementById('status-text');
    try {
        const response = await fetch(SHEET_URL);
        const fullData = await response.json();
        const dashboardData = fullData.dashboard || [];
        const snapshotData = fullData.snapshot || [];

        // Mapping Digital Gold using your EXACT headers
        window.vaultState.gold = dashboardData.filter(item => {
            const subCat = String(item["Sub-Category"] || "").trim();
            return subCat === "Digital Gold";
        }).map(item => ({
            name: item["Platform"] || "Gold Asset",
            invested: cleanNum(item["Investments"]),
            value: cleanNum(item["Portfolio Valuation"]),
            gain: cleanNum(item["Profit & Loss %"])
        }));

        let currentTotal = 0;
        let categorySums = {};

        dashboardData.forEach(item => {
            const amt = cleanNum(item.amount);
            if (amt > 0) {
                currentTotal += amt;
                const cat = String(item.Category || item.category || "Misc").trim();
                if (cat && cat !== "undefined") categorySums[cat] = (categorySums[cat] || 0) + amt;
            }
        });

        document.getElementById('total-networth').innerText = "$" + Math.round(currentTotal).toLocaleString();
        const container = document.getElementById('matrix-container');
        if (container) container.innerHTML = dashboardData.map((item, index) => renderAssetCard(item, index)).join('');
        
        if (typeof Chart !== 'undefined') renderCharts(categorySums, snapshotData, currentTotal);
        
        calculateGrowth(snapshotData, currentTotal);
        statusEl.innerText = "System Live ⚡";
        statusEl.style.backgroundColor = "#22c55e"; 
    } catch (error) { 
        console.error("Fetch Error:", error); 
        statusEl.innerText = "Sync Failed ❌";
    }
}

window.ui = {
    openDrilldown: (sub) => {
        const drawer = document.getElementById('detail-drawer');
        const content = document.getElementById('drawer-content');
        if (sub === "Digital Gold") {
            content.innerHTML = renderGoldDrilldown(window.vaultState.gold);
        } else {
            content.innerHTML = `<div class="p-10 text-center font-black uppercase">${sub} Hub Coming Soon</div>`;
        }
        drawer.classList.remove('opacity-0', 'pointer-events-none');
        content.style.transform = "translateY(0)";
    },
    closeDrawer: () => {
        document.getElementById('detail-drawer').classList.add('opacity-0', 'pointer-events-none');
        document.getElementById('drawer-content').style.transform = "translateY(100%)";
    }
};

function calculateGrowth(snapshotData, currentTotal) {
    if (!snapshotData || snapshotData.length === 0) return;
    const grouped = snapshotData.reduce((acc, curr) => {
        const dateKey = String(curr.Date || curr.date).trim();
        const amt = cleanNum(curr.Amount || curr.amount);
        if (dateKey && dateKey !== "undefined") acc[dateKey] = (acc[dateKey] || 0) + amt;
        return acc;
    }, {});
    const dates = Object.keys(grouped);
    const lastTotal = grouped[dates[dates.length - 1]];
    const percent = lastTotal > 0 ? (((currentTotal - lastTotal) / lastTotal) * 100).toFixed(1) : 0;
    const badge = document.getElementById('growth-badge');
    badge.innerHTML = currentTotal >= lastTotal ? `<span class="up-badge">▲ +${percent}%</span>` : `<span class="down-badge">▼ ${percent}%</span>`;
}

function renderCharts(catData, snapData, total) {
    const catCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(catCtx, {
        type: 'doughnut',
        data: { labels: Object.keys(catData), datasets: [{ data: Object.values(catData), backgroundColor: ['#FF00FF', '#00FFFF', '#FFD700', '#39FF14', '#FF5F1F', '#8A2BE2', '#FF004D'], borderColor: '#000', borderWidth: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { weight: 'bold', family: 'Outfit', size: 10 }, color: '#000' } } } }
    });

    const progCtx = document.getElementById('progressChart').getContext('2d');
    const grouped = snapData.reduce((acc, curr) => {
        const rawDate = String(curr.Date || curr.date || "").trim();
        const amt = cleanNum(curr.Amount || curr.amount);
        if (rawDate && rawDate !== "undefined") {
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
