/* Nami Terminal Core Logic */
const SHEET_URL = "https://script.google.com/macros/s/AKfycby4pyDQgIfmnNXP-wNFH3CCA_xaekozyNVbtH4MeLrNG8rZgO4NrLYa2q6oDmDlCaRPwQ/exec";
let allocChart, progressChart;

const emojiMap = {
    "Digital Gold": "🌟",
    "Property(Fractional + Debt)": "🏢",
    "Invoice Discounting + Asset Leasing": "📄💸",
    "P2P Lending": "🤝💰",
    "Crypto": "₿",
    "ESOW": "👔",
    "Unit Trust": "🏦📊",
    "ETF": "🧺",
    "Stocks + Mutual Funds": "📈",
    "Bonds": "📜💵",
    "Cash": "💰",
    "Robo Portfolio": "🤖",
    "Savings & Investment Linked": "💼",
    "SRS Investments": "🛡️",
    "Investments": "🧓📈",
    "Non-Investments": "🧓💰"
};

// Start Fetching on Load
window.onload = () => {
    fetchNamiData();
};

async function fetchNamiData() {
    try {
        const response = await fetch(SHEET_URL);
        const fullData = await response.json();
        const dashboardData = fullData.dashboard || [];
        const snapshotData = fullData.snapshot || [];
        
        let currentTotal = 0;
        let categorySums = {};

        dashboardData.forEach(item => {
            const amt = parseFloat(String(item.amount).replace(/[$,%]/g, '')) || 0;
            if (amt > 0) {
                currentTotal += amt;
                const cat = String(item.Category || item.category || "Misc").trim();
                if (cat && cat !== "undefined") categorySums[cat] = (categorySums[cat] || 0) + amt;
            }
        });

        document.getElementById('total-networth').innerText = "$" + Math.round(currentTotal).toLocaleString();
        renderCards(dashboardData);
        renderDonut(categorySums);
        renderProgress(snapshotData, currentTotal);
        calculateGrowth(snapshotData, currentTotal);
        document.getElementById('status-text').innerText = "System Live ⚡";
    } catch (error) { 
        console.error("Fetch Error:", error); 
        document.getElementById('status-text').innerText = "Sync Error ❌";
    }
}

function renderCards(data) {
    const container = document.getElementById('matrix-container');
    container.innerHTML = ''; 
    data.forEach((item, index) => {
        const sub = String(item['sub-category'] || "Asset").trim();
        const amt = parseFloat(String(item.amount).replace(/[$,%]/g, '')) || 0;
        const cat = String(item.Category || "Misc").trim();
        let colorClass = "c-" + (((index % 11) + 1).toString().padStart(2, '0'));
        
        if (sub === "Digital Gold") colorClass = "c-gold";

        // Logic to make Digital Gold interactive
        const clickAction = (sub === "Digital Gold") ? `onclick="openGoldDrilldown()"` : "";
        const cursorStyle = (sub === "Digital Gold") ? "cursor-pointer active:scale-95 hover:brightness-110" : "";

        container.innerHTML += `
            <div ${clickAction} class="funky-card p-4 md:p-6 ${colorClass} ${cursorStyle} transition-all">
                <span class="card-emoji">${emojiMap[sub] || "💰"}</span>
                <div class="asset-label">${cat}</div>
                <br>
                <div class="font-black text-[10px] md:text-xs uppercase opacity-80">${sub}</div>
                <div class="text-xl md:text-4xl stat-val mt-2 md:mt-4">$${Math.round(amt).toLocaleString()}</div>
            </div>`;
    });
}

// --- DRILLDOWN COMPONENTS ---

