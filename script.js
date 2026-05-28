// --- CONSTANTS ---
const API_BASE = "http://localhost:8080/api";

// --- STATE MANAGEMENT ---
let currentUserData = null;

// --- AUTH LOGIC ---
const auth = {
    async signup() {
        const username = document.getElementById('signup-user').value;
        const pin = document.getElementById('signup-pin').value;
        const balance = document.getElementById('signup-bal').value;
        const goal = document.getElementById('signup-goal').value;

        if (!username || pin.length !== 4) return ui.notify("INVALID INPUT PARAMETERS");

        try {
            const res = await fetch(`${API_BASE}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, pin, balance, goal })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            ui.notify("REGISTRATION SUCCESSFUL", "success");
            ui.toggleAuth(false);
        } catch (e) {
            ui.notify(e.message);
        }
    },

    async login() {
        const username = document.getElementById('login-user').value;
        const pin = document.getElementById('login-pin').value;

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, pin })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            currentUserData = data;
            ui.showDashboard();
            ui.notify("SESSION AUTHORIZED", "success");
        } catch (e) {
            ui.notify(e.message);
        }
    },

    async logout() {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
        currentUserData = null;
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('app-view').classList.add('hidden');
    }
};

// --- TRANSACTION LOGIC ---
const tx = {
    async submitQuick(type) {
        const inputId = type === 'DEPOSIT' ? 'quick-dep' : 'quick-with';
        const amount = document.getElementById(inputId).value;

        try {
            const res = await fetch(`${API_BASE}/tx/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, amount })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            currentUserData = data;
            await ui.updateUI();
            document.getElementById(inputId).value = '';
            ui.notify("TRANSACTION EXECUTED SUCCESSFULLY", "success");
        } catch (e) {
            ui.notify(e.message);
        }
    }
};

// --- UI CONTROLLER ---
const ui = {
    toggleAuth(toSignup) {
        document.getElementById('login-form').classList.toggle('hidden', toSignup);
        document.getElementById('signup-form').classList.toggle('hidden', !toSignup);
        document.getElementById('auth-title').innerText = toSignup ? "REGISTER" : "AUTHORIZE";
    },

    showDashboard() {
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('app-view').classList.remove('hidden');
        this.updateUI();
    },

    async showPage(id) {
        document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
        document.getElementById(`view-${id}`).classList.remove('hidden');
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.innerText.toLowerCase().includes(id)) item.classList.add('active');
        });

        if (id === 'transactions') this.renderLedger();
    },

    async updateUI() {
        // Fetch fresh data from backend
        const res = await fetch(`${API_BASE}/user/data`);
        if (res.ok) currentUserData = await res.json();

        const u = currentUserData;
        if (!u) return;

        document.getElementById('user-display').innerText = u.username.toUpperCase();
        document.getElementById('bal-text').innerText = `₹${u.balance.toLocaleString()}`;
        document.getElementById('goal-text').innerText = `₹${u.goal.toLocaleString()}`;
        
        const p = Math.min((u.balance / u.goal) * 100, 100);
        document.getElementById('progress-bar').style.width = `${p}%`;
        document.getElementById('progress-percent').innerText = `${p.toFixed(1)}%`;
        
        await this.generateInsights();
    },

    async setNewGoal() {
        const input = document.getElementById('new-goal-input');
        const goal = input.value;
        try {
            const res = await fetch(`${API_BASE}/user/update-goal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal })
            });
            if (!res.ok) throw new Error("Failed to update goal");

            await this.updateUI();
            input.value = '';
            ui.notify("SAVINGS TARGET UPDATED", "success");
        } catch (e) {
            ui.notify(e.message);
        }
    },

    renderLedger() {
        const txs = currentUserData.transactions;
        const body = document.getElementById('ledger-body');
        body.innerHTML = txs.slice().reverse().map(t => {
            const date = new Date(t.timestamp).toLocaleString();
            return `
                <tr>
                    <td>${date}</td>
                    <td><span class="trend-chip" style="${t.type === 'DEPOSIT' ? 'background: #8df9a8; color: #006d35;' : 'background: #ffdad6; color: #ba1a1a;'}">${t.type}</span></td>
                    <td>₹${t.amount.toLocaleString()}</td>
                    <td>₹${t.balance.toLocaleString()}</td>
                    <td style="color: var(--success); font-weight: 600;">CONFIRMED</td>
                </tr>
            `;
        }).join('');
    },

    async generateInsights() {
        const container = document.getElementById('smart-insights');
        try {
            const res = await fetch(`${API_BASE}/user/insights`);
            const data = await res.json();
            
            let html = '';
            if (data.status === 'ACHIEVED') {
                html = `<p style="color: var(--success);">[SYSTEM] ACHIEVED: TARGET GOAL REACHED.</p>`;
            } else {
                html = `<p>[SUMMARY] DEFICIT: ₹${data.needed.toLocaleString()} REMAINING. </p>`;
                if (data.status === 'ON_TRACK') {
                    html += `<p>[PREDICTION] TARGET REACHED IN APPROX ${data.cycles} CYCLES.</p>`;
                } else {
                    html += `<p>[ALERT] ZERO SAVINGS VELOCITY DETECTED. GOAL AT RISK.</p>`;
                }
            }
            if (data.highFrequency) {
                html += `<p style="color: var(--warning); margin-top: 8px;">[WARNING] HIGH WITHDRAWAL FREQUENCY DETECTED IN RECENT LOGS.</p>`;
            }
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = "Error loading insights.";
        }
    },

    notify(msg, type = "error") {
        const toast = document.getElementById('toast');
        toast.innerText = msg;
        toast.style.background = type === "success" ? "var(--success)" : "var(--primary)";
        if (type === "warning") toast.style.background = "var(--warning)";
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    }
};
