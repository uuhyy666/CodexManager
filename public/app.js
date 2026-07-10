const accountsGrid = document.getElementById('accountsGrid');
const addAccountBtn = document.getElementById('addAccountBtn');
const refreshBtn = document.getElementById('refreshBtn');
const autoRefreshBtn = document.getElementById('autoRefreshBtn');
const shutdownBtn = document.getElementById('shutdownBtn');
const addModal = document.getElementById('addModal');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const confirmAddBtn = document.getElementById('confirmAddBtn');
const accountNameInput = document.getElementById('accountName');
const countdownDisplay = document.getElementById('countdownDisplay');

// Auto refresh state
let autoRefreshInterval = null;
let cachedAccounts = [];

// Base64 short notification sound (Beep)
const notifySound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'+Array(100).join('A'));

// Request Notification Permission on load
if ("Notification" in window) {
    Notification.requestPermission();
}

function playSound() {
    try {
        notifySound.play().catch(e => console.log('Audio play blocked:', e));
    } catch (e) {}
}

function showNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: 'https://cdn-icons-png.flaticon.com/512/4712/4712038.png' });
    }
    playSound();
}

// Time parsing logic
function parseCodexTime(timeStr) {
    if (!timeStr || timeStr === 'Unknown' || timeStr === 'Needs refill') return null;
    let cleanStr = timeStr.replace(/(st|nd|rd|th),/i, ',');
    
    if (/^\d{1,2}:\d{2}\s+(AM|PM)$/i.test(cleanStr)) {
        const today = new Date();
        const dateStr = today.toDateString() + ' ' + cleanStr;
        let d = new Date(dateStr);
        if (d < new Date()) d.setDate(d.getDate() + 1);
        return d;
    }
    
    const parsed = new Date(cleanStr);
    return isNaN(parsed.getTime()) ? null : parsed;
}

// Fetch accounts on load
async function fetchAccounts() {
    const isFirstLoad = accountsGrid.innerHTML.includes('loading-state') && cachedAccounts.length === 0;
    
    if (isFirstLoad) {
        accountsGrid.innerHTML = `
            <div class="loading-state">
                <i class="ri-loader-4-line spinner"></i>
                <p>Ładowanie kont (odpytywanie API Codex)...</p>
            </div>
        `;
    }
    
    try {
        const res = await fetch('/api/accounts');
        const accounts = await res.json();
        
        // Check if any account became active compared to previous state
        if (cachedAccounts.length > 0) {
            accounts.forEach(acc => {
                const oldAcc = cachedAccounts.find(a => a.id === acc.id);
                if (oldAcc && oldAcc.status && oldAcc.status.limitReached && acc.status && !acc.status.limitReached) {
                    showNotification('Konto dostępne!', `Konto ${acc.name} jest już gotowe do użycia.`);
                }
            });
        }
        
        cachedAccounts = accounts;
        renderAccounts(accounts);
        updateEarliestCountdown();
    } catch (e) {
        if (isFirstLoad) {
            accountsGrid.innerHTML = `
                <div class="loading-state" style="color: var(--error);">
                    <i class="ri-error-warning-line" style="font-size: 2rem;"></i>
                    <p>Błąd wczytywania. Upewnij się, że serwer działa.</p>
                </div>
            `;
        }
    }
}

