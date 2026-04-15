/* main.js */
import { renderAssetCard, renderGoldDrilldown } from './components.js';

const SHEET_URL = "https://script.google.com/macros/s/AKfycby4pyDQgIfmnNXP-wNFH3CCA_xaekozyNVbtH4MeLrNG8rZgO4NrLYa2q6oDmDlCaRPwQ/exec";
const MY_PIN = "1977";

// State Management
const state = {
    dashboard: [],
    snapshots: [],
    charts: { progress: null, category: null }
};

// Global UI Controller (Attached to window for HTML access)
window.ui = {
    checkPin: () => {
        const pin = document.getElementById('pin-field').value;
        if (pin === MY_PIN) {
            document.getElementById('lock-screen').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            app.init();
        } else {
            document.getElementById('lock-error').innerText = "Access Denied";
        }
    },
    openDrilldown: (type) => {
        const drawer = document.getElementById('detail-drawer');
        const content = document.getElementById('drawer-content');
        if (type === "Digital Gold") {
            content.innerHTML = renderGoldDrilldown();
        } else {
            content.innerHTML = `<h2 class="text-2xl font-black italic uppercase">${type}</h2><p class="mt-4">Analysis coming soon...</p><button onclick="ui.closeDrawer()" class="mt-8 bg-black text-white px-8 py-3 rounded-full font-black">BACK</button>`;
        }
        drawer.classList.remove('opacity-0', 'pointer-events-none');
        content.style.transform = "translateY(0)";
    },
    closeDrawer: () => {
        const drawer = document.getElementById('detail-drawer');
        const content = document.getElementById('drawer-content');
        drawer.classList.add('opacity-0', 'pointer-events-none');
        content.style.transform = "translateY(100%)";
    }
};

const app = {
    async init() {
        try {
            const response = await fetch(SHEET_URL);
            const data = await response.json();
            state.dashboard = data.dashboard;
            state.snapshots = data.snapshot;
            this.render();
        } catch (e) { console.error("Sync Failed", e); }
    },
    render() {
        // ... include your category summation and total networth logic here ...
        // Then loop through state.dashboard:
        const container = document.getElementById('matrix-container');
        container.innerHTML = state.dashboard.map((item, idx) => renderAssetCard(item, idx)).join('');
        
        // Call Chart Inits...
    }
};