function openGoldDrilldown() {
    const drawer = document.getElementById('detail-drawer');
    const content = document.getElementById('drawer-content');
    
    // Using Data from image_8e90c9.png
    const gold = {
        totalInv: 3851.07,
        totalVal: 4858.97,
        platforms: [
            { name: "Ultra", inv: 500, val: 820.25, gain: 64.05, theme: "border-yellow-500" },
            { name: "Gullak", inv: 3351.07, val: 4038.72, gain: 20.52, theme: "border-orange-500" }
        ]
    };

    content.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-black italic uppercase">Digital Gold Vault</h2>
            <button onclick="closeDrawer()" class="bg-black text-white px-6 py-2 rounded-full font-black uppercase text-xs">Close</button>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-8">
            <div class="funky-card p-4 bg-white"><p class="text-[10px] font-black text-gray-400 uppercase">Invested</p><p class="text-xl font-black stat-val">₹${Math.round(gold.totalInv).toLocaleString()}</p></div>
            <div class="funky-card p-4 c-gold"><p class="text-[10px] font-black uppercase">Net Worth</p><p class="text-xl font-black stat-val">₹${Math.round(gold.totalVal).toLocaleString()}</p></div>
        </div>

        <div class="space-y-4">
            <p class="text-xs font-black uppercase text-gray-500 ml-2">Platform Split</p>
            ${gold.platforms.map(p => `
                <div class="funky-card p-6 flex justify-between items-center bg-white border-l-[12px] ${p.theme}">
                    <div>
                        <h3 class="font-black text-xl italic uppercase">${p.name}</h3>
                        <p class="text-[10px] font-bold text-gray-400">COST: ₹${p.inv.toLocaleString()}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-black stat-val">₹${Math.round(p.val).toLocaleString()}</p>
                        <span class="up-badge mt-1">+${p.gain}%</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    drawer.classList.remove('opacity-0', 'pointer-events-none');
    content.style.transform = "translateY(0)";
}

function closeDrawer() {
    const drawer = document.getElementById('detail-drawer');
    const content = document.getElementById('drawer-content');
    drawer.classList.add('opacity-0', 'pointer-events-none');
    content.style.transform = "translateY(100%)";
}

// --- HELPER FUNCTIONS ---

function calculateGrowth(snapshotData, currentTotal) {
    if (!snapshotData || snapshotData.length === 0) return;
    const grouped = snapshotData.reduce((acc, curr) => {
        const dateKey = String(curr.Date || curr.date).trim();
        const amt = parseFloat(String(curr.Amount || curr.amount).replace(/[$,%]/g, '')) || 0;
        if (dateKey && dateKey !== "undefined") acc[dateKey] = (acc[dateKey] || 0) + amt;
        return acc;
    }, {});
    const dates = Object.keys(grouped);
    const lastTotal = grouped[dates[dates.length - 1]];
    const percent = lastTotal > 0 ? (((currentTotal - lastTotal) / lastTotal) * 100).toFixed(1) : 0;
    const badge = document.getElementById('growth-badge');
    badge.innerHTML = currentTotal >= lastTotal ? `<span class="up-badge">▲ +${percent}%</span>` : `<span class="down-badge">▼ ${percent}%</span>`;
}

function renderDonut(catData) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    if (allocChart) allocChart.destroy();
    allocChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: Object.keys(catData), datasets: [{ data: Object.values(catData), backgroundColor: ['#FF00FF', '#00FFFF', '#FFD700', '#39FF14', '#FF5F1F', '#8A2BE2', '#FF004D'], borderColor: '#000', borderWidth: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 10, font: { weight: 'bold', family: 'Outfit', size: 10 }, color: '#000' } } } }
    });
}

function renderProgress(snapshotData, currentTotal) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    const grouped = snapshotData.reduce((acc, curr) => {
        const rawDate = String(curr.Date || curr.date || "").trim();
        const amt = parseFloat(String(curr.Amount || curr.amount || 0).replace(/[$,%]/g, '')) || 0;
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
    values.push(currentTotal);
    if (progressChart) progressChart.destroy();
    progressChart = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: [{ data: values, borderColor: '#000', borderWidth: 4, pointRadius: 5, pointBackgroundColor: '#FF00FF', tension: 0.3, fill: false }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { font: { size: 10, family: 'Space Mono' }, callback: v => '$' + Math.round(v/1000) + 'k' } } }, plugins: { legend: { display: false } } }
    });
}