function renderAccounts(accounts) {
    if (accounts.length === 0) {
        accountsGrid.innerHTML = `
            <div class="loading-state">
                <i class="ri-ghost-line" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Brak kont. Kliknij "Add Account" aby zacząć.</p>
            </div>
        `;
        return;
    }

    accountsGrid.innerHTML = accounts.map(acc => {
        let statusHtml = '';
        let detailsHtml = '';

        if (acc.status) {
            if (acc.status.limitReached === true) {
                const reason = acc.status.reason || "Limit Reached";
                const resetTimeObj = parseCodexTime(acc.status.resetTime);
                let polishTime = acc.status.resetTime;
                
                if (resetTimeObj) {
                    polishTime = resetTimeObj.toLocaleString('pl-PL', { 
                        timeZone: 'Europe/Warsaw',
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit' 
                    });
                }
                
                statusHtml = `<div class="status-badge status-limit"><i class="ri-timer-line"></i> ${escapeHtml(reason)}</div>`;
                detailsHtml = `<div class="status-details">
                    Oryginalnie: <strong>${escapeHtml(acc.status.resetTime)}</strong><br/>
                    Czas PL: <strong style="color:var(--text-main);">${polishTime || 'Nieznany'}</strong>
                </div>`;
            } else if (acc.status.limitReached === false) {
                statusHtml = `<div class="status-badge status-active"><i class="ri-checkbox-circle-line"></i> Active - No Limits</div>`;
                detailsHtml = `<div class="status-details">Konto gotowe do działania!</div>`;
            } else {
                statusHtml = `<div class="status-badge status-error"><i class="ri-error-warning-line"></i> Błąd</div>`;
                detailsHtml = `<div class="status-details">${escapeHtml(acc.status.error || 'Nieznany błąd')}</div>`;
            }
        } else {
            statusHtml = `<div class="status-badge status-error"><i class="ri-error-warning-line"></i> Status Nieznany</div>`;
        }

        return `
            <div class="account-card">
                <div class="card-header">
                    <div class="card-title">
                        <h3>${escapeHtml(acc.name)}</h3>
                        <span class="acc-id">ID: ${acc.id.substring(0, 8)}...</span>
                    </div>
                    <button class="delete-btn" onclick="deleteAccount('${acc.id}')" title="Usuń konto">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
                ${statusHtml}
                ${detailsHtml}
                <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
                    <button class="add-btn" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="activateAccount('${acc.id}')">
                        <i class="ri-login-circle-line"></i> Zaloguj w CMD
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateEarliestCountdown() {
    let earliest = null;
    let anyActive = false;

    cachedAccounts.forEach(acc => {
        if (acc.status && acc.status.limitReached === false) anyActive = true;
        if (acc.status && acc.status.limitReached === true) {
            const dt = parseCodexTime(acc.status.resetTime);
            if (dt) {
                if (!earliest || dt < earliest.time) earliest = { time: dt, name: acc.name };
            }
        }
    });

    if (anyActive) {
        countdownDisplay.innerHTML = `<i class="ri-checkbox-circle-fill"></i> Masz wolne konto, gotowe do pracy!`;
        countdownDisplay.style.color = 'var(--success)';
        return;
    }

    if (!earliest) {
        countdownDisplay.innerHTML = `Brak danych o czasie resetu`;
        countdownDisplay.style.color = 'var(--text-muted)';
        return;
    }

    const diffMs = earliest.time - new Date();
    if (diffMs <= 0) {
        countdownDisplay.innerHTML = `<i class="ri-refresh-line spinner"></i> Konto ${escapeHtml(earliest.name)} powinno być już dostępne. Odśwież!`;
        return;
    }

    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    countdownDisplay.innerHTML = `<i class="ri-time-line"></i> Najszybsze: ${escapeHtml(earliest.name)} za <strong style="color:var(--text-main)">${hours}h ${minutes}m</strong>`;
    countdownDisplay.style.color = 'var(--warning)';
}

// Interval for countdown ticking (every minute)
setInterval(updateEarliestCountdown, 60000);

// Global Activate feature
window.activateAccount = async (id) => {
    try {
        const res = await fetch(`/api/accounts/${id}/activate`, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            alert('Sukces! Konto zostało ustawione globalnie. Możesz otworzyć nowe okno CMD i używać codex.');
        } else {
            alert('Błąd: ' + data.error);
        }
    } catch (e) {
        alert('Błąd aktywacji konta.');
    }
};

// Escaping HTML to prevent XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Add Account flow
addAccountBtn.addEventListener('click', () => {
    addModal.classList.add('active');
    accountNameInput.focus();
});

cancelAddBtn.addEventListener('click', () => {
    addModal.classList.remove('active');
    accountNameInput.value = '';
});

confirmAddBtn.addEventListener('click', async () => {
    const name = accountNameInput.value.trim();
    if (!name) return alert('Podaj nazwę konta');

    confirmAddBtn.innerHTML = '<i class="ri-loader-4-line spinner" style="margin-right:0.5rem; display:inline-block; font-size:1rem;"></i> Otwieranie CMD...';
    confirmAddBtn.disabled = true;

    try {
        const res = await fetch('/api/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        
        if (res.ok) {
            addModal.classList.remove('active');
            accountNameInput.value = '';
            fetchAccounts();
        }
    } catch (e) {
        alert('Nie udało się dodać konta');
    } finally {
        confirmAddBtn.innerHTML = 'Authorize Login';
        confirmAddBtn.disabled = false;
    }
});

window.deleteAccount = async (id) => {
    if (!confirm('Na pewno chcesz usunąć to konto?')) return;
    
    try {
        await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
        fetchAccounts();
    } catch (e) {
        alert('Nie udało się usunąć konta');
    }
};

refreshBtn.addEventListener('click', () => {
    fetchAccounts();
});

autoRefreshBtn.addEventListener('click', () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        autoRefreshBtn.innerHTML = '<i class="ri-play-circle-line"></i> Włącz Auto-odświeżanie';
        autoRefreshBtn.style.background = '';
    } else {
        fetchAccounts();
        autoRefreshInterval = setInterval(fetchAccounts, 60000); // 1 minute
        autoRefreshBtn.innerHTML = '<i class="ri-pause-circle-line"></i> Zatrzymaj Auto-odświeżanie';
        autoRefreshBtn.style.background = 'rgba(16, 185, 129, 0.2)';
        autoRefreshBtn.style.color = 'var(--success)';
        autoRefreshBtn.style.borderColor = 'var(--success)';
    }
});

shutdownBtn.addEventListener('click', async () => {
    if (!confirm('Na pewno chcesz zamknąć całkowicie serwer? Aplikacja przestanie działać!')) return;
    try {
        await fetch('/api/shutdown', { method: 'POST' });
        document.body.innerHTML = '<div style="display:flex; height:100vh; align-items:center; justify-content:center; flex-direction:column; font-family:sans-serif; color:white; background:#0b0f19;"><h2>Serwer został wyłączony.</h2><p>Możesz bezpiecznie zamknąć tę kartę.</p></div>';
    } catch(e) {}
});

// Init
fetchAccounts();
