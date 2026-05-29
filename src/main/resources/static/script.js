// --- CONSTANTS ---
const API_BASE = "/api";

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
            document.getElementById('signup-user').value = '';
            document.getElementById('signup-pin').value = '';
            document.getElementById('signup-bal').value = '';
            document.getElementById('signup-goal').value = '';
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
        document.getElementById('login-user').value = '';
        document.getElementById('login-pin').value = '';
        ui.notify("LOGGED OUT", "success");
    }
};

// --- TRANSACTION LOGIC ---
const tx = {
    async submitQuick(type) {
        const inputId = type === 'DEPOSIT' ? 'quick-dep' : 'quick-with';
        const amount = document.getElementById(inputId).value;

        if (!amount || parseFloat(amount) <= 0) {
            ui.notify("Please enter a valid amount");
            return;
        }

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
        if (!currentUserData) return;
        
        document.getElementById('balance-display').innerText = `$${currentUserData.balance.toFixed(2)}`;
        document.getElementById('goal-display').innerText = `$${currentUserData.savingsGoal.toFixed(2)}`;
        document.getElementById('progress-display').innerText = `${currentUserData.goalProgress.toFixed(1)}%`;

        // Fetch insights
        try {
            const res = await fetch(`${API_BASE}/user/insights`);
            const insights = await res.json();
            document.getElementById('total-deposits').innerText = `$${insights.totalDeposits.toFixed(2)}`;
            document.getElementById('total-withdrawals').innerText = `$${insights.totalWithdrawals.toFixed(2)}`;
        } catch (e) {
            console.error("Failed to fetch insights:", e);
        }
    },

    renderLedger() {
        const tbody = document.getElementById('tx-ledger');
        if (!currentUserData || currentUserData.transactionHistory.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--on-surface-variant);">No transactions yet</td></tr>';
            return;
        }

        tbody.innerHTML = currentUserData.transactionHistory.map(tx => `
            <tr>
                <td>${tx.type}</td>
                <td>$${tx.amount.toFixed(2)}</td>
                <td>$${tx.balanceAfter.toFixed(2)}</td>
                <td>${new Date(tx.timestamp).toLocaleString()}</td>
            </tr>
        `).join('');
    },

    notify(message, type = "error") {
        const notif = document.getElementById('notification');
        notif.innerText = message;
        notif.style.background = type === "success" ? "var(--success)" : "var(--error)";
        notif.style.display = 'block';
        setTimeout(() => notif.style.display = 'none', 3000);
    }
};

// --- GOAL UPDATE HANDLER ---
async function updateGoalHandler() {
    const newGoal = document.getElementById('new-goal').value;
    if (!newGoal || parseFloat(newGoal) < 0) {
        ui.notify("Please enter a valid goal");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/user/update-goal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goal: newGoal })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        currentUserData = data;
        await ui.updateUI();
        document.getElementById('new-goal').value = '';
        ui.notify("GOAL UPDATED SUCCESSFULLY", "success");
    } catch (e) {
        ui.notify(e.message);
    }
}

